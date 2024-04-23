declare module "*?worker" {
    const value: new () => Worker;
    export default value;
}