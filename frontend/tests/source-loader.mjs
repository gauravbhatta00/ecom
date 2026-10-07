import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

export function createSourceLoader({ fetch: fetchImplementation, storage = new Map(), mode = "live", blockedStorage = false } = {}) {
  const context = vm.createContext({
    console, Headers, Response, Request, FormData, AbortController, AbortSignal, URL,
    process: { env: { NEXT_PUBLIC_API_URL: "https://api.example.test", NEXT_PUBLIC_CATALOG_MODE: mode } },
    window: { localStorage: {
      getItem: key => { if (blockedStorage) throw new Error("Storage blocked"); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (blockedStorage) throw new Error("Storage blocked"); storage.set(key, value); },
      removeItem: key => { if (blockedStorage) throw new Error("Storage blocked"); storage.delete(key); },
    } },
    fetch: fetchImplementation || (() => { throw new Error("Unexpected network request in test"); }),
  });
  context.localStorage = context.window.localStorage;
  const cache = new Map();
  function load(relative) {
    let filename = path.resolve(sourceRoot, relative);
    if (!path.extname(filename)) filename += fs.existsSync(filename + ".ts") ? ".ts" : ".js";
    if (cache.has(filename)) return cache.get(filename).exports;
    const record = { exports: {} };
    cache.set(filename, record);
    const source = fs.readFileSync(filename, "utf8");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const run = new vm.Script("(function(require,module,exports){" + code + "\n})", { filename }).runInContext(context);
    const resolve = specifier => {
      if (specifier.startsWith("@/")) return load(specifier.slice(2));
      if (specifier.startsWith(".")) return load(path.relative(sourceRoot, path.resolve(path.dirname(filename), specifier)));
      return require(specifier);
    };
    run(resolve, record, record.exports);
    return record.exports;
  }
  return { load, storage, context };
}
