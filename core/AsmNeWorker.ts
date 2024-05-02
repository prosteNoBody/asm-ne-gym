import AsmCoreWasm from "@build_wasm/asm_core.js";
import { calculateOutputs } from "@core/AsmNeUtils";
import type { AsmNeModule, WorkerInputData, WorkerOutputData } from "@core/types/AsmNeGym";

(async () => {
    // initialize AsmCoreWasm
    const { AsmCore, Vector } = await AsmCoreWasm();

    // initialize listener for calculations
    addEventListener("message", async (e: MessageEvent<WorkerInputData>) => {
        const { module, algorithm, genomes } = e.data;
        // load passed module
        const { default: environmentRun }: { default: AsmNeModule } = await import(`../demo/modules/${module}.ts`);
        
        const results: WorkerOutputData = [];
        for (let i = 0; i < genomes.length; i++) {        
            const phenotype = new AsmCore(algorithm);
            phenotype.buildGenome(genomes[i]);
            
            let fitness = -1;
            try {
                // calculate fitness
                fitness = await environmentRun((inputs: Array<number>) => calculateOutputs(phenotype, Vector, inputs), undefined);
            } catch (e) {
                // console.log(e);
            }
    
            phenotype.delete();
            results.push(fitness);
        }
    
        postMessage(results);
    });

    // send message that worker is ready
    postMessage(true);
})();