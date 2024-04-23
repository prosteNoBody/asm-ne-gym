declare module "@build_wasm/*.js" {
    export default function (): Promise<{
        AsmCore: typeof import("@core/types/AsmNeGym").AsmCore,
        Vector: typeof import("@core/types/AsmNeGym").Vector,
    }>
}