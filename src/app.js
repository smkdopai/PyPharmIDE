/* PyPharm — main UI */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) n.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(String(k)));
  return n;
};
const icon = (id) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.innerHTML = `<use href="#${id}"/>`; return s; };
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";
const store = {
  get(k, d) { try { const v = localStorage.getItem("pypharm:" + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem("pypharm:" + k, JSON.stringify(v)); } catch (_) { /* storage unavailable */ } },
};
const fmtBytes = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(1) + " KB" : (n / 1048576).toFixed(1) + " MB";
const now = () => new Date().toTimeString().slice(0, 8);
const TEXT_EXT = /\.(py|pyw|txt|csv|tsv|json|md|ini|cfg|yaml|yml|xml|html|log|dat)$/i;
const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;
const DATA_EXT = /\.(csv|tsv|xlsx?|json|dat|parquet|sqlite|db)$/i;

/* ---------------- settings ---------------- */
const S = Object.assign({ theme: "system", font: 14, auto: true, wrap: false, keys: null, clear: true }, store.get("settings", {}));
function applySettings() {
  const root = document.documentElement;
  if (S.theme === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", S.theme);
  root.style.setProperty("--code-size", S.font + "px");
  const touch = S.keys == null ? matchMedia("(pointer: coarse)").matches : S.keys;
  document.body.classList.toggle("touch", !!touch);
  if (window.cm) { cm.setOption("lineWrapping", S.wrap); cm.refresh(); }
  store.set("settings", S);
}

/* ---------------- editor ---------------- */
const PY_WORDS = ("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case " +
  "abs all any bin bool bytes callable chr dict dir divmod enumerate eval filter float format frozenset getattr hasattr hash help hex id input int isinstance issubclass iter len list map max min next object oct open ord pow print range repr reversed round set setattr slice sorted str sum super tuple type vars zip " +
  "Exception ValueError TypeError KeyError IndexError ZeroDivisionError FileNotFoundError").split(" ");

const cm = window.cm = CodeMirror.fromTextArea($("#ed"), {
  mode: { name: "python", version: 3, singleLineStringErrors: false },
  theme: "pp", lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, smartIndent: true,
  matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true, foldGutter: true, lineWrapping: S.wrap,
  gutters: ["bp-gutter", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Tab": (c) => c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("    ", "end"),
    "Shift-Tab": (c) => c.indentSelection("subtract"),
    "Backspace": smartBackspace,
    "Ctrl-Enter": () => run(), "Cmd-Enter": () => run(), "F5": () => run(), "Shift-F5": () => stop(), "F6": () => run("debug"),
    "F9": (c) => toggleBp(c.getCursor().line),
    "Ctrl-/": "toggleComment", "Cmd-/": "toggleComment",
    "Ctrl-Space": () => complete(true), "Cmd-Space": () => complete(true),
    "Ctrl-S": () => saveActive(), "Cmd-S": () => saveActive(),
    "Ctrl-F": "findPersistent", "Cmd-F": "findPersistent", "Ctrl-H": "replace", "Cmd-Alt-F": "replace",
    "Ctrl-=": () => zoom(1), "Cmd-=": () => zoom(1), "Ctrl--": () => zoom(-1), "Cmd--": () => zoom(-1),
    "Ctrl-D": "duplicateLine", "Alt-Up": "swapLineUp", "Alt-Down": "swapLineDown",
  },
});
CodeMirror.commands.duplicateLine = (c) => { const l = c.getCursor().line; c.replaceRange(c.getLine(l) + "\n", { line: l, ch: 0 }); };
CodeMirror.commands.swapLineUp = (c) => swapLine(c, -1);
CodeMirror.commands.swapLineDown = (c) => swapLine(c, 1);
function swapLine(c, d) {
  const l = c.getCursor().line, o = l + d;
  if (o < 0 || o >= c.lineCount()) return;
  const a = c.getLine(l), b = c.getLine(o), cur = c.getCursor();
  c.operation(() => { c.replaceRange(b, { line: l, ch: 0 }, { line: l, ch: a.length }); c.replaceRange(a, { line: o, ch: 0 }, { line: o, ch: b.length }); c.setCursor({ line: o, ch: cur.ch }); });
}
function smartBackspace(c) {
  if (c.somethingSelected()) return CodeMirror.Pass;
  const cur = c.getCursor(), before = c.getLine(cur.line).slice(0, cur.ch);
  if (before.length && /^ +$/.test(before)) {
    const n = ((before.length - 1) % 4) + 1;
    c.replaceRange("", { line: cur.line, ch: cur.ch - n }, cur); return;
  }
  return CodeMirror.Pass;
}
function zoom(d) { S.font = Math.min(28, Math.max(10, S.font + d)); applySettings(); }

/* ---------------- tabs ---------------- */
let tabs = [], active = null, tabSeq = 0;
function makeTab(name, code, opts = {}) {
  const t = { id: ++tabSeq, name, doc: CodeMirror.Doc(code, { name: "python", version: 3 }), saved: opts.saved ?? true, bps: new Set(opts.bps || []) };
  t.doc.on("change", () => { if (t.saved) { t.saved = false; renderTabs(); } persistSoon(); clearErrorMarks(t); scheduleCheck(); });
  tabs.push(t); return t;
}
function activate(t) {
  active = t; cm.swapDoc(t.doc); renderTabs(); renderBps(); cm.focus(); updatePos(); scheduleCheck(0);
  if (debug && debug.tabId === t.id) showStep(debug.i);
}
function uniqueName(base) {
  let n = base, i = 1; const stem = base.replace(/(\.\w+)$/, ""), ext = (base.match(/\.\w+$/) || [".py"])[0];
  while (tabs.some(t => t.name === n)) n = `${stem}${++i}${ext}`;
  return n;
}
function newTab(name = "untitled.py", code = "") {
  const t = makeTab(uniqueName(name), code, { saved: true }); activate(t); persistSoon(); return t;
}
function closeTab(t) {
  const doClose = () => {
    const i = tabs.indexOf(t); tabs.splice(i, 1);
    if (!tabs.length) newTab("main.py", "");
    else if (active === t) activate(tabs[Math.max(0, i - 1)]);
    else renderTabs();
    persistSoon();
  };
  if (t.doc.getValue().trim() && !t.saved) {
    confirmBox(`Close ${t.name}?`, "This tab has changes you haven't saved to your device. Closing removes its code from PyPharm.", "Close tab", doClose);
  } else doClose();
}
function renderTabs() {
  const box = $("#tabs"); box.textContent = "";
  for (const t of tabs) {
    const b = el("div", { class: "tab" + (t === active ? " on" : ""), role: "tab", tabindex: "0", "aria-selected": t === active ? "true" : "false", title: "Double-click to rename" },
      el("span", { class: "nm" }, t.name),
      t.saved ? null : el("i", { class: "mod", title: "Not saved to your device" }),
      el("button", { class: "x", title: "Close tab", "aria-label": "Close " + t.name, onclick: (e) => { e.stopPropagation(); closeTab(t); } }, "×"));
    b.addEventListener("click", () => { if (t !== active) activate(t); });
    b.addEventListener("keydown", (e) => { if (e.key === "Enter") activate(t); });
    b.addEventListener("dblclick", () => renameTab(t, b));
    box.append(b);
  }
  box.append(el("button", { class: "tab-add", title: "New tab", "aria-label": "New tab", onclick: () => newTab() }, "+"));
}
function renameTab(t, node) {
  const inp = el("input", { value: t.name, "aria-label": "Tab name" });
  node.querySelector(".nm").replaceWith(inp); inp.focus(); inp.select();
  const done = (ok) => {
    let v = inp.value.trim();
    if (ok && v) { if (!/\.\w+$/.test(v)) v += ".py"; if (v !== t.name) t.name = tabs.some(x => x !== t && x.name === v) ? uniqueName(v) : v; }
    renderTabs(); persistSoon();
  };
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") done(false); e.stopPropagation(); });
  inp.addEventListener("blur", () => done(true));
}
let persistTimer;
function persistSoon() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    store.set("tabs", { active: tabs.indexOf(active), list: tabs.map(t => ({ name: t.name, code: t.doc.getValue(), saved: t.saved, bps: [...t.bps] })) });
  }, 400);
}

