# PyPharm

**Python for pharmacy and pharmaceutical sciences.** A beginner-friendly Python editor that runs on Windows, macOS, Linux, Android, iOS and in any modern browser. Python itself is built into the app (via WebAssembly), so students install nothing else and need no internet.

Developed by **Dr. S. Selvamuthukumar**, Department of Pharmaceutics, Annamalai University.

## Features

| Area | What PyPharm does |
|---|---|
| Editor | Tabs, syntax colours, line numbers, code folding, auto-indent after `:`, matching brackets and quotes, find/replace, comment toggle, move/duplicate lines, zoom |
| Suggestions | Real code completion (Jedi) for your own code and for numpy, pandas, matplotlib, etc. Live syntax check with a red underline as you type |
| Running | Run the whole tab or only the selected lines (Ctrl/⌘+Enter, F5). Stop any program, even an endless loop |
| `input()` | Works everywhere, including phones. The input box turns orange when your program asks a question |
| Errors | Python's message plus a plain-English explanation, the offending line highlighted, and a "Go to line" button |
| Step through | Click beside line numbers for breakpoints, press **Step through**, then move forwards *and backwards* through every step, watching variables, the call stack and the output so far |
| Variables | Every variable after a run, with type, size and value. Click a pandas DataFrame to see it as a table |
| Plots | matplotlib/seaborn charts appear in Output and a Plots gallery; click to enlarge and save. Animations can be saved as GIF |
| Files | Upload CSV/Excel/images; scripts read and write them by name. Files your program creates appear automatically. Every open tab is importable as a module |
| Packages | Bundled: numpy, pandas, matplotlib, scipy, seaborn, statsmodels, scikit-learn, sympy, openpyxl, pillow, sqlite3, tabulate. Pure-Python packages can be installed from PyPI when online |
| Examples | 15 ready programs: dose calculation, weight variation, IV bolus and oral PK, dissolution f1/f2, release-kinetics fitting, Beer–Lambert calibration, t-test, ANOVA, CSV reports, GIF animation |
| Look & feel | Light and dark themes, resizable panels, autosave, a phone layout with a symbol key row above the keyboard |

## Getting installers (easiest: let GitHub build them)

1. Create a new repository on GitHub and upload this folder (keep the `.github` folder).
2. Open the **Actions** tab → **Build PyPharm** → **Run workflow**. In about 20 minutes you get downloadable builds for Windows, macOS, Linux and Android.
3. To publish a Release page, create a tag such as `v1.0.0` (Releases → *Draft a new release* → *Choose a tag* → `v1.0.0` → Publish). The workflow attaches all installers to it automatically.

| File | Platform |
|---|---|
| `PyPharm-Setup-1.0.0.exe` / `PyPharm-Portable-1.0.0.exe` | Windows installer / no-install version |
| `PyPharm-1.0.0.dmg` | macOS (unsigned: first launch with right-click → Open) |
| `PyPharm-1.0.0.AppImage` / `.deb` | Linux |
| `PyPharm-v1.0.0.apk` | Android (allow "Install unknown apps") |
| `PyPharm-web-v1.0.0.zip` | Website version — see below |

## iPhone and iPad

Two options:

- **No App Store (recommended for students):** unzip `PyPharm-web-*.zip` and upload the `web` folder to any HTTPS website (for example a `/pypharm/` folder on your own site). Students open the link in Safari and tap **Share → Add to Home Screen**. It then opens like an app and works offline after the first visit. This also works on Android and desktops.
- **App Store / TestFlight:** on a Mac with Xcode, run `npm install`, `npm run runtime`, `npm run build:web`, `npm run ios`, then `npx cap open ios`, choose your Apple developer team and press Run / Archive. Apple requires a paid developer account to distribute.

## Building on your own computer

Requires Node.js 20+ and Python 3.

```bash
npm install
npm run runtime        # downloads the Python engine once (~300 MB) and keeps only what PyPharm needs
npm run build:web      # creates dist/web
npm start              # opens the desktop app
npm run dist:win       # or dist:mac / dist:linux → installers in release/
npm run android && npx cap open android   # opens Android Studio → Build APK
```

To try the website version locally: `cd dist/web && python3 -m http.server`, then open http://localhost:8000.

## Project layout

```
src/index.html, app.css, app.js   the interface
src/worker.js                     runs Python (Pyodide) in the background so Stop always works
src/examples.js                   the Examples panel and the sample dissolution.csv
build.py                          bundles everything into dist/web/index.html (offline: fonts and editor inlined)
scripts/prepare_runtime.py        copies only the needed Python packages (≈185 MB instead of 700 MB)
electron/main.js                  desktop shell (Windows, macOS, Linux)
capacitor.config.json             Android and iOS shell
.github/workflows/build.yml       automatic builds and releases
```

To add or change examples, edit `src/examples.js`. To bundle another package from the Pyodide distribution, add its name to `BUNDLE` in `scripts/prepare_runtime.py`.

## Limits

 programs run in a sandbox, so they cannot open windows (`tkinter`, `turtle`) or read files outside the Files panel; packages with compiled code must come from the Pyodide distribution.

## Third-party components

© Dr. S. Selvamuthukumar. PyPharm bundles Pyodide (MPL-2.0), CodeMirror 5 (MIT), Inter, Space Grotesk and JetBrains Mono fonts (SIL OFL 1.1).
