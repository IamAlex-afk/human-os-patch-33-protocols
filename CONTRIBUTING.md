# Contributing to Mind-OS

Mind-OS publishes short self-reflection questionnaires about AI use. They are **not** validated clinical tests, and the
project keeps one rule above all others: nothing on the site may claim more than the evidence shows, and nothing a visitor
answers may leave their browser.

## What is welcome
- **Translation fixes.** A question that sounds unnatural or means something different in your language. Please quote the
  current text, your version, and a word-for-word translation back into English, so the meaning can be compared.
- **Errors.** Wrong numbers, broken links, a source that does not say what the site attributes to it — include the link.
- **Research.** If you test a scale from `scales/` with real participants (with their consent), we would like to hear about
  the results, including bad ones. The scales are CC BY 4.0 for exactly this.
- **Accessibility and bugs** — with the page, language, device and what you expected.

## Changing a question, an answer option or the scoring
These change what a result means, so they follow a stricter path:
1. Open an issue first and explain the reason: which published research or which observed problem it addresses.
2. A change to wording must keep the item answerable on its scale ("how often" or "how much do you agree"), one idea per
   item, no double negatives, no reverse-worded items.
3. Every language changes together; the scale's `version` in `scales/<id>.json` goes up and `scales/CHANGELOG.md` says what
   changed and why.
4. `node tools/test_scales.mjs` and `python tools/site_check.py` must pass (the deploy runs both and stops on a failure).

## What will not be accepted
- Claims that a test is validated, diagnostic or "scientifically proven".
- Analytics, trackers, cookies, accounts, or any request to another server while a test is taken.
- Thresholds presented as population norms without data from a study that measured them.

## Building the site
From the `site` folder (Windows, PowerShell 5 + Python 3 + Edge or Chrome for the prerender step):
`build.ps1` → `python tools/prerender.py` → `python tools/split_pages.py` → `python tools/info_pages.py`
→ `python tools/scale_pages.py` → `python tools/site_check.py` → `node tools/test_scales.mjs`.

## Security
Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).
