"""Cut the full single page into standalone pages, one task per page (2026-10-07):

    index.html      the test (hero, what it measures + sources, 28 questions, result, 8 questions about the test)
    faq.html        "What is AI?" answers + popular questions
    protocols.html  the 33 protocols + ecosystem links
    poll.html       the global poll
    game.html       the "AI or not?" game

Source: tools/full-page.tpl (English) and, for the other 11 languages, the full <lang>/index.html that build.ps1 +
tools/prerender.py have just produced (already translated in the HTML). Every page keeps the same head, menu, language
switcher, footer and scripts it needs; title, description, canonical, hreflang, Open Graph and JSON-LD are set per page.

Pipeline (always in this order, from the site folder):
    build.ps1  ->  python tools/prerender.py  ->  python tools/split_pages.py  ->  python tools/site_check.py
"""
import datetime, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import research_notes

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.sep
SITE = 'https://iamalex-afk.github.io/human-os-patch-33-protocols/'
LANGS = ['en', 'ru', 'es', 'de', 'fr', 'ja', 'vi', 'th', 'pt', 'ko', 'it', 'hi']
PAGES = ['index.html', 'faq.html', 'protocols.html', 'poll.html', 'game.html']
# scripts a page does not need (their sections are not on it)
DROP_JS = {'index.html': ['game.js', 'poll.js'], 'faq.html': ['quiz.js', 'card.js', 'game.js', 'poll.js'],
           'protocols.html': ['quiz.js', 'card.js', 'game.js', 'poll.js'], 'poll.html': ['quiz.js', 'card.js', 'game.js'],
           'game.html': ['quiz.js', 'card.js', 'poll.js']}
NAV_ID = {'faq.html': 'navFaq', 'protocols.html': 'navProtocols', 'poll.html': 'navPoll', 'game.html': 'navGame'}


def text(x):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', x))).strip()


def plain(x):                                   # heading without its emoji
    return re.sub(r'^[^\w(]+', '', text(x)).strip()


def url(lang, page):
    return SITE + ('' if lang == 'en' else lang + '/') + ('' if page == 'index.html' else page)


def blocks(full):
    """Top-level parts of <main>, by name -> (start, end)."""
    b = {}

    def sec(name, marker):
        i = full.rindex('<section', 0, full.index(marker))
        j = full.index('</section>', i) + len('</section>')
        assert full[i:j].count('<section') == 1, name
        b[name] = (i, j)
    for name, marker in (('game', 'id="game-section"'), ('poll', 'id="poll-section"'), ('aifaq', 'id="ai-faq-section"'),
                         ('faq', 'id="faq-section"'), ('slang', 'id="faq-slang-section"'), ('protocols', 'id="protocols-section"'),
                         ('test1', 'id="test-section"'), ('info', 'id="infoTitle"')):
        sec(name, marker)
    # the three unnamed test cards and the result block sit between the first test card and the game
    i = b['test1'][1]
    rest = full[i:b['game'][0]]
    b['testrest'] = (i, i + len(rest.rstrip()))
    i = full.rindex('<div', 0, full.index('id="overallProgress"'))
    b['progress'] = (i, b['test1'][0])
    i = full.index('<section', b['slang'][1])
    assert i < b['protocols'][0]
    b['ecosystem'] = (i, full.index('</section>', i) + len('</section>'))
    i = full.index('<div class="how-it-works', b['protocols'][1])
    b['how'] = (i, full.index('<footer', i))
    i = full.index('<header')
    b['header'] = (i, full.index('</header>', i) + len('</header>'))
    return b


KEEP = {'index.html': ['header', 'info', 'progress', 'test1', 'testrest', 'faq', 'how'],
        'faq.html': ['aifaq', 'slang'], 'protocols.html': ['protocols', 'ecosystem'], 'poll.html': ['poll'], 'game.html': ['game']}
ALL = ['header', 'info', 'progress', 'test1', 'testrest', 'game', 'poll', 'aifaq', 'faq', 'slang', 'ecosystem', 'protocols', 'how']


