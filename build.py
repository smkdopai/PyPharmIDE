"""Build PyPharm.

python build.py            -> dist/web       (complete site: desktop, mobile, self-hosting)
python build.py --artifact -> dist/artifact  (page fragment + chunked runtime for claude.ai hosting)
Requires build/runtime-plain or build/runtime-chunked from scripts/prepare_runtime.py.
"""
import base64, os, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
ART = "--artifact" in sys.argv
rd = lambda p: open(os.path.join(ROOT, p), encoding="utf-8").read()
CM_JS = ["codemirror.js", "python.js", "closebrackets.js", "matchbrackets.js", "show-hint.js", "foldcode.js",
         "foldgutter.js", "indent-fold.js", "active-line.js", "comment.js", "searchcursor.js", "dialog.js", "search.js"]
FONTS = [("JetBrains Mono", 400, "jetbrains-mono-latin-400-normal"), ("JetBrains Mono", 500, "jetbrains-mono-latin-500-normal"),
         ("Inter", 400, "inter-latin-400-normal"), ("Inter", 500, "inter-latin-500-normal"), ("Inter", 600, "inter-latin-600-normal"),
         ("Space Grotesk", 500, "space-grotesk-latin-500-normal"), ("Space Grotesk", 600, "space-grotesk-latin-600-normal")]

def font_css():
    out = []
    for fam, w, f in FONTS:
        b = base64.b64encode(open(os.path.join(ROOT, "vendor/fonts", f + ".woff2"), "rb").read()).decode()
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2')}}")
    return "\n".join(out)

js_safe = lambda s: s.replace("</script", "<\\/script")
page = rd("src/index.html")
page = page.replace("/*@@FONTS@@*/", font_css())
page = page.replace("/*@@CODEMIRROR_CSS@@*/", rd("vendor/codemirror/codemirror.css"))
page = page.replace("/*@@APP_CSS@@*/", rd("src/app.css"))
page = page.replace("/*@@CODEMIRROR_JS@@*/", js_safe("\n".join(rd("vendor/codemirror/" + f) for f in CM_JS)))
page = page.replace("/*@@EXAMPLES_JS@@*/", js_safe(rd("src/examples.js")))
page = page.replace("/*@@APP_JS@@*/", js_safe(rd("src/app.js")))

out = os.path.join(ROOT, "dist", "artifact" if ART else "web")
os.makedirs(out, exist_ok=True)
if ART:
    html = page
else:
    head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg" type="image/svg+xml">'
            '<link rel="apple-touch-icon" href="icon-192.png">'
            '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
            'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')
    sw = ('<script>if("serviceWorker" in navigator && location.protocol==="https:" && !window.Capacitor)'
          'navigator.serviceWorker.register("sw.js").catch(function(){});</script>')
    html = head + page + sw + "</body></html>"
    for f in ["manifest.webmanifest", "sw.js", "icon.svg", "icon-192.png", "icon-512.png"]:
        p = os.path.join(ROOT, "assets", f)
        if os.path.exists(p): shutil.copy(p, out)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(html)
shutil.copy(os.path.join(ROOT, "src/worker.js"), out)
rt_src = os.path.join(ROOT, "build", "runtime-chunked" if ART else "runtime-plain")
rt_dst = os.path.join(out, "pyodide")
if os.path.isdir(rt_src) and not os.path.isdir(rt_dst):
    shutil.copytree(rt_src, rt_dst)
print("built", out, f"index.html {len(html)//1024} KB")