/* breakpoints */
function toggleBp(line) {
  if (!active) return;
  active.bps.has(line) ? active.bps.delete(line) : active.bps.add(line);
  renderBps(); persistSoon();
}
function renderBps() {
  cm.clearGutter("bp-gutter");
  for (const l of active.bps) if (l < cm.lineCount()) cm.setGutterMarker(l, "bp-gutter", el("div", { class: "bp", title: "Breakpoint" }));
}
cm.on("gutterClick", (c, line, gutter) => { if (gutter !== "CodeMirror-foldgutter") toggleBp(line); });
cm.on("change", (c, ch) => {
  // keep breakpoints attached to their lines when lines are added/removed
  const added = ch.text.length - 1, removed = ch.to.line - ch.from.line, delta = added - removed;
  if (!delta || !active) return;
  const nb = new Set();
  for (const l of active.bps) { if (l <= ch.from.line) nb.add(l); else if (l > ch.to.line || delta > 0) nb.add(Math.max(ch.from.line, l + delta)); }
  active.bps = nb; renderBps();
});

/* cursor position */
function updatePos() { const c = cm.getCursor(); $("#sbPos").textContent = `Ln ${c.line + 1}, Col ${c.ch + 1}`; }
cm.on("cursorActivity", updatePos);

/* ---------------- worker ---------------- */
let worker = null, wReady = false, busy = false, pyInfo = null, reqSeq = 0;
const pending = new Map();
let loadedPkgs = new Set();
function startWorker() {
  wReady = false; setPill("loading", "Starting Python…");
  if (location.protocol === "file:") {
    setPill("err", "Open through a web address");
    log("err", "PyPharm was opened directly from a folder (file://), and browsers block the Python engine there.\n" +
      "Serve the folder instead: open Terminal (or Command Prompt) in this folder and run\n" +
      "    python3 -m http.server 8000\n" +
      "then visit http://localhost:8000 — or upload the folder to a website (https).\n" +
      "The desktop and Android apps do not need this step.");
    sysLine("Python could not start: the page was opened from a file, not a web address.", "bad");
    return;
  }
  try { worker = new Worker("worker.js"); }
  catch (e) { setPill("err", "Python could not start"); log("err", "This browser could not start the Python engine: " + e.message); return; }
  worker.onmessage = onWorker;
  worker.onerror = (e) => { if (!wReady) { setPill("err", "Python could not start"); log("err", "Python engine error: " + (e.message || "failed to load worker.js")); } };
  worker.postMessage({ type: "init", preload: [] });
}
function request(msg) {
  return new Promise((res, rej) => {
    if (!wReady || busy) return rej(new Error("busy"));
    const id = ++reqSeq; pending.set(id, { res, rej }); worker.postMessage({ ...msg, id });
  });
}
function onWorker(ev) {
  const m = ev.data;
  if (m.type === "status") { if (!wReady || busy) setPill(m.kind === "run" ? "run" : m.kind === "warn" ? "loading" : "loading", m.text); if (m.kind === "warn") log("warn", m.text); return; }
  if (m.type === "ready") {
    wReady = true; pyInfo = m;
    $("#sbPy").textContent = `Python ${m.version}`; $("#abPy").textContent = `Python ${m.version} (Pyodide ${m.pyodide}), running inside the app`;
    loadedPkgs = new Set(m.loaded || []); renderPackages();
    if (!booted) { booted = true; log("ok", `Python ${m.version} is ready. Press ${MOD}+Enter to run.`); }
    else log("ok", "Python restarted.");
    setPill("ready", "Ready");
    // warm up the suggestion engine in the background
    setTimeout(() => { request({ type: "complete", code: "import math\nmath.", line: 2, col: 5 }).then(() => { jediWarm = true; }).catch(() => {}); }, 1500);
    if (queued) { const q = queued; queued = null; run(q); }
    return;
  }
  if (m.type === "fatal") { setPill("err", "Python could not start"); log("err", "Python could not start: " + m.text); return; }
  if (m.type === "out") return writeOut(m.text, m.stream === "err" ? "err" : null);
  if (m.type === "plot") return addPlot(m.png);
  if (m.type === "done") return finish(m.res);
  if (m.type === "reply") { const p = pending.get(m.id); if (p) { pending.delete(m.id); p.res(m.value); } }
}
let booted = false, queued = null, jediWarm = false;

/* ---------------- status pill ---------------- */
let runTimer = null, runStart = 0;
function setPill(kind, text) { $("#pillDot").className = "dot " + kind; $("#pillText").textContent = text; }