def faq_pairs(part):
    out = []
    for qid, q in re.findall(r'<span id="([A-Za-z0-9]+)">([^<]*)</span><span class="faq-arrow"', part):
        aid = qid.replace('Q', 'A', 1) if not qid.endswith('Q') else qid[:-1] + 'A'
        m = re.search(r'<div class="faq-answer" id="' + re.escape(aid) + r'"[^>]*>(.*?)</div>', part, re.S)
        if m:
            out.append((text(q), text(re.sub(r'<small.*?</small>', '', m.group(1), flags=re.S))))
    return out


def make(full, lang, page):
    b = blocks(full)
    keep = KEEP[page]
    # body: drop every block that is not on this page (from the end, so offsets stay valid)
    out = full
    order = sorted(((b[n], n) for n in ALL if n not in keep), reverse=True)
    for (i, j), n in order:
        out = out[:i] + out[j:]
    out = re.sub(r'\n[ \t]*\n[ \t]*\n+', '\n\n', out)
    main_i = out.index('<main')
    if page == 'protocols.html':                 # protocols first, ecosystem links after them
        e_i = out.index('<section', main_i + 5)
        nb = blocks(full)
        eco, pro = full[slice(*nb['ecosystem'])], full[slice(*nb['protocols'])]
        assert eco in out and pro in out
        out = out.replace(eco, '\x00').replace(pro, pro + '\n  ' + eco).replace('\x00', '')
    if page != 'index.html':
        home = './'
        # H1: the page's own heading (the first h2 of the kept part)
        m = re.search(r'<h2\b([^>]*)>(.*?)</h2>', out[main_i:], re.S)
        a = main_i + m.start()
        out = out[:a] + f'<h1{m.group(1)}>{m.group(2)}</h1>' + out[main_i + m.end():]
        h1 = plain(m.group(2))
        title = f'{h1} | Mind-OS'
        # description: the first sentences of the page itself
        body = out[out.index('<main'):out.index('<footer')]
        if page == 'faq.html':
            desc = ' '.join(q for q, _ in faq_pairs(body)[:4])
        else:
            ps = [text(p) for p in re.findall(r'<p\b[^>]*>(.*?)</p>', body, re.S)]
            desc = ' '.join(p for p in ps if len(p) > 25)[:300]
        if len(desc) > 165:
            cut = max(desc.rfind(c, 0, 165) for c in '.。!?！？।')
            desc = desc[:cut + 1] if cut > 80 else desc[:160].rsplit(' ', 1)[0] + '…'
        desc = desc.strip()
        e = lambda v: html.escape(v, quote=True)
        # head
        out = re.sub(r'(<title id="dynamicTitle">)[^<]*(</title>)', lambda m: m.group(1) + e(title) + m.group(2), out, count=1)
        for pat in (r'(<meta name="description" id="dynamicDescription" content=")[^"]*(")', r'(<meta property="og:description" id="dynamicOgDescription" content=")[^"]*(")',
                    r'(<meta name="twitter:description" content=")[^"]*(")'):
            out = re.sub(pat, lambda m: m.group(1) + e(desc) + m.group(2), out, count=1)
        for pat in (r'(<meta property="og:title" id="dynamicOgTitle" content=")[^"]*(")', r'(<meta name="twitter:title" content=")[^"]*(")'):
            out = re.sub(pat, lambda m: m.group(1) + e(h1) + m.group(2), out, count=1)
        out = re.sub(r'(<link rel="canonical" id="dynamicCanonical" href=")[^"]*(")', lambda m: m.group(1) + url(lang, page) + m.group(2), out, count=1)
        out = re.sub(r'(<meta property="og:url" id="dynamicOgUrl" content=")[^"]*(")', lambda m: m.group(1) + url(lang, page) + m.group(2), out, count=1)
        out = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="' + re.escape(SITE) + r'(?:[a-z]{2}/)?)(")', lambda m: m.group(1) + page + m.group(2), out)
        meta = json.dumps({'title': title, 'desc': desc}, ensure_ascii=False).replace('</', '<\\/')
        out = out.replace('</head>', f'<script>window.PAGE_FILE={json.dumps(page)};window.PAGE_META={meta};</script>\n</head>', 1)
        # menu: the test lives on the home page; mark the current page; no "skip to assessment" link here
        out = re.sub(r'<a href="#test-section" class="skip-link"[^>]*>.*?</a>\s*', '', out, count=1, flags=re.S)
        out = out.replace('href="#test-section" id="navAssessment"', f'href="{home}" id="navAssessment"')
        out = out.replace(f'id="{NAV_ID[page]}"', f'id="{NAV_ID[page]}" aria-current="page"')
        # structured data for this page
        home_name = 'Mind-OS'
        graph = [{'@context': 'https://schema.org', '@type': 'WebPage', '@id': url(lang, page), 'url': url(lang, page), 'name': h1, 'description': desc,
                  'inLanguage': lang, 'isPartOf': {'@type': 'WebSite', 'name': 'Mind-OS', 'url': SITE}},
                 {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
                     {'@type': 'ListItem', 'position': 1, 'name': home_name, 'item': url(lang, 'index.html')},
                     {'@type': 'ListItem', 'position': 2, 'name': h1, 'item': url(lang, page)}]}]
        if page == 'faq.html':
            graph.append({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
                {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq_pairs(body)]})
        ld = '<script type="application/ld+json">\n' + json.dumps(graph, ensure_ascii=False, indent=2) + '\n</script>'
    else:
        # home: keep WebPage / Quiz / SoftwareApplication, FAQ markup only for the questions still on this page
        m = re.search(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', out, re.S)
        items = json.loads(m.group(1))
        items = items if isinstance(items, list) else items.get('@graph', [items])
        vis = {q for q, _ in faq_pairs(out)}
        graph = []
        for it in items:
            if it.get('@type') == 'BreadcrumbList':
                continue
            if it.get('@type') == 'FAQPage':
                it['mainEntity'] = [q for q in it['mainEntity'] if text(q['name']) in vis]
            graph.append(it)
        ld = '<script type="application/ld+json">\n' + json.dumps(graph, ensure_ascii=False, indent=2) + '\n</script>'
    lds = list(re.finditer(r'<script type="application/ld\+json"[^>]*>.*?</script>', out, re.S))
    for k, m in reversed(list(enumerate(lds))):
        out = out[:m.start()] + (ld if k == 0 else '') + out[m.end():]
    notes = research_notes.block(lang, page)        # sourced "what research says" block, right after the page's main section
    if notes:
        k = out.index('</section>', out.index('<main')) + len('</section>')
        out = out[:k] + chr(10) + chr(10) + chr(32) * 2 + notes + out[k:]
    for js in DROP_JS[page]:
        out, n = re.subn(r'<script src="(?:\.\./)?js/' + re.escape(js) + r'" defer></script>\r?\n?', '', out)
        assert n == 1, (page, js, n)
    return out


def sitemap():
    today = datetime.date.today().isoformat()
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page in PAGES:
        for lang in LANGS:
            x.append('  <url>')
            x.append(f'    <loc>{url(lang, page)}</loc>')
            x.append(f'    <lastmod>{today}</lastmod>')
            x.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{url("en", page)}"/>')
            for l2 in LANGS:
                x.append(f'    <xhtml:link rel="alternate" hreflang="{l2}" href="{url(l2, page)}"/>')
            x.append('  </url>')
    x.append('</urlset>')
    open(ROOT + 'sitemap.xml', 'w', encoding='utf-8', newline='\n').write('\n'.join(x) + '\n')


def main():
    n = 0
    for lang in LANGS:
        src = ROOT + ('tools/full-page.tpl' if lang == 'en' else lang + '/index.html')
        raw = open(src, 'rb').read()
        bom = raw.startswith(b'\xef\xbb\xbf')
        full = raw.decode('utf-8-sig')
        assert 'id="protocols-section"' in full and 'id="poll-section"' in full, f'{src} is not a full page - run build.ps1 and prerender.py first'
        for page in PAGES:
            out = make(full, lang, page)
            dst = ROOT + ('' if lang == 'en' else lang + os.sep) + page
            open(dst, 'wb').write((b'\xef\xbb\xbf' if bom else b'') + out.encode('utf-8'))
            n += 1
    sitemap()
    print('pages written:', n, '| sitemap URLs:', len(LANGS) * len(PAGES))


if __name__ == '__main__':
    main()
