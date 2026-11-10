"""Copy the parts of a Pyodide distribution PyPharm needs into an output folder.

usage: python prepare_runtime.py <pyodide_dist_dir> <out_dir> [--chunk MB]
--chunk splits any file larger than MB megabytes into .partN pieces and stores
archives under a ".wasm" suffix (claude.ai hosting limits). Desktop, mobile and
self-hosted builds do not need it.
"""
import json, os, shutil, sys

BUNDLE = ["numpy", "pandas", "matplotlib", "scipy", "scikit-learn", "statsmodels",
          "sympy", "jedi", "micropip", "sqlite3", "pillow"]
CORE = ["pyodide.js", "pyodide.asm.js", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide.mjs"]

src, out = sys.argv[1], sys.argv[2]
chunk_mb = None
if "--chunk" in sys.argv:
    chunk_mb = float(sys.argv[sys.argv.index("--chunk") + 1])
os.makedirs(out, exist_ok=True)
lock = json.load(open(os.path.join(src, "pyodide-lock.json")))
P = lock["packages"]
keep = set()
def add(n):
    n = n.lower()
    if n in keep: return
    keep.add(n)
    for d in P[n]["depends"]: add(d)
for n in BUNDLE: add(n)
lock["packages"] = {k: v for k, v in P.items() if k in keep}
files = CORE + [P[k]["file_name"] for k in keep]
chunks = {}
renamed = []
SERVED = (".js", ".mjs", ".json", ".wasm")
for f in files:
    s = os.path.join(src, f)
    if not os.path.exists(s): continue
    size = os.path.getsize(s)
    sfx = ".wasm" if chunk_mb and not f.endswith(SERVED) else ""
    if sfx: renamed.append(f)
    if chunk_mb and size > chunk_mb * 1e6:
        step = int(chunk_mb * 1e6); n = 0
        with open(s, "rb") as fh:
            while True:
                b = fh.read(step)
                if not b: break
                open(os.path.join(out, f"{f}.part{n}{sfx}"), "wb").write(b); n += 1
        chunks[f] = n
    else:
        shutil.copy(s, os.path.join(out, f + sfx))
json.dump(lock, open(os.path.join(out, "pyodide-lock.json"), "w"))
extra_dir = os.path.join(os.path.dirname(__file__), "..", "runtime-extra")
os.makedirs(os.path.join(out, "extra"), exist_ok=True)
extras = sorted(w for w in os.listdir(extra_dir) if w.endswith(".whl"))
for w in extras:
    sfx = ".wasm" if chunk_mb else ""
    if sfx: renamed.append(w)
    shutil.copy(os.path.join(extra_dir, w), os.path.join(out, "extra", w + sfx))
json.dump({"chunks": chunks, "renamed": renamed, "extra": extras, "bundled": sorted(keep)},
          open(os.path.join(out, "pypharm-runtime.json"), "w"), indent=1)
print(f"{len(keep)} packages, {len(chunks)} chunked files ->", out)
