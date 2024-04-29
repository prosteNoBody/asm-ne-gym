import type { AsmNeModule } from "@core/types/AsmNeGym";
import { CFlappyGame } from "@demo/Flappy";

const module: AsmNeModule = (calculateActions, canvas): Promise<number> => {
    return new Promise(resolve => {
        const game = new CFlappyGame(s => {
            resolve(s);
        });
        
        if (canvas) {
            const canvasContext = canvas.getContext("2d");
            if (canvasContext) game.mount(canvasContext);
        }
        game.run();
    })
};

export default module;