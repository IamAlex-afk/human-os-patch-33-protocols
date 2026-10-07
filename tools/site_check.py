"""One-command check of the Mind-OS site (modelled on game-account-value/scripts/site_check.py).
    python tools/site_check.py        -> summary; exit code 1 when there are ERRORS

ERRORS  broken local links/assets, invalid JSON-LD, canonical not pointing at the page itself, hreflang set incomplete,
        html lang wrong, FAQ markup question not visible on the page, translation keys missing in a language,
        service-worker precache entry or manifest icon missing, sitemap not matching the pages.
NOTES   (not errors) English text left in the static HTML of a language page, duplicate titles/descriptions,
        long titles."""
import glob, html, json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.sep
SITE = 'https://iamalex-afk.github.io/human-os-patch-33-protocols/'
LANGS = ['en', 'ru', 'es', 'de', 'fr', 'ja', 'vi', 'th', 'pt', 'ko', 'it', 'hi']


def page(lang):
    return 'index.html' if lang == 'en' else lang + '/index.html'


def read(rel):
    return open(ROOT + rel, encoding='utf-8-sig').read()


def squash(t):
    return re.sub(r'\W+', '', html.unescape(re.sub(r'<[^>]+>', '', t)).lower())


def visible(s):
    b = s[s.find('<body'):]
    b = re.sub(r'<(script|style|svg|template)\b.*?</\1>', ' ', b, flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>', '\n', b))


def questions(o):
    if isinstance(o, dict):
        if o.get('@type') == 'Question':
            yield o
        o = list(o.values())
    if isinstance(o, list):
        for v in o:
            yield from questions(v)


def keys(lang):
    s = read(f'js/translations/{lang}.js')
    return set(re.findall(r'^\s{2,}([A-Za-z_][A-Za-z0-9_]*)\s*:', s, re.M))


def main():
    errors, notes = [], []
    pages = {L: read(page(L)) for L in LANGS}
    en_lines = {l.strip() for l in visible(pages['en']).split('\n') if len(l.strip()) > 30 and re.search(r'[a-z]{4,} [a-z]{3,} [a-z]{3,}', l)}
    titles, descs = {}, {}
    for L, s in pages.items():
        rel = page(L)
        d = os.path.dirname(rel)
        head = s[:s.find('</head>')]
        # html lang
        m = re.search(r'<html[^>]*\blang="([^"]+)"', s)
        if not m or m.group(1) != L:
            errors.append(f'{rel}: <html lang> is {m.group(1) if m else None}, expected {L}')
        # canonical, og:url
        want = SITE + ('' if L == 'en' else L + '/')
        c = re.search(r'<link rel="canonical"[^>]*href="([^"]+)"', head)
        if not c or c.group(1) != want:
            errors.append(f'{rel}: canonical {c.group(1) if c else "missing"} != {want}')
        o = re.search(r'<meta property="og:url"[^>]*content="([^"]+)"', head)
        if not o or o.group(1) != want:
            errors.append(f'{rel}: og:url {o.group(1) if o else "missing"} != {want}')
        # hreflang: x-default + all 12, each pointing at an existing page
        hl = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', head))
        for X in LANGS + ['x-default']:
            exp = SITE + ('' if X in ('en', 'x-default') else X + '/')
            if hl.get(X) != exp:
                errors.append(f'{rel}: hreflang {X} is {hl.get(X)}, expected {exp}')
        # title / description
        t = re.search(r'<title[^>]*>(.*?)</title>', head, re.S)
        ds = re.search(r'<meta name="description"[^>]*content="([^"]*)"', head)
        if not t or not ds:
            errors.append(f'{rel}: title or description missing')
        else:
            titles.setdefault(html.unescape(t.group(1)).strip(), []).append(rel)
            descs.setdefault(html.unescape(ds.group(1)).strip(), []).append(rel)
            if len(html.unescape(t.group(1))) > 70:
                notes.append(f'{rel}: title is {len(html.unescape(t.group(1)))} characters')
        # local links and assets
        for h in set(re.findall(r'(?:href|src)="([^"#?:]+)(?:[?#][^"]*)?"', s)):
            if h.startswith(('//', 'data:')) or h.endswith('/'):
                target = os.path.normpath(os.path.join(d, h, 'index.html')) if h.endswith('/') else None
            else:
                target = os.path.normpath(os.path.join(d, h))
            if target and not os.path.exists(ROOT + target):
                errors.append(f'{rel}: broken link or asset {h}')
        # in-page anchors
        ids = set(re.findall(r'\bid="([^"]+)"', s))
        for h in set(re.findall(r'<a\b[^>]*\bhref="#([^"]+)"', s)):
            if h not in ids:
                errors.append(f'{rel}: anchor #{h} has no target')
        # JSON-LD
        vis = None
        for b in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S):
            try:
                ld = json.loads(b)
            except ValueError as e:
                errors.append(f'{rel}: invalid JSON-LD ({e})')
                continue
            for q in questions(ld):
                if vis is None:
                    vis = squash(re.sub(r'<(script|style)\b.*?</\1>', '', s[s.find('<body'):], flags=re.S))
                if squash(q.get('name', '')) not in vis:
                    errors.append(f'{rel}: FAQ markup question not visible on the page: {q.get("name", "")[:70]}')
        # English left in the static HTML of a language page
        if L != 'en':
            left = [l.strip() for l in visible(s).split('\n') if l.strip() in en_lines]
            if left:
                notes.append(f'{rel}: {len(left)} English lines in the static HTML, e.g. "{left[0][:70]}"')
    for what, d in (('title', titles), ('description', descs)):
        for text, rels in d.items():
            if len(rels) > 1:
                notes.append(f'same {what} on {", ".join(rels)}')
    # translations: every language has every English key
    en_keys = keys('en')
    for L in LANGS[1:]:
        miss = sorted(en_keys - keys(L))
        if miss:
            errors.append(f'js/translations/{L}.js: {len(miss)} keys missing, e.g. {", ".join(miss[:6])}')
    # service worker precache, manifest icons
    sw = read('sw.js')
    for f in re.findall(r"'\./([^']*)'", sw[sw.find('PRECACHE'):sw.find('];', sw.find('PRECACHE'))]):
        target = f if f and not f.endswith('/') else (f + 'index.html')
        if not os.path.exists(ROOT + target):
            errors.append(f'sw.js: precache entry missing on disk: {f}')
    man = json.loads(read('manifest.json'))
    for ic in man.get('icons', []):
        if not os.path.exists(ROOT + ic['src'].lstrip('./')):
            errors.append(f'manifest.json: icon missing: {ic["src"]}')
    # privacy policy exists in every language, in that language, and no page loads anything from another host
    for L in LANGS:
        rel = ('' if L == 'en' else L + '/') + 'privacy.html'
        if not os.path.exists(ROOT + rel):
            errors.append(f'{rel}: missing')
        elif f'<html lang="{L}">' not in read(rel):
            errors.append(f'{rel}: wrong html lang')
    for L, s in pages.items():
        ext = re.findall(r'<(?:script|img|iframe)[^>]*src="(https?://[^"]+)"|<link[^>]*rel="(?:stylesheet|preconnect|preload|dns-prefetch)"[^>]*href="(https?://[^"]+)"|<link[^>]*href="(https?://[^"]+)"[^>]*rel="(?:stylesheet|preconnect|preload|dns-prefetch)"', s)
        for g in ext:
            errors.append(f'{page(L)}: loads from another host: {[x for x in g if x][0][:70]}')
    # sitemap = the 12 pages
    locs = set(re.findall(r'<loc>([^<]+)</loc>', read('sitemap.xml')))
    want = {SITE + ('' if L == 'en' else L + '/') for L in LANGS}
    for u in sorted(want - locs):
        errors.append(f'sitemap.xml: page missing: {u}')
    for u in sorted(locs - want):
        notes.append(f'sitemap.xml: extra URL {u}')
    print(f'pages: {len(pages)}  languages: {len(LANGS)}')
    print(f'ERRORS: {len(errors)}')
    for e in errors[:60]:
        print('  ' + e)
    print(f'NOTES: {len(notes)}')
    for n in notes[:40]:
        print('  ' + n)
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
