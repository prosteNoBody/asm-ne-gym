import { CFlappyGame } from "./Flappy";
import { CRaceGame } from "./Race";
import AsmCoree from '../build_wasm/asm_core.js';

document.addEventListener('readystatechange', async () => {
    if (document.readyState === 'loading')
        return;

    const canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx)
        throw new Error("Canvas CTX missing");

    const game = new CFlappyGame();
    
    canvas.width = game.getSize().width;
    canvas.height = game.getSize().heigh;

    const { AsmCore, VectorDouble } = await AsmCoree();
    console.log(VectorDouble);
    const AsmNeat = new AsmCore("NEAT");
    const config = new VectorDouble();
    config.push_back(23);
    console.log(AsmNeat.initalPopulation(config));
    console.log(AsmNeat.generateGeneration("asd"));
    console.log(AsmNeat.buildGenome("23"));
    const inputs = new VectorDouble();
    inputs.push_back(1);
    inputs.push_back(2);
    const outputs = AsmNeat.forward(inputs);
    for (let i = 0; i < outputs.size(); i++)
        console.log(`${outputs.get(i)}`);
    console.log('test');
    

    game.mount(canvasCtx);
    game.run();
})