import { CElgine, CEntity, CControl, TSize, TPosition } from '@engine/index';

type Controls = {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
}

type InternalState = {
    score: number;
    controls: Controls;
    mapSize: TSize;
    sensors: Array<number>;
};

class CRaceControl extends CControl<InternalState> {
    private _calculateActions: (inputs: Array<number>) => Array<number>;

    constructor(calculateActions: (inputs: Array<number>) => Array<number>) {
        super();
        this._calculateActions = calculateActions;
    }

    public updateState(state: InternalState): InternalState {
        const outputs = this._calculateActions(state.sensors);
        state.controls.up = outputs[0] > .5;
        state.controls.right = outputs[1] > .5;
        state.controls.down = outputs[2] > .5;
        state.controls.left = outputs[3] > .5;
        return state;
    }
}

class CCarSensor extends CEntity<InternalState> {
    constructor (position: TPosition) {
        super({ width: 5, height: 5 }, position, true);
    }

    private _collidingWithWall: boolean = false;
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this._collidingWithWall ? "green" : "red";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.height);
    }

    public positionUpdate (position: TPosition) {
        this._pos.x = position.x;
        this._pos.y = position.y;
    }

    public isColliding(): number {
        return this._collidingWithWall ? 1 : 0;
    }

    public update(state: InternalState, ticks: number): void {
        this._collidingWithWall = false;
    }

    public collide(state: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CBarier) {
            this._collidingWithWall = true;
        }
    }
}

class CCar extends CEntity<InternalState> {
    private _sensors: Array<CCarSensor> = [];
    constructor (position: TPosition) {
        super({ width: 20, height: 20 }, position, true);
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.height);
        ctx.fillStyle = "purple";
        ctx.fillRect(this._pos.x + (this._size.width / 2) + Math.sin(this.angle) * (this._size.width / 2) - 2,
            this._pos.y + (this._size.height / 2) + Math.cos(this.angle) * (this._size.height / 2) - 2, 4, 4);
    }

    private calculateSensorPositions(): Array<TPosition> {
        const positions = [];
        for (let distance = 1; distance <= 3; distance++) {
            for (let angle = -1; angle <= 1; angle++) {
                const angle_amp = Math.PI / 6;
                const ditance_amp = 50;
                const x = this._pos.x + this._size.width / 2 + Math.sin(this.angle + angle * angle_amp) * distance * ditance_amp - 2.5;
                const y = this._pos.y + this._size.height / 2 + Math.cos(this.angle + angle * angle_amp) * distance * ditance_amp - 2.5;
                positions.push({ x, y });
            }
        }
        return positions;
    }

    private acc = 0;
    private vel = 0;
    private angle = Math.PI / 2;
    private static readonly MAX_SPEED = 9;
    public update(state: InternalState, tick: number): void {
        if (state.controls.down)
            this.acc = -.3;
        else if (state.controls.up)
            this.acc = .3;
        else
            this.acc = 0;
        
        this.vel += this.acc;
        if (this.vel < 3)
            this.vel = 3;
        else if (this.vel > CCar.MAX_SPEED)
            this.vel = CCar.MAX_SPEED;

        if (state.controls.left)
            this.angle += (Math.PI / 4) * (.4 / this.vel);
        if (state.controls.right)
            this.angle -= (Math.PI / 4) * (.4 / this.vel);
        this.angle %= (Math.PI * 2);

        // update score by amont of traveled distance
        const TICK_PENALITY = -2; // motivate agent to go fast as possible
        state.score += this.vel + TICK_PENALITY;
        this._pos.x += this.vel * Math.sin(this.angle);
        this._pos.y += this.vel * Math.cos(this.angle);

        // register sensors
        if (!this._sensors.length) {
            const sensorsPositions = this.calculateSensorPositions();
            for (let i = 0; i < 9; i++) {
                const sensor = new CCarSensor(sensorsPositions[i]);
                
                this._engineCallbacks?.registerEntity(sensor);
                this._sensors.push(sensor);
            }
        }

        // update sensor status
        state.sensors = this._sensors.map(sensor => sensor.isColliding());

        // update sensors positions
        const sensorsPositions = this.calculateSensorPositions();
        this._sensors.forEach((sensor, index) => sensor.positionUpdate(sensorsPositions[index]));
    }

    public collide(_: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CBarier) {
            this.destroy();
            this._engineCallbacks?.stopEngine();
        }
    }
}

class CBarier extends CEntity<InternalState> {
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "black";
        ctx.fillRect(this._pos.x, this._pos.y, this._size.width, this._size.height);
    }
    public update(_: InternalState, __: number): void {}
    public collide(_: InternalState, __: CEntity<InternalState>): void {}
}

export class CRaceGame extends CElgine<CEntity<InternalState>, InternalState> {
    constructor (finishCallback: (score: number) => void, calculateActions: (inputs: Array<number>) => Array<number>) {
        const controls = new CRaceControl(calculateActions);
        super(controls, state => {
            finishCallback(state.score);
        });

        // create car
        const car = new CCar({ x: 75, y: 55 });
        this.registerEntity(car);
        
        // create barriers
        for (const size of [
            // outer bariers
            [0, 0, 35, 900],[35, 0, 555, 35], [555, 35, 35, 110], [555, 115, 250, 35],[800, 0, 35, 150], [835, 0, 670 , 35],
            [35, 525, 200, 35], [35, 865, 750, 35], [1465, 35, 35, 200],
            [1455, 235, 35, 150], [785, 840, 150, 35], [935, 825, 150, 35], [1050, 790, 150, 35], [1165, 755, 150, 35],[1280, 720, 150, 35], 
            [1300, 685, 150, 35], [1350, 650, 120, 35], [1400, 615, 80, 35], [1445, 385, 35, 150],[1430, 535, 35, 80],
            // inner baries
            [140, 130, 260, 35], [365, 165, 35, 80], [365, 245, 660, 35], [990, 145, 35, 100], [990, 110, 360, 35], [1330, 145, 35, 70],
            [1300, 215, 35, 70], [1270, 285, 35, 70], [1270, 285, 35, 100], [1240, 385, 35, 100], [1155, 485, 100, 35], [1080, 520, 100, 35],
            [1000, 555, 100, 35], [930, 590, 100, 35], [850, 625, 100, 35], [680, 660, 200, 35], [230, 695, 470, 35], [430, 350, 35, 345],
            [170, 315, 295, 35], [170, 165, 35, 150]
        ]) {
            const barrier = new CBarier({ width: size[2], height: size[3] }, { x: size[0], y: size[1] }, true);
            this.registerEntity(barrier);
        }
    }

    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, this._sharedState.mapSize.width, this._sharedState.mapSize.height);
    }

    public getSize(): TSize {
        return this._sharedState.mapSize;
    }

    protected initSharedState(): InternalState {
        return {
            score: 0,
            controls: {
                up: false,
                down: false,
                left: false,
                right: false,
            },
            mapSize: {
                width: 1500,
                height: 900,
            },
            sensors: new Array(9).fill(0),
        }
    }
}