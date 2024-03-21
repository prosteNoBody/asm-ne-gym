import { Position, Size, UUID } from "./types";

export interface Idk {
    
}

type TDestroyCallback = (id: UUID) => void;

export abstract class CEntity<TSharedState> {
    private readonly _id: UUID;
    private readonly _collisions: boolean;
    private readonly _destroyCallback: TDestroyCallback;
    private readonly _pos: Position;
    private readonly _size: Size;

    constructor(destroyCallback: TDestroyCallback) {
        this._destroyCallback = destroyCallback;
    }
    
    public abstract update(state: TSharedState): void;
    public abstract render(ctx: CanvasRenderingContext2D): void;
    public abstract colide(state: TSharedState, entity: CEntity<TSharedState>): void;
    
    public destroy(): void {
        this._destroyCallback(this._id);
    };
    public isCollidable(): boolean {
        return this._collisions;
    }
    public getId(): UUID {
        return this._id;
    }
    public getSize(): Size {
        return this._size;
    }
    public getPos(): Position {
        return this._pos;
    }
}