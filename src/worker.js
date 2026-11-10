/* PyPharm Python worker — runs Pyodide off the UI thread.
   Messages in : init | run | complete | check | load | pip
   Messages out: status | out | plot | done | ready | reply | fatal */
"use strict";
const BASE = self.location.href.replace(/[^/]*$/, "");
const RT = BASE + "pyodide/";
let py = null, manifest = { chunks: {}, extra: [], bundled: [] };
let skipOut = 0, skipPlots = 0, outCount = 0, plotCount = 0, outCap = 0;
const OUT_LIMIT = 2_000_000;

/* Reassemble files that were split into .partN pieces for hosting limits. */
const nativeFetch = self.fetch.bind(self);
self.fetch = async (input, opts) => {
  const url = String(input instanceof Request ? input.url : input);
  const name = decodeURIComponent(url.split("?")[0].split("/").pop());
  const n = manifest.chunks[name];
  const sfx = (manifest.renamed || []).includes(name) ? ".wasm" : "";
  const type = name.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
  if (!n && !sfx) return nativeFetch(input, opts);
  if (!n) {
    const r = await nativeFetch(url.split("?")[0] + sfx);
    if (!r.ok) return r;
    return new Response(await r.blob(), { status: 200, headers: { "Content-Type": type } });
  }
  const parts = await Promise.all(Array.from({ length: n }, (_, i) =>
    nativeFetch(url.split("?")[0] + ".part" + i + sfx).then(r => {
      if (!r.ok) throw new Error("Missing piece " + i + " of " + name);
      return r.arrayBuffer();
    })));
  return new Response(new Blob(parts, { type }), { status: 200, headers: { "Content-Type": type } });
};

const post = (m, t) => self.postMessage(m, t || []);
const status = (text, kind = "info") => post({ type: "status", text, kind });

function emitOut(text, stream) {
  if (!text) return;
  // Suppress output already shown before an input() replay.
  if (skipOut > 0) {
    if (text.length <= skipOut) { skipOut -= text.length; outCount += text.length; return; }
    outCount += skipOut; text = text.slice(skipOut); skipOut = 0;
  }
  outCount += text.length;
  if (outCap > OUT_LIMIT) return;
  outCap += text.length;
  if (outCap > OUT_LIMIT) text += "\n… output truncated after 2 MB …\n";
  post({ type: "out", text, stream });
}
self.pyEmitPlot = (b64) => {
  plotCount++;
  if (skipPlots > 0) { skipPlots--; return; }
  post({ type: "plot", png: b64 });
};
self.pyOutLen = () => outCount;

