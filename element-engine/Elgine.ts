import { CControl } from "./Control";
import { CEntity } from "./Entity";
import { TEngineCallbacks, UUID } from "./types";

const TIMESTEP = 1000 / 60;

type TFinishCallback<T> = ((state: T, score: number) => void) | null

export abstract class CElgine<Entity extends CEntity<TSharedState>, TSharedState> {
    protected _ctx: undefined | CanvasRenderingContext2D;
    protected _entities: Array<Entity> = [];    
    protected _score: number = 0;
    protected _isActive: boolean = false;
    protected _sharedState: TSharedState;
    protected _control: CControl<TSharedState>;
    protected _finishCallback: TFinishCallback<TSharedState>;

    constructor (control: CControl<TSharedState>, finishCallback: TFinishCallback<TSharedState>) {
        this._control = control;
        this._sharedState = this.initSharedState();
        this._finishCallback = finishCallback;
    }

    protected abstract initSharedState(): TSharedState;
    
    private getCallbacks(): TEngineCallbacks<Entity, TSharedState> {
        return {
            registerEntity: (entity: Entity) => this.registerEntity(entity),
            destroyEntity: (id: UUID) => this.destroyEntity(id),
            stopEngine: () => this.stop(),
        }
    }
    protected registerEntity(entity: Entity) {
        this._entities.push(entity);
        entity.registerCallbacks(this.getCallbacks() as TEngineCallbacks<CEntity<TSharedState>, TSharedState>);
    }
    protected destroyEntity(id: UUID): void {
        const index = this._entities.findIndex(e => e.getId() === id);
        this._entities.splice(index, 1);
    }

    private render(): void {
        if (!this._ctx)
            return;

        this._ctx.beginPath();
        this.renderMap(this._ctx);
        for (let i = 0; i < this._entities.length; i++) {
            this._entities[i].render(this._ctx);
        }
        this._ctx.fill();
    }
    protected renderMap(ctx: CanvasRenderingContext2D): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    };

    protected updateGame(_: TSharedState, __: number): void {}

    private updateState(): void {
        this._sharedState = this._control.updateState(this._sharedState);
    }

    private updateEntities(): void {
        for (let i = 0; i < this._entities.length; i++) {
            this._entities[i].update(this._sharedState, this._updateTicks);
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
                    entity1.colide(this._sharedState, entity2);
                    entity2.colide(this._sharedState, entity1);
                }
            }
        }
    }

    // all internal states updates
    private _updateTicks = 0;
    private update(): void {
        this._updateTicks++;
        this.updateState();
        this.updateGame(this._sharedState, this._updateTicks);
        this.updateEntities();
        this.updateColissions();
    }

    private beforeEnd(): void {
        this._finishCallback?.(this._sharedState, this._score);
        this._control.onmount();
    }

    // loop for intensive and fast calculation of game output with automatic Control flow
    private loop(): void {
        if (!this._isActive) {
            return this.beforeEnd();
        }
        this.update();
        this.loop();
    }

    // normal render process for user watchable game progress
    private _lastFrameTimeMs = 0;
    private renderableLoop(timestamp: DOMHighResTimeStamp): void {
        if (!this._isActive) {
            return this.beforeEnd();
        }

        let delta = timestamp - this._lastFrameTimeMs;

        let wasUpdatedFlag = false;
        while (delta >= TIMESTEP) {
            wasUpdatedFlag = true;
            // one game process
            this.update();
            this._lastFrameTimeMs += TIMESTEP;
            delta -= TIMESTEP;
        }

        if (wasUpdatedFlag)
            this.render();
        requestAnimationFrame(t => this.renderableLoop(t));
    }

    public mount(ctx: CanvasRenderingContext2D): void {
        this._ctx = ctx;
        if (!this._ctx)
            this.render()
    }

    public run(): void {
        this._isActive = true;
        
        if (this._ctx)
            requestAnimationFrame(t => this.renderableLoop(t));
        else
            this.loop();
    }
    public stop(): void {
        this._isActive = false;
    }
}