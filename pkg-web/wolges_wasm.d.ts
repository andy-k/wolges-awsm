/* tslint:disable */
/* eslint-disable */

export function analyze(req_str: string): Promise<any>;

export function do_this_on_startup(): void;

export function play_score(req_str: string): any;

export function precache_kbwg(key: string, value: Uint8Array): void;

export function precache_klv(key: string, value: Uint8Array): void;

export function precache_kwg(key: string, value: Uint8Array): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly analyze: (a: number, b: number) => any;
    readonly do_this_on_startup: () => void;
    readonly play_score: (a: number, b: number) => [number, number, number];
    readonly precache_kbwg: (a: number, b: number, c: number, d: number) => void;
    readonly precache_klv: (a: number, b: number, c: number, d: number) => void;
    readonly precache_kwg: (a: number, b: number, c: number, d: number) => void;
    readonly wasm_bindgen__closure__destroy__h49d4fb282543aa92: (a: number, b: number) => void;
    readonly wasm_bindgen__convert__closures_____invoke__h655a5550a5229c44: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen__convert__closures_____invoke__hc6f1bdea39a0096d: (a: number, b: number, c: any) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
