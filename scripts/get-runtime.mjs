// Downloads Pyodide 0.26.4 and prepares build/runtime-plain (about 300 MB download, once).
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
const V = "0.26.4", dir = "build/pyodide-dist";
if (!existsSync("build/runtime-plain/pyodide.asm.wasm")) {
  mkdirSync(dir, { recursive: true });
  if (!existsSync(`${dir}/pyodide/pyodide.asm.wasm`)) {
    console.log("Downloading Pyodide", V, "…");
    execSync(`curl -L -o ${dir}/pyodide.tar.bz2 https://github.com/pyodide/pyodide/releases/download/${V}/pyodide-${V}.tar.bz2`, { stdio: "inherit" });
    execSync(`tar -xjf ${dir}/pyodide.tar.bz2 -C ${dir}`, { stdio: "inherit" });
  }
  const py = process.platform === "win32" ? "python" : "python3";
  execSync(`${py} scripts/prepare_runtime.py ${dir}/pyodide build/runtime-plain`, { stdio: "inherit" });
}
console.log("Runtime ready in build/runtime-plain");
