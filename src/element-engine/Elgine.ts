import { CControl } from "./Control";
import { CEntity } from "./Entity";

const TIMESTEP = 1000 / 60;

export abstract class CElgine<Entity extends CEntity<TSharedState>, TSharedState> {
    private _ctx: null | CanvasRenderingContext2D = null;
    private _entities: Array<Entity> = [];    
    private _score: number = 0;
    private _isActive: boolean = false;
    private _sharedState: TSharedState;
    private _control: CControl<TSharedState>;
    private _finishCallback: ((state: TSharedState, score: number) => void) | null = null;

    constructor (control: CControl<TSharedState>) {
        this._control = control;
    }

    private render(): void {
        if (this._ctx === null)
            return;

        for (let i = 0; i < this._entities.length; i++) {
            this._entities[i].render(this._ctx);
        }
    }

    private updateState(): void {
        this._sharedState = this._control.updateState(this._sharedState);
    }

    private updateEntities(): void {
        for (let i = 0; i < this._entities.length; i++) {
            this._entities[i].update(this.getSharedState());
        }
    }

    private updateColissions(): void {
        for (let i = 0; i < this._entities.length; i++) {
            if (!this._entities[i].isCollidable())
                continue;
            
            for (let j = i + 1; j < this._entities.length; j++) {
                if (!this._entities[j].isCollidable())
                    continue;

                const entity1 = this._entities[i];
                const entity2 = this._entities[j];

                const ent1Pos = entity1.getPos();
                const ent1Size = entity1.getSize();
                const ent2Pos = entity2.getPos();
                const ent2Size = entity2.getSize();
                if (
                    ((ent1Pos.x <= ent2Pos.x && ent2Pos.x <= ent1Pos.x + ent1Size.width)
                    || (ent1Pos.x <= ent2Pos.x + ent2Size.width && ent2Pos.x  + ent2Size.width <= ent1Pos.x + ent1Size.width))
                    && ((ent1Pos.y <= ent2Pos.y && ent2Pos.y <= ent1Pos.y + ent1Size.heigh)
                    || (ent1Pos.y <= ent2Pos.y + ent2Size.heigh && ent2Pos.y  + ent2Size.heigh <= ent1Pos.y + ent1Size.heigh))
                ) {
                    entity1.colide(this.getSharedState(), entity2);
                    entity2.colide(this.getSharedState(), entity1);
                }
            }
        }
    }

    // all internal states updates
    private update(): void {
        this.updateState();
        this.updateEntities();
        this.updateColissions();
    }

    // loop for intensive and fast calculation of game output with automatic Control flow
    private loop(): void {
        if (!this._isActive) {
            return this._finishCallback?.(this._sharedState, this._score);
        }
        this.update();
        this.loop();
    }

    // normal render process for user watchable game progress
    private _lastFrameTimeMs = 0;
    private renderableLoop(timestamp: DOMHighResTimeStamp): void {
        if (!this._isActive) {
            return this._finishCallback?.(this._sharedState, this._score);
        }

        let delta = timestamp - this._lastFrameTimeMs;
        this._lastFrameTimeMs = timestamp;

        while (delta >= TIMESTEP) {
            // one game process
            this.update();
            delta -= TIMESTEP;
        }

        this.render();
        requestAnimationFrame(this.renderableLoop);
    }

    protected abstract initSharedState(): TSharedState;
    protected abstract getSharedState(): TSharedState;

    public abstract init(): void;

    public mount(ctx: CanvasRenderingContext2D): void {
        this._ctx = ctx;

        this.render()
    }

    public run(): void {
        this._isActive = true;
        
        if (this._ctx)
            requestAnimationFrame(this.renderableLoop);
        else
            this.loop();
    }
    public stop(): void {
        this._isActive = false;
    }
}