const PRELUDE = String.raw`
import sys, os, io, builtins, base64, traceback, types, reprlib, time, json, textwrap
import js
WORK = "/home/pyodide/work"
os.makedirs(WORK, exist_ok=True)
os.chdir(WORK)
sys.path.insert(0, WORK)
os.environ["MPLBACKEND"] = "AGG"
import warnings
warnings.filterwarnings("ignore", message="(?s).*Pyarrow will become a required dependency")
warnings.filterwarnings("ignore", message=".*non-GUI backend.*")
warnings.filterwarnings("ignore", message=".*FigureCanvasAgg is non-interactive.*")

class _NeedInput(BaseException):
    pass

_S = {"inputs": [], "idx": 0}
def _pp_input(prompt=""):
    prompt = str(prompt)
    sys.stdout.write(prompt); sys.stdout.flush()
    if _S["idx"] < len(_S["inputs"]):
        v = _S["inputs"][_S["idx"]]; _S["idx"] += 1
        sys.stdout.write(v + "\n"); sys.stdout.flush()
        return v
    raise _NeedInput(prompt)
builtins.input = _pp_input

def _pp_flush_figs():
    if "matplotlib.pyplot" not in sys.modules: return
    plt = sys.modules["matplotlib.pyplot"]
    for num in plt.get_fignums():
        fig = plt.figure(num)
        buf = io.BytesIO()
        try:
            fig.savefig(buf, format="png", dpi=120, bbox_inches="tight", facecolor="white")
            js.pyEmitPlot(base64.b64encode(buf.getvalue()).decode())
        except Exception as e:
            sys.stderr.write(f"[plot could not be drawn: {e}]\n")
    plt.close("all")

def _pp_prepare_mpl(force=False):
    if "matplotlib" not in sys.modules and not force: return
    import matplotlib
    matplotlib.use("agg")
    import matplotlib.pyplot as plt
    if getattr(plt.show, "_pp", False): return
    def show(*a, **k): _pp_flush_figs()
    show._pp = True
    plt.show = show

_rep = reprlib.Repr(); _rep.maxstring = 80; _rep.maxother = 80; _rep.maxlist = 12; _rep.maxdict = 8; _rep.maxtuple = 12; _rep.maxset = 12

def _pp_short(v):
    try:
        if type(v).__name__ in ("DataFrame", "Series", "ndarray"):
            s = repr(v)
            return s if len(s) < 300 else s[:300] + " …"
        return _rep.repr(v)
    except Exception as e:
        return f"<unprintable {type(v).__name__}>"

def _pp_size(v):
    sh = getattr(v, "shape", None)
    if isinstance(sh, tuple): return " × ".join(map(str, sh)) or "scalar"
    if isinstance(v, (list, tuple, dict, set, str, bytes)): return str(len(v))
    return ""

_HIDE = set()
def _pp_vars(g):
    out = []
    for k, v in list(g.items()):
        if k.startswith("_") or k in _HIDE: continue
        if isinstance(v, types.ModuleType): continue
        t = type(v).__name__
        if isinstance(v, type): t = "class"
        elif callable(v) and isinstance(v, (types.FunctionType, types.BuiltinFunctionType)): t = "function"
        info = {"name": k, "type": t, "size": _pp_size(v), "preview": _pp_short(v)}
        try:
            if t in ("DataFrame", "Series"):
                info["html"] = (v.to_frame() if t == "Series" else v).head(200).to_html(border=0, max_cols=30)
        except Exception:
            pass
        out.append(info)
    return out

def _pp_frames(tb):
    return [f for f in traceback.extract_tb(tb) if f.filename == "<main>" or f.filename.startswith(WORK)]

def _pp_error(e, code_lines):
    et = type(e).__name__
    if isinstance(e, SyntaxError):
        line = e.lineno or 0
        text = "".join(traceback.format_exception_only(type(e), e))
        return {"etype": et, "msg": e.msg, "line": line, "col": e.offset or 0, "file": "main", "tb": text}
    frames = _pp_frames(e.__traceback__)
    line = 0
    for f in frames:
        if f.filename == "<main>": line = f.lineno
    lines = ["Traceback (most recent call last):"]
    for f in frames:
        where = "your code" if f.filename == "<main>" else os.path.basename(f.filename)
        src = code_lines[f.lineno - 1].strip() if f.filename == "<main>" and 0 < f.lineno <= len(code_lines) else (f.line or "")
        lines.append(f'  {where}, line {f.lineno}, in {f.name}')
        if src: lines.append("    " + src)
    lines.append("".join(traceback.format_exception_only(type(e), e)).strip())
    return {"etype": et, "msg": str(e), "line": line, "col": 0, "file": "main", "tb": "\n".join(lines)}

def _pp_clear_user_modules():
    for name, m in list(sys.modules.items()):
        f = getattr(m, "__file__", None) or ""
        if f.startswith(WORK): del sys.modules[name]

class _Tracer:
    def __init__(self, maxsteps):
        self.steps = []; self.maxsteps = maxsteps; self.truncated = False
    def snap(self, frame, event, arg=None):
        if len(self.steps) >= self.maxsteps:
            self.truncated = True; return
        stack = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == "<main>": stack.append(f.f_code.co_name)
            f = f.f_back
        loc = []
        for k, v in list(frame.f_locals.items()):
            if k.startswith("__") or isinstance(v, types.ModuleType): continue
            if frame.f_code.co_name == "<module>" and (k.startswith("_") or k in _HIDE): continue
            loc.append([k, type(v).__name__, _pp_short(v)])
        step = {"line": frame.f_lineno, "event": event, "func": frame.f_code.co_name,
                "stack": stack[::-1], "vars": loc, "out": js.pyOutLen()}
        if event == "return": step["ret"] = _pp_short(arg)
        if event == "exception": step["exc"] = f"{arg[0].__name__}: {arg[1]}"
        self.steps.append(step)
    def __call__(self, frame, event, arg):
        if frame.f_code.co_filename != "<main>": return None
        if event in ("line", "return", "exception"): self.snap(frame, event, arg)
        return self

def _pp_run(code, inputs, mode, use_mpl=False, maxsteps=4000):
    _S["inputs"] = list(inputs); _S["idx"] = 0
    import random; random.seed(20240601)
    if "numpy" in sys.modules: sys.modules["numpy"].random.seed(20240601)
    os.chdir(WORK)
    _pp_clear_user_modules()
    _pp_prepare_mpl(use_mpl)
    code_lines = code.split("\n")
    g = {"__name__": "__main__", "__file__": "main.py", "__builtins__": builtins}
    res = {"status": "ok"}
    tracer = None
    t0 = time.perf_counter()
    try:
        compiled = compile(code, "<main>", "exec")
    except SyntaxError as e:
        return json.dumps({"status": "error", "error": _pp_error(e, code_lines), "vars": [], "elapsed": 0})
    try:
        if mode == "debug":
            tracer = _Tracer(maxsteps)
            sys.settrace(tracer)
        exec(compiled, g)
    except _NeedInput as e:
        res = {"status": "input", "prompt": str(e)}
    except SystemExit:
        pass
    except BaseException as e:
        res = {"status": "error", "error": _pp_error(e, code_lines)}
    finally:
        sys.settrace(None)
        sys.stdout.flush(); sys.stderr.flush()
    if res["status"] != "input":
        _pp_prepare_mpl()
        _pp_flush_figs()
    res["elapsed"] = time.perf_counter() - t0
    res["vars"] = _pp_vars(g) if res["status"] != "input" else []
    if tracer:
        res["trace"] = tracer.steps; res["truncated"] = tracer.truncated
    return json.dumps(res)

def _pp_check(code):
    try:
        compile(code, "<main>", "exec")
        return json.dumps(None)
    except SyntaxError as e:
        return json.dumps({"line": e.lineno or 0, "col": e.offset or 0, "msg": e.msg, "etype": type(e).__name__})

def _pp_complete(code, line, col):
    import jedi
    try:
        cs = jedi.Script(code, path=os.path.join(WORK, "main.py")).complete(line, col)
    except Exception:
        return "[]"
    return json.dumps([[c.name, c.type, c.name_with_symbols] for c in cs[:120] if not c.name.startswith("__")])

def _pp_clear():
    for root, dirs, names in os.walk(WORK, topdown=False):
        for n in names: os.remove(os.path.join(root, n))
        for d in dirs:
            try: os.rmdir(os.path.join(root, d))
            except OSError: pass

def _pp_list():
    out = []
    for root, dirs, names in os.walk(WORK):
        dirs[:] = [d for d in dirs if d != "__pycache__"]
        for n in names:
            p = os.path.join(root, n)
            out.append([os.path.relpath(p, WORK), os.path.getsize(p), os.path.getmtime(p)])
    return json.dumps(out)

_HIDE.update(k for k in list(globals()) if not k.startswith("_"))
`;

