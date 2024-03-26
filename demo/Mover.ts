import { CElgine, CEntity, CControl, TSize } from '@engine/index';

type Controls = {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
}

type InternalState = {
    controls: Controls;
    mapSize: TSize;
    isFinished: boolean;
};

class CMoverGameControl extends CControl<InternalState> {
    private _controls: Controls;

    constructor() {
        super();

        this.handleKeydownEvent = this.handleKeydownEvent.bind(this);
        this.handleKeyupEvent = this.handleKeyupEvent.bind(this);

        this._controls = { up: false, right: false, down: false, left: false };

        window.addEventListener('keydown', this.handleKeydownEvent);
        window.addEventListener('keyup', this.handleKeyupEvent);
    }

    public onmount(): void {
        window.removeEventListener('keydown', this.handleKeydownEvent);
        window.removeEventListener('keyup', this.handleKeyupEvent);
    }

    private handleKeyEvent (key: string, state: boolean) {
        switch(key) {
            case "w":
                this._controls.up = state;
                break;
            case "d":
                this._controls.right = state;
                break;
            case "s":
                this._controls.down = state;
                break;
            case "a":
                this._controls.left = state;
                break;
        }
    }
    private handleKeydownEvent (e: KeyboardEvent) {
        this.handleKeyEvent(e.key, true);
    }
    private handleKeyupEvent (e: KeyboardEvent) {
        this.handleKeyEvent(e.key, false);
    }

    public updateState(state: InternalState): InternalState {
        state.controls = { ...this._controls }
        return state;
    }
}

class CPlayerEntity extends CEntity<InternalState> {
    constructor () {
        super({ width: 20, heigh: 20 }, { x:0, y:0 }, true);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.heigh);
    }

    public update(state: InternalState): void {

        this._pos.y += 1;
        if (this._pos.y + this._size.heigh > state.mapSize.heigh)
            state.isFinished = true;

        return;
        if (state.controls.up)
            this._pos.y -= 3;
        if (state.controls.down)
            this._pos.y += 3;
        if (state.controls.left)
            this._pos.x -= 3;
        if (state.controls.right)
            this._pos.x += 3;

        if (this._pos.x < 0)
            this._pos.x = 0;
        if (this._pos.x + this._size.width > state.mapSize.width)
            this._pos.x = state.mapSize.width - this._size.width;
        if (this._pos.y < 0)
            this._pos.y = 0;
        if (this._pos.y + this._size.heigh > state.mapSize.heigh)
            this._pos.y = state.mapSize.heigh - this._size.heigh;
    }

    public colide(state: InternalState, entity: CEntity<InternalState>): void {
        
    }
}

class CMoverGame extends CElgine<CPlayerEntity, InternalState> {
    constructor () {
        const controls = new CMoverGameControl();
        super(controls, (_, score) => {
            console.log(score);
        });

        const player = new CPlayerEntity();
        this.registerEntity(player);
    }

    public updateGame(): void {
        this._score++;
        if (this._sharedState.isFinished)
            this.stop();
    }

    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, this._sharedState.mapSize.width, this._sharedState.mapSize.heigh);
    }

    protected initSharedState(): InternalState {
        return {
            controls: {
                up: false,
                down: false,
                left: false,
                right: false,
            },
            mapSize: {
                width: 1000,
                heigh: 1000,
            },
            isFinished: false,
        }
    }
}

document.addEventListener('readystatechange', () => {
    if (document.readyState === 'loading')
        return;

    const canvas = <HTMLCanvasElement>document.getElementById('gameCanvas');
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx)
        throw new Error("Canvas CTX missing");

    const game = new CMoverGame();
    // game.mount(canvasCtx);
    game.run();
})