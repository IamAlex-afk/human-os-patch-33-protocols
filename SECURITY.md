# Security Policy

## Supported Versions

| Version  | Supported |
| -------- | --------- |
| 2026.1.0 | Yes       |

## Architecture

Mind-OS is a static site on GitHub Pages; the assessment runs entirely in the browser.

- The tests and the protocols have no server and no database
- No backend at all: the tests are scored in the browser; the Content-Security-Policy allows only this site's own origin.
- No user accounts — no credentials to compromise
- No cookies — no session hijacking
- Only the language choice and, if the visitor asks, saved scores (never the answers) are kept in the visitor's own browser (localStorage)
- Content Security Policy active
- XSS protection via escapeHtml() in all scripts

## Reporting a Vulnerability

Please report security issues privately, not in public Issues:
https://github.com/IamAlex-afk/human-os-patch-33-protocols/security/advisories/new

Expected response time: within 7 days.
