import { CEntity } from "./Entity";

export type UUID = string;

export type TSize = {
    width: number;
    height: number;
}

export type TPosition = {
    x: number;
    y: number;
}

export type TEngineCallbacks<Entity extends CEntity<TSharedState>, TSharedState> = {
    destroyEntity: (_: UUID) => void;
    registerEntity: (_: Entity) => void;
    stopEngine: () => void;
}