/* ---------------- output ---------------- */
const outEl = $("#out");
let outBuf = [], outRaf = 0, outText = "", lastSpan = null, lastCls = undefined;
function writeOut(text, cls) {
  outBuf.push([text, cls]); outText += text; run_.shown += text.length;
  if (!outRaf) outRaf = requestAnimationFrame(flushOut);
}
function flushOut() {
  outRaf = 0;
  const atBottom = outEl.parentElement.scrollHeight - outEl.parentElement.scrollTop - outEl.parentElement.clientHeight < 40;
  for (const [text, cls] of outBuf) {
    if (lastSpan && lastCls === cls && lastSpan === outEl.lastChild) lastSpan.textContent += text;
    else { lastSpan = el("span", cls ? { class: cls } : {}, text); lastCls = cls; outEl.append(lastSpan); }
  }
  outBuf = [];
  if (atBottom) outEl.parentElement.scrollTop = outEl.parentElement.scrollHeight;
  if (isPhone() && $("#main").dataset.view !== "out") $("#nbOut").hidden = false;
}
function sysLine(text, kind = "") { flushOut(); outEl.append(el("span", { class: "sys " + kind }, text)); lastSpan = null; scrollOut(); }
function scrollOut() { const p = outEl.parentElement; p.scrollTop = p.scrollHeight; }
function clearOutput() { outEl.textContent = ""; outText = ""; lastSpan = null; outBuf = []; $("#plots").textContent = ""; plots = []; $("#nPlots").textContent = "0"; }
$("#bClear").onclick = () => { if (!busy) { clearOutput(); emptyOut(); } };
$("#bCopyOut").onclick = async () => {
  try { await navigator.clipboard.writeText(outText); toast("Output copied"); }
  catch (_) { const r = document.createRange(); r.selectNodeContents(outEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Output selected — press " + MOD + "+C to copy"); }
};
function emptyOut() {
  outEl.append(el("div", { class: "empty" }, el("b", {}, "Output appears here"),
    el("span", {}, `Write some code and press Run (${MOD}+Enter). Open the Examples panel for ready-made pharmacy programs.`)));
  lastSpan = null;
}

/* plots */
let plots = [];
function addPlot(b64) {
  flushOut();
  const src = "data:image/png;base64," + b64, n = plots.length + 1, name = `plot_${n}.png`;
  plots.push({ src, name });
  const img = el("img", { class: "plot", src, alt: "Plot " + n, onclick: () => showImage(src, name, b64) });
  outEl.append(img); lastSpan = null; scrollOut();
  $("#plots").append(el("div", { class: "plotcard", onclick: () => showImage(src, name, b64) }, el("img", { src, alt: "Plot " + n }), el("span", {}, name)));
  $("#nPlots").textContent = plots.length;
  run_.plotsShown++;
}
function b64bytes(b64) { const s = atob(b64), a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }

/* messages */
let msgCount = 0;
function log(kind, text) {
  const box = $("#msgs");
  box.prepend(el("div", { class: "msg " + kind }, el("time", {}, now()), el("span", {}, text)));
  msgCount++; $("#nMsgs").textContent = msgCount;
  $("#nMsgs").classList.toggle("err", kind === "err");
}

/* console tabs */
function showConsole(name) {
  for (const b of $$(".ctab")) b.classList.toggle("on", b.dataset.c === name);
  for (const p of $$(".cpanel")) p.hidden = p.dataset.cp !== name;
  if (name === "msgs") $("#nMsgs").classList.remove("err");
}
$$(".ctab").forEach(b => b.onclick = () => showConsole(b.dataset.c));

/* ---------------- running ---------------- */
let run_ = { shown: 0, plotsShown: 0 }, debug = null, lastVars = new Map();
function selectedCode() {
  const sel = cm.getSelection();
  if (sel && sel.trim()) {
    const lines = sel.split("\n"); const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return { code: lines.map(l => l.slice(ind)).join("\n"), offset: cm.getCursor("from").line, partial: true };
  }
  return { code: cm.getValue(), offset: 0, partial: false };
}
function collectFiles() {
  const files = {}; for (const [k, f] of fileMap) files[k] = f.data;
  const modules = {}; for (const t of tabs) if (t !== active && /\.py$/.test(t.name)) modules[t.name] = t.doc.getValue();
  return { files, modules };
}
function run(mode = "run") {
  if (busy) { toast("A program is already running. Stop it first."); return; }
  if (!active) return;
  if (!wReady) { queued = mode; toast("Python is still starting — your code will run as soon as it's ready."); return; }
  if (isPhone()) setView("out");
  const { code, offset, partial } = mode === "debug" ? { code: cm.getValue(), offset: 0, partial: false } : selectedCode();
  if (!code.trim()) { toast("There's no code to run yet."); return; }
  clearErrorMarks(active); endDebug(true);
  if (S.clear) clearOutput(); else if (outText) sysLine("────────", "");
  else outEl.textContent = "";
  run_ = { code, offset, partial, mode, inputs: [], shown: 0, plotsShown: 0, tabId: active.id, tabName: active.name, outBase: outText.length };
  if (S.clear) run_.outBase = 0;
  showConsole("out");
  sysLine(`Running ${active.name}${partial ? ` (lines ${offset + 1}–${offset + code.split("\n").length})` : ""}${mode === "debug" ? " step by step" : ""}…`);
  run_.outBase = outText.length; run_.shown = 0;
  dispatch();
}
function dispatch() {
  busy = true; setRunning(true);
  const { files, modules } = collectFiles();
  runStart = performance.now();
  clearInterval(runTimer);
  runTimer = setInterval(() => { $("#sbTime").textContent = ((performance.now() - runStart) / 1000).toFixed(1) + " s"; }, 100);
  worker.postMessage({ type: "run", code: run_.code, mode: run_.mode, inputs: run_.inputs, skipOut: run_.shown, skipPlots: run_.plotsShown, files, modules });
}
function setRunning(on) {
  $("#bStop").disabled = !on; $("#bRun").disabled = on; $("#bDebug").disabled = on; $("#fab").disabled = on;
  if (on) setPill("run", "Running…");
}
function finish(res) {
  flushOut(); busy = false; clearInterval(runTimer);
  const secs = (performance.now() - runStart) / 1000;
  if (res.status === "input") {
    setRunning(false); $("#bStop").disabled = false; $("#bRun").disabled = true; $("#bDebug").disabled = true;
    setPill("input", "Waiting for your input");
    askInput(res.prompt); return;
  }
  setRunning(false); stopInput();
  $("#sbTime").textContent = secs.toFixed(2) + " s";
  // files written by the program
  let created = 0;
  for (const [name, data] of Object.entries(res.files || {})) { fileMap.set(name, { data, mtime: Date.now(), fresh: true }); saveFileDb(name); created++; }
  if (res.allFiles) for (const k of [...fileMap.keys()]) if (!res.allFiles.includes(k)) { fileMap.delete(k); deleteFileDb(k); }
  if (created) renderFiles();
  renderVars(res.vars || []);
  if (res.loaded) { loadedPkgs = new Set(res.loaded); renderPackages(); }
  if (res.status === "error") {
    const e = res.error; const line = e.line ? e.line + run_.offset : 0;
    writeOut((outText.endsWith("\n") || !outText ? "" : "\n") + e.tb + "\n", "err"); flushOut();
    explainError(e, line);
    setPill("err", `${e.etype}${line ? " on line " + line : ""}`);
    log("err", `${run_.tabName}: ${e.etype}${line ? " on line " + line : ""} — ${e.msg}`);
    markError(line);
  } else {
    sysLine(`Finished in ${secs.toFixed(2)} s${created ? ` · ${created} file${created > 1 ? "s" : ""} saved to Files` : ""}`, "ok");
    setPill("ready", "Finished");
    log("ok", `${run_.tabName} ran in ${secs.toFixed(2)} s.`);
  }
  if (run_.mode === "debug" && res.trace) startDebug(res);
  if (created) log("info", `New or changed files: ${Object.keys(res.files).join(", ")}`);
}
function stop() {
  if (!busy && !inputLive) return;
  worker.terminate(); busy = false; clearInterval(runTimer); stopInput(); setRunning(false);
  flushOut(); sysLine("Stopped by you. Restarting Python…", "bad");
  log("warn", "Program stopped. Python was restarted, so variables were cleared.");
  for (const p of pending.values()) p.rej(new Error("stopped")); pending.clear();
  startWorker();
}

/* input() */
let inputLive = false;
function askInput(prompt) {
  inputLive = true;
  const bar = $("#inputbar"), inp = $("#inp");
  bar.classList.add("live"); inp.disabled = false; $("#inpSend").disabled = false;
  inp.placeholder = "Type your answer and press Enter"; $("#inpLabel").textContent = prompt.trim() ? prompt.trim().slice(0, 60) : "Input";
  showConsole("out");
  if (isPhone()) setView("out");
  setTimeout(() => inp.focus(), 30);
}
function stopInput() {
  inputLive = false; const inp = $("#inp");
  $("#inputbar").classList.remove("live"); inp.disabled = true; inp.value = ""; $("#inpSend").disabled = true;
  inp.placeholder = "Your program isn't asking for input"; $("#inpLabel").textContent = "Input";
}
$("#inputbar").addEventListener("submit", (e) => {
  e.preventDefault(); if (!inputLive) return;
  const v = $("#inp").value; run_.inputs.push(v);
  stopInput();
  dispatch();
});

/* friendly errors */
const EXPLAIN = {
  SyntaxError: ["Python couldn't read this line", "Check for a missing colon <code>:</code> at the end of <code>if</code>, <code>for</code>, <code>def</code> or <code>while</code>, an unclosed bracket or quote, or a typo in a keyword."],
  IndentationError: ["The indentation doesn't line up", "Lines inside a block (after a line ending in <code>:</code>) must all be indented by the same amount — use 4 spaces. Lines that end a block go back to the outer level."],
  TabError: ["Tabs and spaces are mixed", "Use spaces only. Select the block and press Shift+Tab, then Tab, to re-indent it."],
  NameError: ["Python doesn't know this name", "Check the spelling and capital letters, make sure the variable is given a value <i>before</i> this line, and that any module is imported."],
  UnboundLocalError: ["A variable is used before it gets a value inside a function", "Give it a value earlier in the function, or pass it in as a parameter."],
  TypeError: ["A value is the wrong type for this operation", "For example, adding text to a number. <code>input()</code> always returns text — convert it with <code>int()</code> or <code>float()</code>. Also check how many arguments you pass to a function."],
  ValueError: ["The value has the right type but can't be used", "A common cause is <code>float(\"abc\")</code> or <code>int(\"2.5\")</code>. Check the data you typed or read from a file."],
  ZeroDivisionError: ["Division by zero", "Check the denominator before dividing, e.g. <code>if n != 0:</code>."],
  IndexError: ["The list position doesn't exist", "Positions start at 0, so the last item of a list of 5 is <code>[4]</code> or <code>[-1]</code>. Check the length with <code>len()</code>."],
  KeyError: ["That key isn't in the dictionary or table", "Check the spelling and capitals of the key or column name. For pandas, print <code>df.columns</code> to see the exact names."],
  AttributeError: ["This object doesn't have that attribute or method", "Check the spelling, and check the object's type with <code>type(x)</code>. You may be calling a list method on a string or similar."],
  ModuleNotFoundError: ["This package isn't available", "Check the name. Bundled packages (numpy, pandas, matplotlib, scipy, seaborn, scikit-learn, statsmodels, sympy, openpyxl) load automatically. Others can be installed from the Packages panel when you're online. If it's your own module, open it in a tab named <code>module.py</code>."],
  ImportError: ["Something couldn't be imported", "Check the name you are importing from the module, and its spelling."],
  FileNotFoundError: ["The file isn't in the Files panel", "Upload it with the button in the Files panel, and use just its name, e.g. <code>pd.read_csv(\"data.csv\")</code>. Names are case-sensitive."],
  RecursionError: ["A function kept calling itself", "Make sure your recursive function has a base case that stops it."],
  OverflowError: ["The number became too large", "Use smaller values, or numpy/float maths instead of integer powers."],
  MemoryError: ["The program ran out of memory", "Work with smaller data, or process it in pieces."],
  AssertionError: ["An assert check failed", "The condition after <code>assert</code> was False."],
  StopIteration: ["An iterator ran out of items", "Check loops that call <code>next()</code>."],
  KeyboardInterrupt: ["The program was interrupted", ""],
};
function explainError(e, line) {
  const [title, body] = EXPLAIN[e.etype] || ["Python reported an error", "Read the last line of the message above — it names the problem. The line number shows where it happened."];
  const card = el("div", { class: "explain" });
  card.innerHTML = `<h4></h4><p>${body}</p>`;
  card.querySelector("h4").textContent = `${e.etype}${line ? ` on line ${line}` : ""}: ${title}`;
  if (line && active && active.id === run_.tabId) {
    const src = cm.getLine(line - 1);
    if (src != null && src.trim()) { const p = el("p", {}, "Line ", line, ": ", el("code", {}, src.trim())); card.append(p); }
    card.append(el("button", { class: "go", onclick: () => { cm.setCursor({ line: line - 1, ch: 0 }); cm.scrollIntoView(null, 120); cm.focus(); if (isPhone()) setView("code"); } }, "Go to line " + line));
  }
  outEl.append(card); lastSpan = null; scrollOut();
}
let errMarks = [];
function markError(line) {
  if (!line || !active || active.id !== run_.tabId) return;
  const h = cm.addLineClass(line - 1, "background", "cm-errline");
  errMarks.push({ tab: active, h });
  cm.scrollIntoView({ line: line - 1, ch: 0 }, 120);
}
function clearErrorMarks(t) {
  errMarks = errMarks.filter(m => { if (m.tab === t) { try { t.doc.removeLineClass(m.h, "background", "cm-errline"); } catch (_) {} return false; } return true; });
}

/* variables */
function renderVars(vars) {
  const box = $("#vars"); box.textContent = "";
  $("#nVars").textContent = vars.length;
  const next = new Map(vars.map(v => [v.name, v.preview]));
  if (!vars.length) { box.append(el("div", { class: "empty" }, el("b", {}, "No variables yet"), el("span", {}, "After a run, the variables your program created are listed here."))); lastVars = next; return; }
  const tb = el("tbody");
  for (const v of vars) {
    const changed = lastVars.has(v.name) && lastVars.get(v.name) !== v.preview;
    const tr = el("tr", { class: (v.html ? "click" : "") + (changed ? " chg" : ""), title: v.html ? "Click to view the table" : "" },
      el("td", { class: "n" }, v.name), el("td", { class: "t" }, v.type), el("td", { class: "s" }, v.size), el("td", { class: "v" }, v.preview));
    if (v.html) tr.onclick = () => showTable(v.name, v.html);
    tb.append(tr);
  }
  box.append(el("table", { class: "vt" }, el("thead", {}, el("tr", {}, el("th", {}, "Name"), el("th", {}, "Type"), el("th", {}, "Size"), el("th", {}, "Value"))), tb));
  lastVars = next;
}

/* ---------------- step-through debugger ---------------- */
function startDebug(res) {
  const steps = res.trace || [];
  if (!steps.length) { log("warn", "Nothing to step through — the program has no executable lines."); return; }
  debug = { steps, i: 0, tabId: run_.tabId, out: outText.slice(run_.outBase), base: run_.outBase, truncated: res.truncated, mark: null };
  $("#ctabDbg").hidden = false;
  const tab = tabs.find(t => t.id === debug.tabId); if (tab && tab !== active) activate(tab);
  const tab_ = tabs.find(t => t.id === debug.tabId);
  const firstBp = steps.findIndex(s => tab_ && tab_.bps.has(s.line - 1));
  showConsole("dbg");
  showStep(firstBp >= 0 ? firstBp : 0);
  if (isPhone()) setView("code");
}
function endDebug(silent) {
  if (!debug) return;
  if (debug.mark) { try { debug.mark.doc.removeLineClass(debug.mark.h, "background", "cm-debugline"); } catch (_) {} }
  debug = null; $("#ctabDbg").hidden = true; $("#dbg").textContent = "";
  if (!silent) showConsole("out");
}
function showStep(i) {
  if (!debug) return;
  const n = debug.steps.length; i = Math.max(0, Math.min(n - 1, i)); debug.i = i;
  const s = debug.steps[i];
  const tab = tabs.find(t => t.id === debug.tabId);
  if (debug.mark) { try { debug.mark.doc.removeLineClass(debug.mark.h, "background", "cm-debugline"); } catch (_) {} debug.mark = null; }
  if (tab) { const h = tab.doc.addLineClass(s.line - 1, "background", "cm-debugline"); debug.mark = { doc: tab.doc, h }; if (tab === active) cm.scrollIntoView({ line: s.line - 1, ch: 0 }, 100); }
  const box = $("#dbg"); box.textContent = "";
  const bpLines = tab ? tab.bps : new Set();
  const nextBp = () => { for (let j = debug.i + 1; j < n; j++) if (bpLines.has(debug.steps[j].line - 1) && debug.steps[j].event === "line") return j; return n - 1; };
  const btn = (ic, label, fn, dis) => el("button", { class: "ibtn", title: label, "aria-label": label, onclick: fn, disabled: dis || false }, icon(ic));
  box.append(el("div", { class: "dbg-bar" },
    btn("i-first", "First step", () => showStep(0), i === 0),
    btn("i-back", "Step back", () => showStep(i - 1), i === 0),
    btn("i-step", "Step forward", () => showStep(i + 1), i === n - 1),
    btn("i-cont", "Continue to next breakpoint", () => showStep(nextBp()), i === n - 1),
    el("span", { class: "dbg-pos" }, `Step ${i + 1} of ${n}${debug.truncated ? "+" : ""} · line ${s.line}`),
    el("span", { class: "spacer" }),
    el("button", { class: "btn", onclick: () => { endDebug(); } }, "Finish")));
  const range = el("input", { type: "range", min: "0", max: String(n - 1), value: String(i), "aria-label": "Step" });
  range.oninput = () => showStep(+range.value);
  box.append(range);
  let ev = s.event === "line" ? `About to run line ${s.line}${s.func !== "<module>" ? ` in ${s.func}()` : ""}`
    : s.event === "return" ? `${s.func}() returns ${s.ret}` : `Exception: ${s.exc}`;
  box.append(el("div", { class: "event" + (s.event === "exception" ? " exc" : "") }, ev));
  if (s.stack.length > 1) box.append(el("h5", {}, "Call stack"), el("div", { class: "stack" }, s.stack.map(f => el("span", { class: "frame" }, f === "<module>" ? "main" : f + "()"))));
  box.append(el("h5", {}, s.func === "<module>" ? "Variables" : `Local variables in ${s.func}()`));
  const prev = i > 0 ? new Map(debug.steps[i - 1].vars.map(v => [v[0], v[2]])) : new Map();
  if (s.vars.length) {
    const tb = el("tbody");
    for (const [k, t, v] of s.vars) tb.append(el("tr", { class: prev.has(k) && prev.get(k) !== v ? "chg" : "" }, el("td", { class: "n" }, k), el("td", { class: "t" }, t), el("td", { class: "v" }, v)));
    box.append(el("table", { class: "vt" }, tb));
  } else box.append(el("div", { class: "side-note" }, "No variables yet."));
  box.append(el("h5", {}, "Output so far"), el("pre", {}, debug.out.slice(0, s.out) || " "));
  if (debug.truncated && i === n - 1) box.append(el("div", { class: "side-note" }, "Recording stopped after 4,000 steps. Use breakpoints or a smaller loop to look further."));
}

/* ---------------- syntax check & completion ---------------- */
let checkTimer;
function scheduleCheck(delay = 700) {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(async () => {
    if (!active || !/\.py$/.test(active.name)) { setSyn(null); return; }
    const t = active;
    try { const r = await request({ type: "check", code: t.doc.getValue() }); if (t === active) setSyn(r); }
    catch (_) { /* busy — try later */ }
  }, delay);
}
let synMark = null;
function setSyn(r) {
  if (synMark) { synMark.clear(); synMark = null; }
  cm.clearGutter("bp-gutter"); renderBps();
  const sb = $("#sbSyn");
  if (!r) { sb.className = "synok"; sb.textContent = "No syntax errors"; sb.onclick = null; return; }
  const line = Math.max(0, Math.min(cm.lineCount() - 1, r.line - 1));
  const text = cm.getLine(line) || "";
  synMark = cm.markText({ line, ch: 0 }, { line, ch: Math.max(text.length, 1) }, { className: "cm-synerr", title: `${r.etype}: ${r.msg}` });
  if (!active.bps.has(line)) cm.setGutterMarker(line, "bp-gutter", el("span", { class: "err-mark", title: `${r.etype}: ${r.msg}` }, "!"));
  sb.className = "syn"; sb.textContent = `Line ${r.line}: ${r.msg}`;
  sb.onclick = () => { cm.setCursor({ line, ch: 0 }); cm.focus(); };
}

function localHints(c) {
  const cur = c.getCursor(), tok = c.getTokenAt(cur);
  const start = /\w/.test(tok.string) ? tok.start : cur.ch;
  const word = tok.string.slice(0, cur.ch - tok.start).replace(/\W/g, "");
  const words = new Set(PY_WORDS);
  for (const m of c.getValue().matchAll(/[A-Za-z_]\w{2,}/g)) words.add(m[0]);
  const list = [...words].filter(w => w.startsWith(word) && w !== word).sort().slice(0, 60);
  return { list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, cur.ch) };
}
const KIND = { function: "fn", class: "class", module: "module", keyword: "kw", instance: "var", statement: "var", param: "param", property: "prop", path: "file" };
function complete(manual) {
  cm.showHint({
    completeSingle: false, closeCharacters: /[\s()\[\]{};:>,=+\-*/]/,
    hint: (c, opts) => new Promise((resolve) => {
      const cur = c.getCursor(), tok = c.getTokenAt(cur);
      const before = c.getLine(cur.line).slice(0, cur.ch);
      const wm = before.match(/[A-Za-z_]\w*$/); const start = wm ? cur.ch - wm[0].length : cur.ch;
      if (!manual && !/\.$/.test(before) && (!wm || wm[0].length < 3)) return resolve(null);
      if (tok.type === "comment" || (tok.type === "string" && !manual)) return resolve(null);
      const timer = setTimeout(() => resolve(localHints(c)), jediWarm ? 6000 : 10000);
      request({ type: "complete", code: c.getValue(), line: cur.line + 1, col: cur.ch }).then((items) => {
        clearTimeout(timer);
        if (!items || !items.length) return resolve(manual ? localHints(c) : null);
        resolve({
          list: items.map(([name, type]) => ({ text: name, displayText: name, render: (node) => { node.append(el("span", {}, name), el("span", { class: "hk" }, KIND[type] || type)); } })),
          from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, cur.ch),
        });
      }).catch(() => { clearTimeout(timer); resolve(localHints(c)); });
    }),
  });
}
let autoTimer;
cm.on("inputRead", (c, ch) => {
  if (!S.auto || c.state.completionActive) return;
  const t = ch.text.join("");
  if (!/^[\w.]$/.test(t)) return;
  clearTimeout(autoTimer); autoTimer = setTimeout(() => complete(false), t === "." ? 60 : 220);
});

