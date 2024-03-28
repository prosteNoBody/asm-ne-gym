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

class CCarEntity extends CEntity<InternalState> {
    private acc = 0;
    private vel = 0;
    private speed = 0;
    private angle = 0;

    private readonly MAX_SPEED = 10;

    constructor () {
        super({ width: 40, heigh: 40 }, { x: 280, y: 50 }, true);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x - this._size.width, this._pos.y - this._size.heigh, this._size.width * 2, this._size.heigh * 2);
        ctx.fillStyle = "red";
        ctx.fillRect(this._pos.x + Math.sin(this.angle) * this._size.width, this._pos.y + Math.cos(this.angle) * this._size.heigh, 4, 4);
    }

    public update(state: InternalState): void {
        if (state.controls.left) {
            this.angle += Math.PI / 50 * this.speed / 5;
        }
        if (state.controls.right) {
            this.angle -= Math.PI / 50 * this.speed / 5;
        }
        this.angle %= (Math.PI * 2);

        if (state.controls.up) {
            this.acc = 2;
        }
        if (state.controls.down) {
            this.acc = -5;
        }
        this.vel += this.acc;
        this.speed += this.vel;
        if (this.speed < 0)
            this.speed = 0;
        else if (this.speed > this.MAX_SPEED)
            this.speed = this.MAX_SPEED;

        this._pos.x += this.speed * Math.sin(this.angle);
        this._pos.y += this.speed * Math.cos(this.angle);





        // wall colide check
        if (this._pos.x - this._size.width < 0)
            this._pos.x = this._size.width;
        if (this._pos.x + this._size.width > state.mapSize.width)
            this._pos.x = state.mapSize.width - this._size.width;
        if (this._pos.y - this._size.heigh < 0)
            this._pos.y = this._size.heigh;
        if (this._pos.y + this._size.heigh > state.mapSize.heigh)
            this._pos.y = state.mapSize.heigh - this._size.heigh;
    }

    public colide(state: InternalState, entity: CEntity<InternalState>): void {
        
    }
}

export class CRaceGame extends CElgine<CEntity<InternalState>, InternalState> {
    constructor () {
        const controls = new CRaceGameControl();
        super(controls, (_, score) => {
            console.log(score);
        });

        const car = new CCarEntity();
        this.registerEntity(car);
    }

    public updateGame(): void {}

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
                width: 800,
                heigh: 800,
            },
            isFinished: false,
        }
    }
}