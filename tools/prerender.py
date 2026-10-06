"""Write each language page's translated text straight into its HTML (Google: one language per page, in the HTML).

js/main.js applyLanguage() fills elements by id at runtime (ut = textContent, uh = innerHTML). This script loads every
language page in headless Chrome, reads what applyLanguage put into those same elements, and writes it into the static
HTML of that page. Runtime behaviour is unchanged (applyLanguage still runs and sets identical text); only the HTML that
search engines and no-JS visitors receive is now in the page's language.

Run after build.ps1 (which regenerates <lang>/index.html from the English index.html):
    python tools/prerender.py            # all languages
    python tools/prerender.py ja es      # some
Needs: Google Chrome, Python 3. Starts its own local server."""
import html, json, os, re, subprocess, sys, tempfile, threading, time, http.server, functools

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ["ru", "es", "de", "fr", "ja", "vi", "th", "pt", "ko", "it", "hi"]
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8797


def ids_from_main():
    s = open(os.path.join(ROOT, "js", "main.js"), encoding="utf-8").read()
    body = s[s.index("function applyLanguage"):]
    body = body[:body.index("if (window.Quiz) Quiz.setLang")]
    ids = re.findall(r"\b(?:ut|uh)\('([A-Za-z0-9_]+)'", body)
    for tpl, a, b in [("axis{}Title", 1, 3), ("axis{}Desc", 1, 3), ("axis{}Hint", 1, 3), ("faqQ{}", 1, 8), ("faqA{}", 1, 8),
                      ("faqSlangQ{}", 1, 5), ("faqSlangA{}", 1, 5)]:
        ids += [tpl.format(i) for i in range(a, b + 1)]
    # containers rebuilt at runtime: protocol list, first question of each quiz wizard, tracker summary, game question
    ids += ["bookLink", "protocolGrid", "q1Container", "q2Container", "q3Container", "qFearContainer", "a1Progress", "a2Progress", "a3Progress", "fearProgress", "trackerSummary", "gameQuestion"]
    return list(dict.fromkeys(i for i in ids if i not in ("sharedBanner",)))   # sharedBanner is shown only for shared links


PROBE = """window.addEventListener('load',function(){setTimeout(function(){var o={};IDS.forEach(function(i){var e=document.getElementById(i);
if(e)o[i]=e.innerHTML;});var p=document.querySelector('[data-i18n="pollPrivacy"]');if(p)o['@pollPrivacy']=p.innerHTML;
var t=document.createElement('textarea');t.id='__pr';t.textContent=JSON.stringify(o);document.body.appendChild(t);},2500);});"""


def element_span(src, el_id):
    """(start_of_content, end_of_content) of the element with this id in the source HTML, balanced by tag name."""
    m = re.search(r'<([a-zA-Z0-9]+)\b[^>]*\bid="' + re.escape(el_id) + r'"[^>]*>', src)
    if not m:
        return None
    tag, i, depth = m.group(1).lower(), m.end(), 1
    pat = re.compile(r"<(/?)" + tag + r"\b[^>]*?(/?)>", re.I)
    while depth:
        n = pat.search(src, i)
        if not n:
            return None
        if n.group(1):
            depth -= 1
        elif not n.group(2):
            depth += 1
        i = n.end()
    return m.end(), n.start()


def render(lang, ids, profile):
    probe = "var IDS=" + json.dumps(ids) + ";" + PROBE
    open(os.path.join(ROOT, "_prerender_probe.js"), "w", encoding="utf-8").write(probe)
    src = open(os.path.join(ROOT, lang, "index.html"), encoding="utf-8").read()
    tmp = os.path.join(ROOT, lang, "_prerender.html")
    open(tmp, "w", encoding="utf-8").write(src.replace("</head>", '<script src="/_prerender_probe.js"></script></head>', 1))
    try:
        out = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--lang=" + lang, "--user-data-dir=" + profile,
                              "--virtual-time-budget=9000", "--dump-dom", f"http://localhost:{PORT}/{lang}/_prerender.html"],
                             capture_output=True, text=True, encoding="utf-8", timeout=120).stdout
    finally:
        os.remove(tmp)
    m = re.search(r'<textarea id="__pr">(.*?)</textarea>', out, re.S)
    if not m:
        raise SystemExit(f"{lang}: page did not finish rendering")
    return json.loads(html.unescape(m.group(1)))


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    srv = http.server.ThreadingHTTPServer(("localhost", PORT), functools.partial(_Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def main():
    langs = sys.argv[1:] or LANGS
    ids = ids_from_main()
    srv = serve()
    try:
        for lang in langs:
            got = render(lang, ids, tempfile.mkdtemp(prefix="prerender_"))
            p = os.path.join(ROOT, lang, "index.html")
            s = open(p, encoding="utf-8").read()
            n = 0
            for el_id, inner in got.items():
                if el_id.startswith("@"):
                    m = re.search(r'(<[^>]*data-i18n="pollPrivacy"[^>]*>)(.*?)(</)', s, re.S)
                    if m and m.group(2) != inner:
                        s = s[:m.start(2)] + inner + s[m.end(2):]; n += 1
                    continue
                sp = element_span(s, el_id)
                if sp and s[sp[0]:sp[1]] != inner:
                    s = s[:sp[0]] + inner + s[sp[1]:]; n += 1
            open(p, "w", encoding="utf-8", newline="").write(s)
            print(f"{lang}: {n} elements written ({len(got)} read)")
    finally:
        srv.shutdown()
        try:
            os.remove(os.path.join(ROOT, "_prerender_probe.js"))
        except OSError:
            pass


if __name__ == "__main__":
    main()
