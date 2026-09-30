import {
  evict_klv,
  evict_kwg,
  precache_kbwg,
  precache_klv,
  precache_kwg,
} from "../pkg-web/wolges_wasm.js";

type Kind = "kwg" | "klv";

// The files a requested name could come from, in try order.
//   leave "X"            -> data/X.klv2
//   lexicon "X.WordSmog" -> data/X.kad, cached under "X.WordSmog"
//   lexicon "X"          -> data/X.kwg, else data/X.kbwg
const WORDSMOG = ".WordSmog";
const candidates = (
  kind: Kind,
  name: string,
): { file: string; load: (data: Uint8Array) => void }[] => {
  if (kind === "klv") {
    return [{ file: `${name}.klv2`, load: (d) => precache_klv(name, d) }];
  }
  if (name.endsWith(WORDSMOG)) {
    const stem = name.slice(0, -WORDSMOG.length);
    return [{ file: `${stem}.kad`, load: (d) => precache_kwg(name, d) }];
  }
  return [
    { file: `${name}.kwg`, load: (d) => precache_kwg(name, d) },
    { file: `${name}.kbwg`, load: (d) => precache_kbwg(name, d) },
  ];
};

// The word graphs and leave tables requests name, loaded on first use and
// handed back to the wasm once no request has used them for idleMs. A request
// holds what it names from before loading until it is answered, so a table
// cannot go between being loaded and being used.
export const makeLexicons = (idleMs: number) => {
  // Names that have been settled, whether or not a file was found for them, so
  // a caller asking again for something that is not there costs one failed
  // open rather than one per request.
  const settled = new Set<string>();
  // The settled names a file was loaded for; only these hold memory.
  const resident = new Set<string>();
  const inFlight = new Map<string, Promise<void>>();
  const holders = new Map<string, number>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const ensure = (kind: Kind, name: string): Promise<void> | undefined => {
    const key = `${kind}:${name}`;
    if (settled.has(key)) return;
    const pending = inFlight.get(key);
    if (pending) return pending;
    // The name arrives in a request and is pasted into a path. The read
    // permission already keeps that inside data/, and a name that is not a
    // bare file name is not a lexicon either.
    if (name.includes("/") || name.includes("\\")) {
      settled.add(key);
      return;
    }
    const promise = (async () => {
      for (const { file, load } of candidates(kind, name)) {
        let data;
        try {
          data = await Deno.readFile(`data/${file}`);
        } catch (e) {
          // Absent, or shut out: try the next spelling. Anything else is a
          // failure to read rather than a verdict on the name, so let it out
          // and leave the name unsettled.
          if (
            e instanceof Deno.errors.NotFound ||
            e instanceof Deno.errors.NotCapable
          ) continue;
          throw e;
        }
        load(data);
        resident.add(key);
        break;
      }
      // Reached whether or not a file was found. The wasm holds a few names of
      // its own ("noleave", the rules) and reports the rest as missing, which
      // is what it did when every file was loaded at boot.
      settled.add(key);
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };

  // A real removal: the next use of the name says "missing kwg" or "missing
  // klv" unless it is loaded again, which the next request that names it does.
  const evict = (key: string) => {
    const [kind, name] = [key.slice(0, 3), key.slice(4)];
    if (kind === "klv") evict_klv(name);
    else evict_kwg(name);
    resident.delete(key);
    settled.delete(key);
  };

  const hold = (key: string) => {
    holders.set(key, (holders.get(key) ?? 0) + 1);
    const timer = timers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(key);
    }
  };

  const release = (key: string) => {
    const left = (holders.get(key) ?? 1) - 1;
    if (left > 0) {
      holders.set(key, left);
      return;
    }
    holders.delete(key);
    if (!resident.has(key)) return;
    const timer = setTimeout(() => {
      timers.delete(key);
      if (!holders.has(key)) evict(key);
    }, idleMs);
    // An idle table never keeps the process alive by itself.
    Deno.unrefTimer(timer);
    timers.set(key, timer);
  };

  // Runs use with what the request body names loaded and held. The loads are
  // awaited one after the other, so at most one file's bytes are ever live.
  const withRequested = async <T>(
    body: string,
    use: () => Promise<T>,
  ): Promise<T> => {
    let req;
    try {
      req = JSON.parse(body);
    } catch {
      return await use(); // let the wasm report the malformed request
    }
    const keys: [Kind, string][] = [];
    if (typeof req?.lexicon === "string") keys.push(["kwg", req.lexicon]);
    if (typeof req?.leave === "string") keys.push(["klv", req.leave]);
    for (const [kind, name] of keys) hold(`${kind}:${name}`);
    try {
      for (const [kind, name] of keys) await ensure(kind, name);
      return await use();
    } finally {
      for (const [kind, name] of keys) release(`${kind}:${name}`);
    }
  };

  return { withRequested, resident };
};