/* ---------------- files ---------------- */
const fileMap = new Map(); // name -> { data: Uint8Array, mtime, fresh }
let db = null;
function openDb() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open("pypharm", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("files");
      r.onsuccess = () => { db = r.result; res(db); };
      r.onerror = () => res(null);
    } catch (_) { res(null); }
  });
}
function saveFileDb(name) { if (!db) return; try { const f = fileMap.get(name); db.transaction("files", "readwrite").objectStore("files").put({ data: f.data, mtime: f.mtime }, name); } catch (_) {} }
function deleteFileDb(name) { if (!db) return; try { db.transaction("files", "readwrite").objectStore("files").delete(name); } catch (_) {} }
function loadFilesDb() {
  return new Promise((res) => {
    if (!db) return res(false);
    try {
      const tx = db.transaction("files"), st = tx.objectStore("files"), req = st.openCursor(); let any = false;
      req.onsuccess = () => { const c = req.result; if (c) { any = true; fileMap.set(c.key, { data: c.value.data, mtime: c.value.mtime, fresh: false }); c.continue(); } else res(any); };
      req.onerror = () => res(false);
    } catch (_) { res(false); }
  });
}
function addFile(name, data) { fileMap.set(name, { data, mtime: Date.now(), fresh: true }); saveFileDb(name); renderFiles(); }
function renderFiles() {
  const box = $("#flist"); box.textContent = "";
  const names = [...fileMap.keys()].sort((a, b) => a.localeCompare(b));
  if (!names.length) { box.append(el("div", { class: "side-note" }, "No files yet.")); return; }
  for (const n of names) {
    const f = fileMap.get(n), ext = (n.match(/\.(\w+)$/) || ["", "file"])[1].toLowerCase();
    const kind = IMG_EXT.test(n) ? "img" : DATA_EXT.test(n) ? "data" : /\.py$/.test(n) ? "" : "other";
    const a = (ic, label, fn) => el("button", { title: label, "aria-label": label + " " + n, onclick: (e) => { e.stopPropagation(); fn(); } }, icon(ic));
    const row = el("div", { class: "fi", tabindex: "0", title: n },
      el("span", { class: "ic " + kind }, ext.slice(0, 4).toUpperCase()),
      el("span", { class: "nm" }, n, f.fresh ? el("span", { class: "new" }, "NEW") : null),
      el("span", {}, el("span", { class: "meta" }, fmtBytes(f.data.length)),
        el("span", { class: "acts" },
          TEXT_EXT.test(n) || IMG_EXT.test(n) ? a(TEXT_EXT.test(n) && !/\.csv$/i.test(n) ? "i-edit" : "i-eye", TEXT_EXT.test(n) && !/\.csv$/i.test(n) ? "Open in editor" : "Preview", () => openFile(n)) : null,
          a("i-save", "Save to device", () => download(n, f.data)),
          a("i-trash", "Delete", () => confirmBox(`Delete ${n}?`, "It will be removed from the Files panel.", "Delete", () => { fileMap.delete(n); deleteFileDb(n); renderFiles(); })))));
    row.addEventListener("click", () => openFile(n));
    row.addEventListener("keydown", (e) => { if (e.key === "Enter") openFile(n); });
    box.append(row);
  }
}
function openFile(n) {
  const f = fileMap.get(n); if (!f) return;
  if (IMG_EXT.test(n)) {
    const mime = /\.svg$/i.test(n) ? "image/svg+xml" : /\.gif$/i.test(n) ? "image/gif" : /\.jpe?g$/i.test(n) ? "image/jpeg" : "image/png";
    const url = URL.createObjectURL(new Blob([f.data], { type: mime }));
    return showImage(url, n, null, f.data);
  }
  if (/\.csv$/i.test(n)) return showCsv(n, new TextDecoder().decode(f.data));
  if (TEXT_EXT.test(n)) {
    const existing = tabs.find(t => t.name === n);
    if (existing) return activate(existing);
    const t = makeTab(n, new TextDecoder().decode(f.data), { saved: true }); activate(t); persistSoon();
    if (isPhone()) setView("code");
    return;
  }
  toast("This file type can't be previewed. Your code can still open it.");
}
async function addUploads(list) {
  let n = 0;
  for (const file of list) {
    if (file.size > 60e6) { toast(`${file.name} is larger than 60 MB and was skipped.`); continue; }
    addFile(file.name, new Uint8Array(await file.arrayBuffer())); n++;
  }
  if (n) { toast(`Added ${n} file${n > 1 ? "s" : ""}`); log("info", `Added to Files: ${[...list].map(f => f.name).join(", ")}`); }
}
$("#bUpload").onclick = () => $("#fUpload").click();
$("#drop").onclick = () => $("#fUpload").click();
$("#fUpload").onchange = (e) => { addUploads(e.target.files); e.target.value = ""; };
for (const t of [$("#drop"), $("#side")]) {
  t.addEventListener("dragover", (e) => { e.preventDefault(); $("#drop").classList.add("over"); });
  t.addEventListener("dragleave", () => $("#drop").classList.remove("over"));
  t.addEventListener("drop", (e) => { e.preventDefault(); $("#drop").classList.remove("over"); if (e.dataTransfer.files.length) addUploads(e.dataTransfer.files); });
}

