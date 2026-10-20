# Security Policy

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| 2026.1.0 | Yes       |

## Architecture

Mind-OS is a static site on GitHub Pages; the assessment runs entirely in the browser.

- The assessment, tracker, game and protocols have no server and no database
- No backend at all: the tests are scored in the browser; the Content-Security-Policy allows only this site's own origin.
- No user accounts — no credentials to compromise
- No cookies — no session hijacking
- All data stored in the user's own browser (localStorage)
- Content Security Policy active
- XSS protection via escapeHtml() in all scripts

## Reporting a Vulnerability

Report security issues via GitHub Issues:
https://github.com/IamAlex-afk/human-os-patch-33-protocols/issues

Expected response time: within 7 days.
