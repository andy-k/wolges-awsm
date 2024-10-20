/* tslint:disable */
/* eslint-disable */
export function do_this_on_startup(): void;
/**
 * @param {string} key
 * @param {Uint8Array} value
 */
export function precache_kwg(key: string, value: Uint8Array): void;
/**
 * @param {string} key
 * @param {Uint8Array} value
 */
export function precache_klv(key: string, value: Uint8Array): void;
/**
 * @param {string} req_str
 * @returns {Promise<any>}
 */
export function analyze(req_str: string): Promise<any>;
/**
 * @param {string} req_str
 * @returns {any}
 */
export function play_score(req_str: string): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly do_this_on_startup: () => void;
  readonly precache_kwg: (a: number, b: number, c: number, d: number) => void;
  readonly precache_klv: (a: number, b: number, c: number, d: number) => void;
  readonly analyze: (a: number, b: number) => number;
  readonly play_score: (a: number, b: number) => Array;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_export_1: WebAssembly.Table;
  readonly closure67_externref_shim: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly closure122_externref_shim: (a: number, b: number, c: number, d: number) => void;
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
