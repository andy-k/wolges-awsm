/* tslint:disable */
/* eslint-disable */
/**
*/
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
  readonly play_score: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hea198ec2aba6ac3c: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h7dc93f80f1d2f21a: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
