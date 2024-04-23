import type { AsmNeModule } from "@core/types/AsmNeGym";
import { CFlappyGame } from "@demo/Flappy";

const module: AsmNeModule = (calculateActions, canvas): number => {
    let score = 0;
    const game = new CFlappyGame(s => score = s);
    if (canvas) {
        const canvasContext = canvas.getContext("2d");
        if (canvasContext) game.mount(canvasContext);
    }
    game.run();
    return score;
}

export default module;