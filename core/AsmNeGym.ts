import AsmCoreWasm from "@build_wasm/asm_core.js";
import AsmNeWorker from "@core/AsmNeWorker?worker";
import { AsmNeGymError, calculateOutputs } from "@core/AsmNeUtils";
import type { AsmNeModule, AsmNeGymTrainCriterion, WorkerInputData, WorkerOutputData } from "@core/types/AsmNeGym";

const WORKER_INIT_TIMEOUT = 2000;

export class AsmNeGym {
    private m_module: string;
    private m_algorithm: string;
    private m_hyperparameters: Array<number>;

    private m_threads = navigator?.hardwareConcurrency ?? 4;
    private m_population = "";

    private m_forceStop = false;

    constructor(module: string, algorithm: string, hyperparameters: Array<number>) {
        this.m_module = module;
        this.m_algorithm = algorithm;
        this.m_hyperparameters = hyperparameters;
    }

    public setModule(module: string) {
        this.m_module = module;
    }
    public setAlgorithm(algorithm: string): void {
        this.m_algorithm = algorithm;
    }
    public setHyperparameters(hyperparameters: Array<number>) {
        this.m_hyperparameters = hyperparameters;
    }
    public setThreads(threads: number) {
        this.m_threads = threads;
    }
    public getPopulation(): string {
        return this.m_population;
    }
    public setPopulation(population: string) {
        this.m_population = population;
    }

    private m_fitnessHistory: Array<number> = [];
    private m_bestGenome: { fitness: number, genome: string } = { fitness: -1, genome: "" };

    public getFitnessHistory() {
        return this.m_fitnessHistory;
    }
    public getBestGenome() {
        return this.m_bestGenome;
    }

    public async runBestGenome(canvas: HTMLCanvasElement): Promise<number> {
        if (!this.m_bestGenome.genome) throw new AsmNeGymError("Best genome is empty, run training first");
        return await this.runGenome(this.m_bestGenome.genome, canvas);
    }

    public async runGenome(genome: string, canvas: HTMLCanvasElement): Promise<number> {
        const { default: environmentRun }: { default: AsmNeModule } = await import(`../demo/modules/${this.m_module}.ts`);
        const { Vector, AsmCore } = await AsmCoreWasm();

        const phenotype = new AsmCore(this.m_algorithm);
        phenotype.buildGenome(genome);
        return environmentRun((inputs: Array<number>) => calculateOutputs(phenotype, Vector, inputs), canvas);
    }

    async forceStop() {
        this.m_forceStop = true;
    }

    async train(criterion: AsmNeGymTrainCriterion) {
        if (!criterion.fintess && !criterion.iterations && !criterion.time) throw new AsmNeGymError("No criterion were provided");

        this.m_forceStop = false;

        const { AsmCore, Vector } = await AsmCoreWasm();
        const core = new AsmCore(this.m_algorithm);
        
        // convert hyperparameters to vector
        const hyperparameters = new Vector();
        this.m_hyperparameters.forEach(value => hyperparameters.push_back(value));

        // create workers pool
        const workerPool: Array<Worker> = [];
        const initializePromises: Array<Promise<boolean>> = [];
        for (let i = 0; i < this.m_threads; i++) {
            const worker = new AsmNeWorker();
            initializePromises.push(new Promise(resolve => {
                // wait for worker initialization
                worker.addEventListener("message", (e: MessageEvent<boolean>) => resolve(true));
                // timeout for initialization
                setTimeout(() => resolve(true), WORKER_INIT_TIMEOUT);
            }));
            workerPool.push(worker);
        }

        // wait for all workers to initialize
        await Promise.all(initializePromises);

        let generation = this.m_population ? this.m_population : core.initialPopulation(hyperparameters);

        // population training
        let bestFitness = -1;
        const startTime = performance.now();
        let iteration = 0;
        while (true) {
            // calculate fintess of all genomes
            const fitness = await this.evaluateGeneration(workerPool, generation);
            const genomes = this.splitGeneration(generation);

            // reoder genomes by their fitness function (from best to worst)
            const combined = fitness.map((val, index) => ({ fitness: val, genome: genomes[index] })).sort((a, b) => a.fitness - b.fitness);

            // concat sorted genoems
            generation = combined.map(val => val.genome).join(this.getGenerationSplitCharacter());

            // update iteration number and population
            iteration++;
            this.m_population = generation;

            // note best fintess from generation
            bestFitness = combined[0].fitness;
            this.m_fitnessHistory.push(bestFitness);

            // save best gnome if better 
            if (bestFitness > this.m_bestGenome.fitness) {
                this.m_bestGenome = combined[0];
            }

            // end if criterion is met
            if (!this.checkCriterion(criterion, performance.now() - startTime, iteration, bestFitness) || this.m_forceStop) break;

            // create new generation
            const fintessVector = new Vector();
            fitness.forEach(value => fintessVector.push_back(value));
            generation = core.generateGeneration(hyperparameters, generation);
        }

        // clear up
        workerPool.forEach(worker => worker.terminate());
        core.delete();
        hyperparameters.delete();
    }

    private getGenerationSplitCharacter (): string {
        return this.m_population[0];
    }

    private checkCriterion(criterion: AsmNeGymTrainCriterion, time: number, iteration: number, fitness: number) {
        if (criterion.fintess && fitness > criterion.fintess) return true;
        if (criterion.time && time > criterion.time) return true;
        if (criterion.iterations && iteration > criterion.iterations) return true;
        return false;
    }

    private splitGeneration(generation: string): Array<string> {
        // first character of generation is meant to be genomes split character
        // split character cannot be present inside genome
        const splitCharacter = generation[0];
        generation = generation.substring(1);
        // rest of the generation is genomes with split character between them
        return generation.split(splitCharacter);
    }

    private async evaluateGeneration(workerPool: Array<Worker>, generation: string): Promise<Array<number>> {
        const genomes = this.splitGeneration(generation);

        // equally distrubite genomes to samoe batchSizte +/- batchOverflow (which mean some worker can have +1 genome)
        const batchSize = Math.ceil(genomes.length / workerPool.length);
        const batchOverflow = genomes.length % workerPool.length;

        const workerPromises: Array<Promise<WorkerOutputData>> = [];
        const result: Array<{
            index: number;
            fitness: Array<number>;
        }> = [];
        for (let i = 0; i < workerPool.length; i++) {
            // get portion of genomes which should be calculated by worker[i]
            const extraGenomes = i < batchOverflow ? 1 : 0;
            const workerGenomes = genomes.splice(0, batchSize + extraGenomes);

            // register promise and result callback
            const workerPromise = this.workerFitnessCalculation(workerPool[i], workerGenomes);
            workerPromise.then(fitness => result.push({ index: i, fitness }));
            workerPromises.push(workerPromise);
        }
        // wait for all workers to complete fintess calculation
        await Promise.all(workerPromises);

        // reoder by index and transofrm/reduce into one array
        return result.sort((a, b) => a.index - b.index).reduce(((acc, val) => acc.concat(val.fitness)), [] as Array<number>);
    }

    // resolve single genome batch
    private workerFitnessCalculation(worker: Worker, genomes: Array<string>): Promise<WorkerOutputData> {
        return new Promise(resolve => {
            worker.addEventListener("message", (e: MessageEvent<WorkerOutputData>) => resolve(e.data), { once: true });

            const workerInput: WorkerInputData = {
                module: this.m_module,
                algorithm: this.m_algorithm,
                genomes: genomes,
            };
            worker.postMessage(workerInput);
        })
    };
}