/* saving to the device */
let dlCap; const dlReady = (async () => { try { dlCap = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (_) { dlCap = null; } })();
async function download(name, data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  // Capacitor (Android / iOS app)
  const Cap = window.Capacitor && window.Capacitor.Plugins;
  if (Cap && Cap.Filesystem && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    try {
      let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      const r = await Cap.Filesystem.writeFile({ path: name, data: btoa(bin), directory: "DOCUMENTS", recursive: true });
      if (Cap.Share) await Cap.Share.share({ title: name, url: r.uri }).catch(() => {});
      toast(`Saved ${name} to Documents`); return;
    } catch (e) { toast("Could not save: " + e.message); return; }
  }
  // Inside claude.ai: files are offered through the viewer
  await dlReady;
  if (dlCap) {
    let fname = name;
    if (!/\.(gif|png|jpe?g|webp|txt|json|md|docx|pptx|csv|html|svg|pdf|xlsx|zip)$/i.test(name)) fname = name + ".txt";
    try { await dlCap.save({ filename: fname, data: new Blob([bytes]) }); if (fname !== name) toast(`Saved as ${fname} — rename it to ${name} after downloading`); }
    catch (e) { if (e && e.code !== "declined") toast("This file couldn't be saved here (" + (e.code || "error") + ")."); }
    return;
  }
  const a = el("a", { href: URL.createObjectURL(new Blob([bytes])), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`Saved ${name}`);
}
function saveActive() {
  if (!active) return;
  download(active.name, active.doc.getValue()).then(() => { active.saved = true; renderTabs(); persistSoon(); });
}

/* open from device */
$("#fOpen").onchange = async (e) => {
  for (const f of e.target.files) {
    const text = await f.text();
    const ex = tabs.find(t => t.name === f.name && !t.doc.getValue().trim());
    const t = ex || makeTab(uniqueName(f.name), text, { saved: true });
    if (ex) ex.doc.setValue(text);
    activate(t);
  }
  persistSoon(); e.target.value = "";
  if (isPhone()) setView("code");
};

/* ---------------- lightbox ---------------- */
let lbSave = null;
function lightbox(title, node, onSave) {
  $("#lbTitle").textContent = title; const b = $("#lbBody"); b.textContent = ""; b.append(node);
  lbSave = onSave; $("#lbSave").hidden = !onSave; $("#dlgLight").showModal();
}
$("#lbSave").onclick = () => lbSave && lbSave();
function showImage(src, name, b64, bytes) { lightbox(name, el("img", { src, alt: name }), () => download(name, bytes || b64bytes(b64))); }
function showTable(name, html) { const d = el("div", { class: "df" }); d.innerHTML = html; lightbox(name, d, null); }
function showCsv(name, text) {
  const rows = text.split(/\r?\n/).filter(Boolean).slice(0, 500).map(r => r.split(","));
  const t = el("table", {}, el("thead", {}, el("tr", {}, (rows[0] || []).map(h => el("th", {}, h)))), el("tbody", {}, rows.slice(1).map(r => el("tr", {}, r.map(c => el("td", {}, c))))));
  const d = el("div", { class: "df" }, t);
  lightbox(name, d, () => download(name, text));
  const ed = el("button", { class: "btn", onclick: () => { $("#dlgLight").close(); const ex = tabs.find(x => x.name === name); if (ex) activate(ex); else { activate(makeTab(name, text)); persistSoon(); } } }, "Edit as text");
  $(".lb-head").insertBefore(ed, $("#lbSave"));
  $("#dlgLight").addEventListener("close", () => ed.remove(), { once: true });
}

/* ---------------- examples / packages / help ---------------- */
function renderExamples() {
  const box = $("#exlist"); let g = null;
  for (const ex of window.PP_EXAMPLES) {
    if (ex.group !== g) { g = ex.group; box.append(el("div", { class: "exgroup" }, g)); }
    box.append(el("button", { class: "ex", onclick: () => {
      const t = tabs.find(x => x.name === ex.file);
      if (t && t.doc.getValue() === ex.code) activate(t); else newTab(ex.file, ex.code);
      if (ex.file === "f2_similarity.py" && !fileMap.has("dissolution.csv")) addFile("dissolution.csv", new TextEncoder().encode(PP_SAMPLE_FILES["dissolution.csv"]));
      if (isPhone()) setView("code");
    } }, el("b", {}, ex.title), el("span", {}, ex.file)));
  }
}
const PKG_INFO = {
  numpy: "Arrays and numerical maths", pandas: "Tables (DataFrames), CSV and Excel", matplotlib: "Plots and charts", scipy: "Statistics, curve fitting, integration",
  "scikit-learn": "Machine learning", statsmodels: "Regression, ANOVA, statistical models", sympy: "Symbolic maths and calculus", jedi: "Code suggestions (used by the editor)",
  micropip: "Installs extra packages", sqlite3: "SQL databases", pillow: "Images (PIL)", seaborn: "Statistical plots", openpyxl: "Read and write .xlsx files", tabulate: "Pretty text tables",
};
function renderPackages() {
  const box = $("#pkglist"); box.textContent = "";
  if (!pyInfo) { box.append(el("div", { class: "side-note" }, "Loading…")); return; }
  const main = ["numpy", "pandas", "matplotlib", "scipy", "statsmodels", "scikit-learn", "sympy", "pillow", "sqlite3"];
  const extra = (pyInfo.extra || []).map(w => w.split("-")[0].replace("_", "-")).filter(n => n !== "et-xmlfile");
  for (const n of [...main.filter(n => pyInfo.bundled.includes(n)), ...extra]) {
    const done = loadedPkgs.has(n);
    const btn = done ? el("span", { class: "st" }, "Loaded") : el("button", { onclick: async (e) => {
      const b = e.currentTarget; b.disabled = true; b.textContent = "Loading…";
      try {
        const r = await request({ type: "load", names: [extra.includes(n) ? n.replace("-", "_") : n], extra: extra.includes(n) });
        if (r && r.loaded) { loadedPkgs = new Set(r.loaded); toast(`${n} loaded`); }
      } catch (_) { toast("Wait until Python is idle."); }
      setPill("ready", "Ready"); renderPackages();
    } }, "Load now");
    box.append(el("div", { class: "pkg" }, el("div", {}, el("b", {}, n), el("small", {}, PKG_INFO[n] || "")), btn));
  }
}
$("#pipform").addEventListener("submit", async (e) => {
  e.preventDefault(); const name = $("#pipname").value.trim(); if (!name) return;
  if (!wReady || busy) return toast("Wait until Python is idle.");
  const b = e.target.querySelector("button"); b.disabled = true; b.textContent = "…";
  try {
    const r = await request({ type: "pip", name });
    if (r && r.ok) { toast(`Installed ${name}`); log("ok", `Installed ${name} from PyPI. It stays installed until Python restarts.`); $("#pipname").value = ""; }
    else { log("err", `Could not install ${name}: ${(r && r.error) || "unknown error"}. Only pure-Python packages work, and you need internet access.`); showConsole("msgs"); }
  } catch (_) { toast("Python is busy."); }
  b.disabled = false; b.textContent = "Install"; setPill("ready", "Ready");
});
const KEYS = [
  [`${MOD} Enter`, "Run (selected lines only, if any are selected)"], ["F5", "Run"], ["Shift F5", "Stop"], ["F6", "Step through"],
  ["F9", "Toggle breakpoint"], [`${MOD} Space`, "Suggestions"], [`${MOD} /`, "Comment / uncomment"], [`${MOD} S`, "Save tab to device"],
  [`${MOD} O`, "Open file"], [`${MOD} N`, "New tab"], [`${MOD} F`, "Find"], [isMac ? "⌘ ⌥ F" : "Ctrl H", "Replace"], [`${MOD} D`, "Duplicate line"],
  ["Alt ↑ / ↓", "Move line"], ["Tab / Shift Tab", "Indent / outdent"], [`${MOD} + / −`, "Zoom code"],
];
function renderHelp() { const dl = $("#keys"); for (const [k, d] of KEYS) dl.append(el("dt", {}, ...k.split(" ").map(x => el("kbd", {}, x))), el("dd", {}, d)); }

/* side panel */
function showSide(name) {
  for (const b of $$(".rail [data-side]")) b.classList.toggle("on", b.dataset.side === name);
  for (const p of $$("[data-panel]")) p.hidden = p.dataset.panel !== name;
  $("#main").classList.remove("side-closed");
  store.set("side", name);
}
$$(".rail [data-side]").forEach(b => b.onclick = () => {
  if (b.classList.contains("on") && !$("#main").classList.contains("side-closed")) { $("#main").classList.add("side-closed"); return; }
  showSide(b.dataset.side);
});
$("#bSideToggle").onclick = () => $("#main").classList.toggle("side-closed");

/* ---------------- mobile views ---------------- */
const isPhone = () => matchMedia("(max-width: 760px)").matches;
function setView(v) {
  $("#main").dataset.view = v;
  for (const b of $$("#mobnav button")) b.classList.toggle("on", b.dataset.v === v && (v !== "side" || b.dataset.side === currentSide()));
  if (v === "out") $("#nbOut").hidden = true;
  if (v === "code") setTimeout(() => cm.refresh(), 0);
}
const currentSide = () => ($(".rail [data-side].on") || {}).dataset?.side;
$$("#mobnav button").forEach(b => b.onclick = () => {
  if (b.dataset.v === "more") return $("#dlgMore").showModal();
  if (b.dataset.side) showSide(b.dataset.side);
  setView(b.dataset.v);
});
$$("[data-more]").forEach(b => b.onclick = () => {
  $("#dlgMore").close();
  const a = b.dataset.more;
  if (a === "new") { newTab(); setView("code"); }
  else if (a === "open") $("#fOpen").click();
  else if (a === "save") saveActive();
  else if (a === "debug") run("debug");
  else if (a === "theme") toggleTheme();
  else if (a === "about") $("#dlgAbout").showModal();
  else { showSide(a); setView("side"); }
});
$("#fab").onclick = () => run();

/* symbol bar */
const SYMS = [["Tab", "    "], ["⇤", "OUTDENT"], ["(", "("], [")", ")"], ["[", "["], ["]", "]"], ["{", "{"], ["}", "}"], [":", ":"], ["=", "="], ['"', '"'], ["'", "'"],
  ["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"], ["#", "#"], ["_", "_"], [".", "."], [",", ","], ["<", "<"], [">", ">"], ["%", "%"], ["←", "LEFT"], ["→", "RIGHT"], ["Undo", "UNDO"]];
function renderKeybar() {
  const bar = $("#keybar");
  for (const [label, val] of SYMS) {
    const b = el("button", { class: label.length > 1 && !/^[←→⇤]$/.test(label) ? "wide" : "", "aria-label": label }, label);
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("click", () => {
      if (val === "LEFT") cm.execCommand("goCharLeft"); else if (val === "RIGHT") cm.execCommand("goCharRight");
      else if (val === "UNDO") cm.undo(); else if (val === "OUTDENT") cm.indentLine(cm.getCursor().line, "subtract");
      else cm.replaceSelection(val, "end");
      cm.focus();
    });
    bar.append(b);
  }
}

/* splitter */
(() => {
  const sp = $("#splitter"); let drag = false;
  sp.addEventListener("pointerdown", (e) => { drag = true; sp.setPointerCapture(e.pointerId); sp.classList.add("drag"); });
  sp.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const r = $("#main").getBoundingClientRect();
    if (matchMedia("(max-width: 1100px)").matches) {
      const h = Math.min(r.height - 120, Math.max(100, r.bottom - e.clientY));
      $("#main").style.gridTemplateRows = `minmax(0,1fr) 6px ${h}px`;
    } else {
      const w = Math.min(r.width - 360, Math.max(260, r.right - e.clientX));
      document.documentElement.style.setProperty("--console-w", w + "px"); store.set("consoleW", w);
    }
    cm.refresh();
  });
  const end = () => { drag = false; sp.classList.remove("drag"); };
  sp.addEventListener("pointerup", end); sp.addEventListener("pointercancel", end);
  const w = store.get("consoleW", null); if (w) document.documentElement.style.setProperty("--console-w", w + "px");
})();

