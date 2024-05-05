import { CElgine, CEntity, CControl, TSize, TPosition } from '@engine/index';

type Controls = {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
};

type CarData = {
    velocity: number;
    acceleration: number;
};

type InternalState = {
    score: number;
    controls: Controls;
    carData: CarData;
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
        const outputs = this._calculateActions([...Object.values(state.carData), ...state.sensors]);
        state.controls.up = outputs[0] > .5;
        state.controls.right = outputs[1] > .5;
        state.controls.down = outputs[2] > .5;
        state.controls.left = outputs[3] > .5;
        return state;
    }
}

class CCarSensor extends CEntity<InternalState> {
    constructor (position: TPosition) {
        super({ width: 10, height: 10 }, position, true);
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
        if (this._pos.x < 0) this._collidingWithWall = true;
        if (this._pos.y < 0) this._collidingWithWall = true;
        if (this._pos.x > state.mapSize.width) this._collidingWithWall = true;
        if (this._pos.y > state.mapSize.height) this._collidingWithWall = true;
    }

    public collide(state: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CBarier) {
            this._collidingWithWall = true;
        }
    }
}

class CCar extends CEntity<InternalState> {
    public static SENSOR_ROW = 3;
    public static SENSOR_COL = 3;
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
        for (let distance = 1; distance <= CCar.SENSOR_ROW; distance++) {
            for (let angle = -Math.floor(CCar.SENSOR_COL / 2); angle <= Math.floor(CCar.SENSOR_COL / 2); angle++) {
                const angle_amp = Math.PI / 6;
                const ditance_amp = 50;
                const x = this._pos.x + this._size.width / 2 + Math.sin(this.angle + angle * angle_amp) * distance * ditance_amp - 2.5;
                const y = this._pos.y + this._size.height / 2 + Math.cos(this.angle + angle * angle_amp) * distance * ditance_amp - 2.5;
                positions.push({ x, y });
            }
        }
        return positions;
    }

    private previous_position = { x: this._pos.x, y: this._pos.y };
    public active_checkpoint = 1;
    public static CHECKPOINTS:Array<TPosition & { reward: number }> = [
        { x: 100, y: 80, reward: 800 },
        { x: 500, y: 150, reward: 800 },
        { x: 650, y: 200, reward: 800 },
        { x: 900, y: 150, reward: 800 },
        { x: 1150, y: 50, reward: 800 },
        { x: 1350, y: 130, reward: 800 },
        { x: 1350, y: 450, reward: 800 },
        { x: 1150, y: 650, reward: 800 },
        { x: 250, y: 800, reward: 800 },
        { x: 150, y: 730, reward: 1200 },
        { x: 230, y: 570, reward: 2000 },
        { x: 175, y: 475, reward: 800 },
        { x: 115, y: 320, reward: 800 },
    ];

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

        this._pos.x += this.vel * Math.sin(this.angle);
        this._pos.y += this.vel * Math.cos(this.angle);

        // register sensors
        if (!this._sensors.length) {
            const sensorsPositions = this.calculateSensorPositions();
            for (let i = 0; i < CCar.SENSOR_COL * CCar.SENSOR_ROW; i++) {
                const sensor = new CCarSensor(sensorsPositions[i]);
                
                this._engineCallbacks?.registerEntity(sensor);
                this._sensors.push(sensor);
            }
        }

        // update car data
        state.carData.velocity = this.vel;
        state.carData.acceleration = this.acc;

        // update sensor status
        state.sensors = this._sensors.map(sensor => sensor.isColliding());

        // update sensors positions
        const sensorsPositions = this.calculateSensorPositions();
        this._sensors.forEach((sensor, index) => sensor.positionUpdate(sensorsPositions[index]));

        // check for looping in circle
        if (tick % 60 == 0) {
            const distance = ((this._pos.x - this.previous_position.x) ** 2 + (this._pos.y - this.previous_position.y) ** 2) ** (1/2);
            if (distance < 200) {
                this.destroy();
                this._engineCallbacks?.stopEngine();
            }
            this.previous_position = { x: this._pos.x, y: this._pos.y };
        }

        state.score += this.vel * 4;

        const checkpoint_pos = CCar.CHECKPOINTS[this.active_checkpoint];
        const distance_to_checkpoint = ((this._pos.x - checkpoint_pos.x) ** 2 + (this._pos.y - checkpoint_pos.y) ** 2) ** (1/2);
        if (distance_to_checkpoint <= 50) {
            state.score += checkpoint_pos.reward;
            this.active_checkpoint = (this.active_checkpoint + 1) % CCar.CHECKPOINTS.length;
        }
    }

    public collide(state: InternalState, entity: CEntity<InternalState>): void {
        if (entity instanceof CBarier) {
            // add points for distance to checkpoint
            const checkpoint_pos = CCar.CHECKPOINTS[this.active_checkpoint];
            const distance_to_checkpoint = ((this._pos.x - checkpoint_pos.x) ** 2 + (this._pos.y - checkpoint_pos.y) ** 2) ** (1/2);
            state.score += checkpoint_pos.reward * .1 - distance_to_checkpoint;

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
        const car = new CCar({ x: 75, y: 80 });
        this.registerEntity(car);

        // create barriers
        for (const size of [
            // outer bariers
            [0, 0, 35, 900],[35, 0, 555, 35], [555, 35, 35, 110], [555, 115, 250, 35],[800, 0, 35, 150], [835, 0, 670 , 35],
            [35, 525, 130, 35], [35, 865, 750, 35], [1465, 35, 35, 200],
            [1455, 235, 35, 150], [785, 840, 150, 35], [935, 825, 150, 35], [1050, 790, 150, 35], [1165, 755, 150, 35],[1280, 720, 150, 35], 
            [1300, 685, 150, 35], [1350, 650, 120, 35], [1400, 615, 80, 35], [1445, 385, 35, 150], [1430, 535, 35, 80],
            // inner baries 17 18
            [140, 130, 260, 35], [365, 165, 35, 80], [365, 245, 660, 35], [990, 145, 35, 100], [990, 110, 300, 35], [1270, 145, 35, 70],
            [1300, 215, 35, 70], [1270, 285, 35, 70], [1270, 285, 35, 100], [1240, 385, 35, 100], [1155, 485, 100, 35], [1080, 520, 100, 35],
            [1000, 555, 100, 35], [930, 590, 100, 35], [850, 625, 100, 35], [680, 660, 200, 35], [210, 695, 470, 35], [300, 425, 35, 270],
            [170, 390, 295, 35], [170, 165, 35, 225]
        ]) {
            const barrier = new CBarier({ width: size[2], height: size[3] }, { x: size[0], y: size[1] }, true);
            this.registerEntity(barrier);
        }
    }

    protected updateGame(_: InternalState, tick: number): void {
        if (tick % 300000 === 0) this.stop();
    }

    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, this._sharedState.mapSize.width, this._sharedState.mapSize.height);

        const car = this._entities.find(e => e instanceof CCar);
        
        CCar.CHECKPOINTS.forEach((checkpoint, index) => {
            ctx.fillStyle = index === car?.active_checkpoint ? "#e056fd" : "#be2edd"
            ctx.fillRect(checkpoint.x - 5, checkpoint.y - 5, 10, 10);
        })
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
            carData: {
                velocity: 0,
                acceleration: 0,
            },
            mapSize: {
                width: 1500,
                height: 900,
            },
            sensors: new Array(CCar.SENSOR_COL * CCar.SENSOR_ROW).fill(0),
        }
    }
}