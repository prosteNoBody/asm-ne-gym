import { CElgine, CEntity, CControl, TSize, TPosition } from '@engine/index';

type Controls = {
    jump: boolean;
}

type BirdData = {
    velocity: number;
    position: number;
    jumped: boolean;
};

type InternalState = {
    score: number;
    controls: Controls;
    birdData: BirdData;
    pipeData: TPosition;
    mapSize: TSize;
};

class CFlappyControl extends CControl<InternalState> {
    private _controls: Controls;

    constructor() {
        super();

        this.handleKeydownEvent = this.handleKeydownEvent.bind(this);
        this.handleKeyupEvent = this.handleKeyupEvent.bind(this);

        this._controls = { jump: false };

        window.addEventListener('keydown', this.handleKeydownEvent);
        window.addEventListener('keyup', this.handleKeyupEvent);
    }

    public onmount(): void {
        window.removeEventListener('keydown', this.handleKeydownEvent);
        window.removeEventListener('keyup', this.handleKeyupEvent);
    }

    private handleKeyEvent (key: string, state: boolean) {
        if (key == " ")
            this._controls.jump = state;
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
        if (state.birdData.position + 26 > state.pipeData.y && !state.controls.jump && state.score < 300000)
            state.controls.jump = true;
        else
            state.controls.jump = false;
        return state;
    }
}

class CBird extends CEntity<InternalState> {
    constructor (position: TPosition) {
        super({ width: 20, heigh: 20 }, position, true);
        this.data = {
            velocity: CBird.JUMP_VEL,
            position: position.y,
            jumped: false,
        };
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.heigh);
    }

    private static readonly MAX_VEL = 10;
    private static readonly JUMP_VEL = -5;
    private data: BirdData;
    public update(state: InternalState, tick: number): void {
        this.data.velocity += 0.2;
        if (this.data.velocity > CBird.MAX_VEL)
            this.data.velocity = CBird.MAX_VEL;

        if (state.controls.jump && !this.data.jumped) {
            this.data.jumped = true;
            this.data.velocity = CBird.JUMP_VEL;
        } else if (!state.controls.jump) {
            this.data.jumped = false;
        }

        state.score++;
        this._pos.y += this.data.velocity;
        if (this._pos.y < -100) {
            this._pos.y = -100;
        } else if ((this._pos.y + this._size.heigh > state.mapSize.heigh)) {
            this.destroy();
            this._engineCallbacks?.stopEngine();
        }

        // copy data
        this.data.position = this._pos.y;
        state.birdData = this.data;
    }

    public colide(_: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CPipe) {
            this.destroy();
            this._engineCallbacks?.stopEngine();
        }
    }
}

class CPipe extends CEntity<InternalState> {
    static readonly WIDTH = 75;
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "red";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.heigh);
    }
    public update(state: InternalState, _: number): void {
        this._pos.x -= CFlappyGame.PIPE_STEP;
        if (this._pos.x + CPipe.WIDTH < 0)
            this.destroy();
    }
    public colide(_: InternalState, __: CEntity<InternalState>): void {}
}

export class CFlappyGame extends CElgine<CEntity<InternalState>, InternalState> {
    constructor () {
        const controls = new CFlappyControl();
        super(controls, state => {
            console.log(state.score);
        });

        // create bird
        const bird = new CBird({ x: 50, y: 200 });
        this.registerEntity(bird);
    }

    static readonly PIPE_STEP = 4;
    public updateGame(state: InternalState, __: number): void {
        state.pipeData.x -= CFlappyGame.PIPE_STEP;

        if (state.pipeData.x + CPipe.WIDTH < 0) {
            state.pipeData.x = state.mapSize.width + CPipe.WIDTH;

            const OFFSET = 100; // from top and bottom 
            const HALF_GAP = 50; // gap for bird to fly through
            const gapPosition = Math.ceil(Math.random() * (state.mapSize.heigh - OFFSET * 2 - HALF_GAP * 2)) + OFFSET;
            
            // create two pipes with gap
            const top_pipe = new CPipe(
                { width: CPipe.WIDTH, heigh: gapPosition - HALF_GAP },
                { x: state.pipeData.x, y: 0},
                true
            );
            const bottom_pipe = new CPipe(
                { width: CPipe.WIDTH, heigh: state.mapSize.heigh - gapPosition - HALF_GAP },
                { x: state.pipeData.x, y: gapPosition + HALF_GAP},
                true
            );
            
            state.pipeData.y = gapPosition + HALF_GAP;
            this.registerEntities([top_pipe, bottom_pipe]);
        }
    }

    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#a3fcff";
        ctx.fillRect(0, 0, this._sharedState.mapSize.width, this._sharedState.mapSize.heigh);
    }

    public getSize(): TSize {
        return this._sharedState.mapSize;
    }

    protected initSharedState(): InternalState {
        return {
            score: 0,
            birdData: {
                velocity: 0,
                position: 0,
                jumped: false,
            },
            pipeData: {
                x: -CPipe.WIDTH,
                y: 0,
            },
            controls: {
                jump: false,
            },
            mapSize: {
                width: 750,
                heigh: 750,
            },
        }
    }
}