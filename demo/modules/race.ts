import type { AsmNeModule } from "@core/types/AsmNeGym";
import { CRaceGame  } from "@demo/Race";

const module: AsmNeModule = (calculateActions, canvas): Promise<number> => {
    return new Promise(resolve => {
        const game = new CRaceGame(s => {
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