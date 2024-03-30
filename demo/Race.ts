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

class CRaceGameControl extends CControl<InternalState> {
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

class CCar extends CEntity<InternalState> {
    constructor () {
        super({ width: 20, heigh: 20 }, { x: 280, y: 50 }, true);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.heigh);
        ctx.fillStyle = "red";
        ctx.fillRect(this._pos.x + (this._size.width / 2) + Math.sin(this.angle) * (this._size.width / 2) - 2,
            this._pos.y + (this._size.heigh / 2) + Math.cos(this.angle) * (this._size.heigh / 2) - 2, 4, 4);
    }

    private acc = 0;
    private vel = 0;
    private angle = 0;
    private readonly MAX_SPEED = 12;
    public update(state: InternalState, tick: number): void {
        if (!(tick % 1)) {
            if (state.controls.down)
                this.acc = -.2;
            else if (state.controls.up)
                this.acc = .3;
            else
                this.acc = 0;
            
            this.vel += this.acc;
            if (this.vel < 2)
                this.vel = 2;
            else if (this.vel > this.MAX_SPEED)
                this.vel = this.MAX_SPEED;

            if (state.controls.left)
                this.angle += (Math.PI / 4) * (.4 / this.vel);
            if (state.controls.right)
                this.angle -= (Math.PI / 4) * (.4 / this.vel);
            this.angle %= (Math.PI * 2);
        }

        this._pos.x += this.vel * Math.sin(this.angle);
        this._pos.y += this.vel * Math.cos(this.angle);

        // wall colide check
        if (this._pos.x < 0)
            this._pos.x = 0;
        if (this._pos.x + this._size.width > state.mapSize.width)
            this._pos.x = state.mapSize.width - this._size.width;
        if (this._pos.y < 0)
            this._pos.y = 0;
        if (this._pos.y + this._size.heigh > state.mapSize.heigh)
            this._pos.y = state.mapSize.heigh - this._size.heigh;
    }

    public colide(_: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CBarier) {
            this.destroy();
            this._engineCallbacks?.stopEngine();
        }
    }
}

class CBarier extends CEntity<InternalState> {
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.heigh);
    }
    public update(_: InternalState, __: number): void {}
    public colide(_: InternalState, __: CEntity<InternalState>): void {}
}

export class CRaceGame extends CElgine<CEntity<InternalState>, InternalState> {
    constructor () {
        const controls = new CRaceGameControl();
        super(controls, (_, score) => {
            console.log(score);
        });

        // create car
        const car = new CCar();
        this.registerEntity(car);

        // create barriers
        for (const size of [
            [23, 23, 23, 23], [12, 12, 12, 12]
        ]) {
            const barrier = new CBarier({ width: size[2], heigh: size[3] }, { x: size[0], y: size[1] }, true);
            this.registerEntity(barrier);
        }
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
                width: 1500,
                heigh: 900,
            },
            isFinished: false,
        }
    }
}