/* ---------------- dialogs, theme, toast ---------------- */
$$("dialog [data-close]").forEach(b => b.onclick = () => b.closest("dialog").close());
$$("dialog").forEach(d => d.addEventListener("click", (e) => { if (e.target === d) d.close(); }));
let cfAction = null;
function confirmBox(title, text, yes, fn) { $("#cfTitle").textContent = title; $("#cfText").textContent = text; $("#cfYes").textContent = yes; cfAction = fn; $("#dlgConfirm").showModal(); }
$("#cfYes").onclick = () => { $("#dlgConfirm").close(); cfAction && cfAction(); };
let toastT;
function toast(text) {
  let t = $(".toast"); if (!t) { t = el("div", { class: "toast", role: "status" }); document.body.append(t); }
  t.textContent = text; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3200);
}
function toggleTheme() {
  const dark = S.theme === "dark" || (S.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  S.theme = dark ? "light" : "dark"; applySettings();
}
$("#bTheme").onclick = toggleTheme;
$("#bAbout").onclick = () => $("#dlgAbout").showModal();
$("#bSettings").onclick = () => {
  $("#setTheme").value = S.theme; $("#setFont").value = S.font; $("#setAuto").checked = S.auto; $("#setWrap").checked = S.wrap;
  $("#setKeys").checked = document.body.classList.contains("touch"); $("#setClear").checked = S.clear; $("#dlgSettings").showModal();
};
$("#setTheme").onchange = (e) => { S.theme = e.target.value; applySettings(); };
$("#setFont").onchange = (e) => { S.font = Math.min(28, Math.max(10, +e.target.value || 14)); applySettings(); };
$("#setAuto").onchange = (e) => { S.auto = e.target.checked; applySettings(); };
$("#setWrap").onchange = (e) => { S.wrap = e.target.checked; applySettings(); };
$("#setKeys").onchange = (e) => { S.keys = e.target.checked; applySettings(); };
$("#setClear").onchange = (e) => { S.clear = e.target.checked; applySettings(); };
$("#bResetAll").onclick = () => { $("#dlgSettings").close(); confirmBox("Reset PyPharm?", "All tabs and files stored in PyPharm on this device will be deleted.", "Reset", () => {
  store.set("tabs", null); for (const k of [...fileMap.keys()]) deleteFileDb(k); fileMap.clear(); tabs = []; boot(true);
}); };

/* toolbar */
$("#bRun").onclick = () => run();
$("#bStop").onclick = () => stop();
$("#bDebug").onclick = () => run("debug");
$("#bNew").onclick = () => newTab();
$("#bOpen").onclick = () => $("#fOpen").click();
$("#bSave").onclick = () => saveActive();
$("#runKbd").textContent = `${MOD} ↵`;
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === "o") { e.preventDefault(); $("#fOpen").click(); }
  else if (mod && e.key.toLowerCase() === "n" && !e.shiftKey) { e.preventDefault(); newTab(); }
  else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); saveActive(); }
  else if (mod && e.key === "Enter" && !cm.hasFocus()) { e.preventDefault(); run(); }
  else if (e.key === "F5" && !cm.hasFocus()) { e.preventDefault(); e.shiftKey ? stop() : run(); }
  else if (e.key === "F6" && !cm.hasFocus()) { e.preventDefault(); run("debug"); }
  else if (debug && !cm.hasFocus() && $(".cpanel[data-cp=dbg]") && !$(".cpanel[data-cp=dbg]").hidden) {
    if (e.key === "ArrowRight") showStep(debug.i + 1); else if (e.key === "ArrowLeft") showStep(debug.i - 1);
  }
});
window.addEventListener("beforeunload", () => { clearTimeout(persistTimer); store.set("tabs", { active: tabs.indexOf(active), list: tabs.map(t => ({ name: t.name, code: t.doc.getValue(), saved: t.saved, bps: [...t.bps] })) }); });

