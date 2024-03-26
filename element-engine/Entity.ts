import { TPosition, TSize, UUID } from "./types";

type TDestroyCallback = (id: UUID) => void;

export abstract class CEntity<TSharedState> {
    protected readonly _id: UUID;
    protected readonly _collisions: boolean;
    protected readonly _destroyCallback?: TDestroyCallback;
    protected readonly _pos: TPosition;
    protected readonly _size: TSize;

    constructor(size: TSize, position: TPosition, collisions: boolean, destroyCallback?: TDestroyCallback) {
        this._destroyCallback = destroyCallback;
        this._id = Math.floor(Math.random() * 20).toString();
        this._size = size;
        this._pos = position;
        this._collisions = collisions;
    }
    
    public abstract update(state: TSharedState): void;
    public abstract render(ctx: CanvasRenderingContext2D): void;
    public abstract colide(state: TSharedState, entity: CEntity<TSharedState>): void;
    
    public destroy(): void {
        this._destroyCallback?.(this._id);
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