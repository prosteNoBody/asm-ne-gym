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
    private _calculateActions: (inputs: Array<number>) => Array<number>;

    constructor(calculateActions: (inputs: Array<number>) => Array<number>) {
        super();

        this._calculateActions = calculateActions;
    }

    public updateState(state: InternalState): InternalState {
        const jumptedNum = state.birdData.jumped ? 1 : 0;

        const inputs = [jumptedNum, state.birdData.position, state.birdData.velocity, state.pipeData.x, state.pipeData.y];
        const outputs = this._calculateActions(inputs);

        state.controls.jump = outputs[0] > .5;

        return state;
    }
}

class CBird extends CEntity<InternalState> {
    constructor (position: TPosition) {
        super({ width: 20, height: 20 }, position, true);
        this.data = {
            velocity: CBird.JUMP_VEL,
            position: position.y,
            jumped: false,
        };
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.height);
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

        this._pos.y += this.data.velocity;
        if (this._pos.y < 0) {
            this._pos.y = 0;
        } else if ((this._pos.y + this._size.height > state.mapSize.height)) {
            this.destroy();
            this._engineCallbacks?.stopEngine();
        }

        // copy data
        this.data.position = this._pos.y;
        state.birdData = this.data;
    }

    public collide(_: InternalState, entity: CEntity<InternalState>): void {
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
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.height);
    }
    public update(state: InternalState, _: number): void {
        this._pos.x -= CFlappyGame.PIPE_STEP;
        if (this._pos.x + CPipe.WIDTH < 0)
            this.destroy();
    }
    public collide(_: InternalState, __: CEntity<InternalState>): void {}
}

export class CFlappyGame extends CElgine<CEntity<InternalState>, InternalState> {
    constructor (finishCallback: (score: number) => void, calculateActions: (inputs: Array<number>) => Array<number>) {
        const controls = new CFlappyControl(calculateActions);
        super(controls, state => {
            finishCallback(state.score);
        });

        // create bird
        const bird = new CBird({ x: 50, y: 200 });
        this.registerEntity(bird);
    }

    private bug_det: number[] = [];
    static readonly PIPE_STEP = 4;
    public updateGame(state: InternalState, tick: number): void {
        if (tick % 120000 === 0) {
            if (this.bug_det.filter(i => i === this.bug_det[0]).length < 3)
                state.score = 0;
            this.stop()
        };

        state.score++;
        state.pipeData.x -= CFlappyGame.PIPE_STEP;

        if (state.pipeData.x + CPipe.WIDTH < 0) {
            state.pipeData.x = state.mapSize.width + CPipe.WIDTH;

            const OFFSET = 100; // from top and bottom 
            const HALF_GAP = 50; // gap for bird to fly through

            const gapPosition = Math.ceil(Math.random() * (state.mapSize.height - OFFSET * 2 - HALF_GAP * 2)) + OFFSET;
            
            // create two pipes with gap
            const top_pipe = new CPipe(
                { width: CPipe.WIDTH, height: gapPosition - HALF_GAP },
                { x: state.pipeData.x, y: 0},
                true
            );
            const bottom_pipe = new CPipe(
                { width: CPipe.WIDTH, height: state.mapSize.height - gapPosition - HALF_GAP },
                { x: state.pipeData.x, y: gapPosition + HALF_GAP},
                true
            );
            
            state.pipeData.y = gapPosition + HALF_GAP;
            this.bug_det.push(state.birdData.position);
            this.registerEntities([top_pipe, bottom_pipe]);
        }
    }

    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "#a3fcff";
        ctx.fillRect(0, 0, this._sharedState.mapSize.width, this._sharedState.mapSize.height);
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
                height: 750,
            },
        }
    }
}