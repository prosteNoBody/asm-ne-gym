import { TPosition, TSize, UUID, TEngineCallbacks } from "./types";

export abstract class CEntity<TSharedState> {
    protected readonly _id: UUID;
    protected readonly _collisions: boolean;
    protected readonly _pos: TPosition;
    protected readonly _size: TSize;
    protected _engineCallbacks?: TEngineCallbacks<CEntity<TSharedState>, TSharedState>;

    constructor(size: TSize, position: TPosition, collisions: boolean) {
        this._id = Math.floor(Math.random() * 9999).toString();
        this._size = size;
        this._pos = position;
        this._collisions = collisions;
    }
    
    public abstract update(state: TSharedState, ticks: number): void;
    public abstract render(ctx: CanvasRenderingContext2D): void;
    public abstract colide(state: TSharedState, entity: CEntity<TSharedState>): void;
    
    public registerCallbacks(engineCallbacks: TEngineCallbacks<CEntity<TSharedState>, TSharedState>) {
        this._engineCallbacks = engineCallbacks;
    }

    public destroy(): void {
        this._engineCallbacks?.destroyEntity(this._id);
    };
    public isCollidable(): boolean {
        return this._collisions;
    }
    public getId(): UUID {
        return this._id;
    }
    public getSize(): TSize {
        return this._size;
    }
    public getPos(): TPosition {
        return this._pos;
    }
}