const EXTRA_DEPS = {
  seaborn: { pkgs: ["numpy", "pandas", "matplotlib", "scipy"], wheels: ["seaborn"] },
  openpyxl: { pkgs: [], wheels: ["et_xmlfile", "openpyxl"] },
  tabulate: { pkgs: [], wheels: ["tabulate"] },
};

async function loadFor(code) {
  const mods = new Set();
  for (const m of code.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w., ]+))/gm)) {
    const names = (m[1] || m[2]).split(",").map(s => s.trim().split(/\s+/)[0].split(".")[0]);
    names.forEach(n => n && mods.add(n));
  }
  // pandas.read_excel / to_excel need openpyxl
  if (/read_excel|to_excel|ExcelWriter/.test(code)) mods.add("openpyxl");
  for (const [name, spec] of Object.entries(EXTRA_DEPS)) {
    if (!mods.has(name)) continue;
    if (spec.pkgs.length) await loadPkgs(spec.pkgs);
    await py.loadPackage("micropip");
    const mp = py.pyimport("micropip");
    for (const w of spec.wheels) {
      const file = manifest.extra.find(f => f.toLowerCase().startsWith(w.toLowerCase() + "-"));
      if (!file) continue;
      try { py.pyimport(w); continue; } catch (_) { /* not installed yet */ }
      status("Installing " + w + "…");
      await mp.install.callKwargs(RT + "extra/" + file, { deps: false });
    }
  }
  await py.loadPackagesFromImports(code, {
    messageCallback: (m) => { if (/^Loading/.test(m)) status(m.replace(/, /g, ", ").slice(0, 140) + "…"); },
    errorCallback: (m) => status(m, "warn"),
  });
}

function loadedList() {
  const l = Object.keys(py.loadedPackages);
  for (const w of Object.keys(EXTRA_DEPS)) { try { py.pyimport(w); l.push(w); } catch (_) { /* not installed */ } }
  return l;
}

async function loadPkgs(names) {
  await py.loadPackage(names, {
    messageCallback: (m) => { if (/^Loading/.test(m)) status(m.slice(0, 140) + "…"); },
    errorCallback: (m) => status(m, "warn"),
  });
}

async function init(msg) {
  try {
    const r = await nativeFetch(RT + "pypharm-runtime.json");
    if (r.ok) manifest = await r.json();
  } catch (_) { /* plain runtime without manifest */ }
  status("Starting Python…");
  importScripts(RT + "pyodide.js");
  py = await loadPyodide({ indexURL: RT });
  const dec = (s) => (buf) => { emitOut(new TextDecoder().decode(buf), s); return buf.length; };
  py.setStdout({ write: dec("out") });
  py.setStderr({ write: dec("err") });
  py.runPython(PRELUDE);
  for (const p of msg.preload || []) {
    try { await loadPkgs([p]); } catch (_) { /* ignore */ }
  }
  post({ type: "ready", loaded: loadedList(), version: py.runPython("import sys; sys.version.split()[0]"),
         pyodide: py.version, bundled: manifest.bundled, extra: manifest.extra });
}

