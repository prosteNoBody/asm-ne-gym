interface AsmClass {
    delete(): void;
}

export type AsmNeGymTrainCriterion = {
    fitness?: number;
    time?: number;
    iterations?: number;
};

export declare class AsmCore implements AsmClass {
    delete(): void;
    constructor(algorithm: string);
    initialPopulation(hyperparameters: Vector): string;
    generateGeneration(hyperparameters: Vector, fitness: Vector, population: string, seed: string): string;
    buildGenome(genome: string): number;
    forward(inputs: Vector): Vector;
}

export declare class Vector implements AsmClass {
    delete(): void;
    constructor();
    push_back(value: number): void;
    get(index: number): number;
    size(): number;
}

export type WorkerInputData = {
    module: string;
    algorithm: string;
    genomes: Array<string>;
    seed: string;
}

export type WorkerOutputData = Array<number>;

export type AsmNeModule = (calculateAction: (inputs: Array<number>) => Array<number>, canvas?: HTMLCanvasElement, seed: string) => Promise<number>;