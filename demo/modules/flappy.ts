import type { AsmNeModule } from "@core/types/AsmNeGym";
import { CFlappyGame } from "@demo/Flappy";

const module: AsmNeModule = (calculateActions, canvas): Promise<number> => {
    const random = Math.random() * 10000;

    return new Promise(resolve => {
        const game = new CFlappyGame(s => {
            resolve(s);
        }, calculateActions);
        
        if (canvas) {
            const gameSize = game.getSize();
            canvas.width = gameSize.width;
            canvas.height = gameSize.height;

            const canvasContext = canvas.getContext("2d");
            if (canvasContext) game.mount(canvasContext);
        }
        game.run();
    })
};

export default module;