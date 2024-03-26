export abstract class CControl<TSharedState> {
    public abstract updateState(state: TSharedState): TSharedState;
}