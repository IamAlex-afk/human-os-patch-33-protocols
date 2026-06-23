import io, json, re, os

LANGS = ["ru", "es", "de", "fr", "ja", "vi", "th", "pt", "ko", "it", "hi"]

FAQ_KEY_PAIRS = [
    ("faqAiWhatQ", "faqAiWhatA"), ("faqAiHistoryQ", "faqAiHistoryA"), ("faqAiHowWorkQ", "faqAiHowWorkA"),
    ("faqAiTypesQ", "faqAiTypesA"), ("faqAiDangerQ", "faqAiDangerA"),
    ("faqQ1", "faqA1"), ("faqQ2", "faqA2"), ("faqQ3", "faqA3"), ("faqQ4", "faqA4"),
    ("faqQ5", "faqA5"), ("faqQ6", "faqA6"), ("faqQ7", "faqA7"), ("faqQ8", "faqA8"),
    ("faqSlangQ1", "faqSlangA1"), ("faqSlangQ2", "faqSlangA2"), ("faqSlangQ3", "faqSlangA3"),
    ("faqSlangQ4", "faqSlangA4"), ("faqSlangQ5", "faqSlangA5"),
]


def get_key(content, key):
    m = re.search(re.escape(key) + r':\s*"((?:[^"\\]|\\.)*)"', content)
    if not m:
        return None
    return m.group(1).replace('\\"', '"')


def strip_html(s):
    if not s:
        return s
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'").replace("&mdash;", "—")
    return s.strip()


def strip_emoji_prefix(s):
    if not s:
        return s
    return re.sub(r"^[^\w]+", "", s, flags=re.UNICODE).strip()


def build_faq_entities(trans_content):
    entries = []
    for qkey, akey in FAQ_KEY_PAIRS:
        q = get_key(trans_content, qkey)
        a = get_key(trans_content, akey)
        if q and a:
            entries.append({
                "@type": "Question",
                "name": strip_html(q),
                "acceptedAnswer": {"@type": "Answer", "text": strip_html(a)},
            })
    return entries


def localize(lang):
    path = os.path.join(lang, "index.html")
    with io.open(path, "r", encoding="utf-8") as f:
        html = f.read()

    title_m = re.search(r'<title id="dynamicTitle">([^<]*) \| Mind-OS</title>', html)
    desc_m = re.search(r'<meta name="description" id="dynamicDescription" content="([^"]*)"', html)
    if not title_m or not desc_m:
        print("SKIP", lang, "- could not find title/description")
        return
    title = title_m.group(1)
    desc = desc_m.group(1)
    base_url = "https://iamalex-afk.github.io/human-os-patch-33-protocols/" + lang + "/"

    with io.open(os.path.join("js", "translations", lang + ".js"), "r", encoding="utf-8") as f:
        trans_content = f.read()

    # WebPage: name, url, description
    html = re.sub(
        r'("@type":\s*"WebPage",\s*\n\s*"name":\s*")[^"]*(",\s*\n\s*"url":\s*")[^"]*(",\s*\n\s*"description":\s*")[^"]*(")',
        lambda m: m.group(1) + json.dumps(title)[1:-1] + m.group(2) + base_url + m.group(3) + json.dumps(desc)[1:-1] + m.group(4),
        html, count=1,
    )

    # Quiz: name, description, url
    html = re.sub(
        r'("@type":\s*"Quiz",\s*\n\s*"name":\s*")[^"]*(",\s*\n\s*"description":\s*")[^"]*(",\s*\n\s*"url":\s*")[^"]*(")',
        lambda m: m.group(1) + json.dumps(title)[1:-1] + m.group(2) + json.dumps(desc)[1:-1] + m.group(3) + base_url + m.group(4),
        html, count=1,
    )

    # FAQPage mainEntity
    entities = build_faq_entities(trans_content)
    if entities:
        entity_json = json.dumps(entities, ensure_ascii=False, indent=2)
        # re-indent to match template style (8 spaces base)
        entity_json = "\n".join(("        " + line if line.strip() else line) for line in entity_json.splitlines())
        html = re.sub(
            r'"mainEntity":\s*\[[\s\S]*?\n\s*\]',
            lambda m: '"mainEntity": ' + entity_json.strip(),
            html, count=1,
        )

    # BreadcrumbList labels
    bc_map = {
        1: strip_emoji_prefix(get_key(trans_content, "navAssessment")),
        2: strip_emoji_prefix(get_key(trans_content, "trackerTitle")),
        3: strip_emoji_prefix(get_key(trans_content, "protocolsTitle")),
        4: strip_emoji_prefix(get_key(trans_content, "faqTitle")),
    }
    for pos, label in bc_map.items():
        if label:
            html = re.sub(
                r'("position":%d,"name":")[^"]*(")' % pos,
                lambda m, l=label: m.group(1) + json.dumps(l)[1:-1] + m.group(2),
                html, count=1,
            )

    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    print("OK", lang, "- localized JSON-LD (", len(entities), "FAQ entries )")


for lang in LANGS:
    localize(lang)
