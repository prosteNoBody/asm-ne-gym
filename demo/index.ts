import { CFlappyGame } from "./Flappy";
import { CRaceGame } from "./Race";

document.addEventListener('readystatechange', () => {
    if (document.readyState === 'loading')
        return;

    const canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx)
        throw new Error("Canvas CTX missing");

    const game = new CFlappyGame();
    
    canvas.width = game.getSize().width;
    canvas.height = game.getSize().heigh;

    game.mount(canvasCtx);
    game.run();
})