/* ---------------- boot ---------------- */
const WELCOME = `# Welcome to PyPharm — Python for pharmacy students.
# Press Run (${MOD}+Enter) to run this program. Try the Examples panel for more.

import math

dose_mg = 500
half_life_h = 4
k = math.log(2) / half_life_h

print("Time (h)  Drug remaining (mg)")
for t in range(0, 25, 4):
    remaining = dose_mg * math.exp(-k * t)
    print(f"{t:>8}  {remaining:>10.1f}")

name = input("Your name: ")
print(f"Well done, {name}! You just modelled first-order elimination.")
`;
async function boot(reset) {
  const saved = reset ? null : store.get("tabs", null);
  tabs = []; tabSeq = 0;
  if (saved && saved.list && saved.list.length) {
    for (const t of saved.list) makeTab(t.name, t.code, { saved: t.saved, bps: t.bps });
    activate(tabs[Math.min(Math.max(0, saved.active), tabs.length - 1)]);
  } else {
    activate(makeTab("main.py", WELCOME, { saved: true }));
  }
  if (!reset) { await openDb(); await loadFilesDb(); }
  if (!fileMap.size || reset) addFile("dissolution.csv", new TextEncoder().encode(PP_SAMPLE_FILES["dissolution.csv"]));
  for (const f of fileMap.values()) f.fresh = false;
  renderFiles();
}
applySettings();
renderExamples(); renderHelp(); renderKeybar(); renderPackages();
showSide(store.get("side", "files"));
if (matchMedia("(max-width: 1100px)").matches && !isPhone()) $("#main").classList.add("side-closed");
clearOutput(); emptyOut(); renderVars([]);
boot(false).then(() => startWorker());
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => cm.refresh());
})();
