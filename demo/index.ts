import { AsmNeGym } from "@core/AsmNeGym";
import AsmCoreWasm from "@build_wasm/asm_core.js";
import AsmNeWorker from "@core/AsmNeWorker?worker";
import { WorkerInputData, WorkerOutputData } from "@core/types/AsmNeGym";

document.addEventListener('readystatechange', async () => {
    if (document.readyState === 'loading')
        return;

    const asmGym = new AsmNeGym("flappy", "NEAT", [23, 23]);
    await asmGym.train({ time: 5000 });
    console.log(asmGym.getBestGenome());
});