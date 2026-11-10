// PyPharm desktop shell: serves the bundled app from a private app:// origin so
// WebAssembly, the Python worker and fetch() all work fully offline.
const { app, BrowserWindow, protocol, net, shell, Menu } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const WEB = path.join(__dirname, "..", "dist", "web").replace("app.asar", "app.asar.unpacked");
const WEB_ASAR = path.join(__dirname, "..", "dist", "web");

protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1360, height: 860, minWidth: 720, minHeight: 480,
    title: "PyPharm", backgroundColor: "#0b1212", autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "assets", "icon-512.png"),
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.loadURL("app://pypharm/index.html");
}

app.whenReady().then(() => {
  protocol.handle("app", (req) => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, "") || "index.html";
    const base = rel.startsWith("pyodide/") ? WEB : WEB_ASAR;
    const file = path.normalize(path.join(base, rel));
    if (!file.startsWith(path.normalize(base))) return new Response("Not found", { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === "darwin" ? [{ role: "appMenu" }] : []),
    { role: "editMenu" }, { role: "viewMenu" }, { role: "windowMenu" },
  ]));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