async function run(msg) {
  skipOut = msg.skipOut || 0; skipPlots = msg.skipPlots || 0;
  outCount = 0; plotCount = 0; outCap = 0;
  // Packages needed by this script and by any of its own modules it imports.
  const mine = new Set([...msg.code.matchAll(/^\s*(?:from\s+(\w+)|import\s+(\w+))/gm)].map(m => m[1] || m[2]));
  const used = Object.entries(msg.modules || {}).filter(([n]) => mine.has(n.replace(/\.py$/, ""))).map(([, c]) => c);
  const scan = msg.code + "\n" + used.join("\n");
  try {
    await loadFor(scan);
  } catch (e) {
    emitOut("Could not load a package: " + e.message + "\n", "err");
  }
  status("Running…", "run");
  const fs = {};
  for (const [k, v] of Object.entries(msg.files || {})) fs[k] = v;
  const enc = new TextEncoder();
  for (const [k, v] of Object.entries(msg.modules || {})) fs[k] = enc.encode(v);
  py.globals.get("_pp_clear")();
  for (const [name, data] of Object.entries(fs)) {
    const p = "/home/pyodide/work/" + name;
    const dir = p.slice(0, p.lastIndexOf("/"));
    py.FS.mkdirTree(dir);
    py.FS.writeFile(p, data);
  }
  const before = JSON.parse(py.globals.get("_pp_list")());
  const res = JSON.parse(py.globals.get("_pp_run")(msg.code, py.toPy(msg.inputs || []), msg.mode || "run", /matplotlib|seaborn|pyplot/.test(scan)));
  res.loaded = loadedList();
  res.outTotal = outCount; res.plotTotal = plotCount;
  // Collect files the program created or changed.
  const after = JSON.parse(py.globals.get("_pp_list")());
  const prev = new Map(before.map(([n, s, t]) => [n, s + ":" + t]));
  const changed = {}; const transfer = [];
  for (const [n, s, t] of after) {
    if (msg.modules && msg.modules[n] !== undefined) continue;
    if (prev.get(n) === s + ":" + t || s > 50_000_000) continue;
    const data = py.FS.readFile("/home/pyodide/work/" + n);
    changed[n] = data; transfer.push(data.buffer);
  }
  res.files = changed;
  res.allFiles = after.map(a => a[0]).filter(n => !(msg.modules && msg.modules[n] !== undefined));
  post({ type: "done", res }, transfer);
}

self.onmessage = async (ev) => {
  const msg = ev.data;
  try {
    if (msg.type === "init") return await init(msg);
    if (!py) return;
    if (msg.type === "run") return await run(msg);
    if (msg.type === "check") {
      return post({ type: "reply", id: msg.id, value: JSON.parse(py.globals.get("_pp_check")(msg.code)) });
    }
    if (msg.type === "complete") {
      if (!py.loadedPackages.jedi) await loadPkgs(["jedi"]);
      const imports = msg.code.split("\n").filter(l => /^\s*(import|from)\s+\w/.test(l)).map(l => l.trim()).join("\n");
      try { await loadFor(imports); } catch (_) { /* suggestions still work for the rest */ }
      return post({ type: "reply", id: msg.id, value: JSON.parse(py.globals.get("_pp_complete")(msg.code, msg.line, msg.col)) });
    }
    if (msg.type === "load") {
      if (msg.extra) await loadFor("import " + msg.names.join(", "));
      else await loadPkgs(msg.names);
      return post({ type: "reply", id: msg.id, value: { ok: true, loaded: loadedList() } });
    }
    if (msg.type === "pip") {
      await py.loadPackage("micropip");
      const mp = py.pyimport("micropip");
      try {
        status("Installing " + msg.name + " from PyPI…");
        await mp.install(msg.name);
        return post({ type: "reply", id: msg.id, value: { ok: true } });
      } catch (e) {
        return post({ type: "reply", id: msg.id, value: { ok: false, error: String(e.message || e).split("\n").slice(-2).join(" ") } });
      }
    }
  } catch (e) {
    const text = String(e && e.message || e);
    if (msg.type === "init") post({ type: "fatal", text });
    else if (msg.type === "run") post({ type: "done", res: { status: "error", error: { etype: "InternalError", msg: text, line: 0, tb: text }, vars: [], files: {}, allFiles: [] } });
    else post({ type: "reply", id: msg.id, value: null, error: text });
  }
};
