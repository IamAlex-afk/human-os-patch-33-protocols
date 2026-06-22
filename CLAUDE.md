# CLAUDE.md — рабочий контекст проекта Mind-OS

Этот файл — память между чатами. Прочитай его первым.

## Как работать
- ТОЛЬКО проверенные факты. Ноль догадок и предположений.
- Не поддакивать. Прав — объясни почему. Не прав — скажи прямо.
- НЕ делать git push без явного разрешения владельца.
- НЕ добавлять новые языки без явного запроса.
- НЕ использовать New-Object в PowerShell (ConstrainedLanguage mode).
- Только улучшать и добавлять — никогда не удалять существующий функционал без явного запроса.
- Если владелец говорит "стоп" — немедленно остановиться.
- Общаться ТОЛЬКО на русском языке.

## Что это за проект
Mind-OS — бесплатный анонимный браузерный тест на зависимость от ИИ.
Vanilla HTML/CSS/JS, без фреймворков, localStorage, PWA, 12 языков (en/ru/es/de/fr/ja/vi/th/pt/ko/it/hi).
- Живой сайт: https://iamalex-afk.github.io/human-os-patch-33-protocols/ (деплоится из main)
- Репозиторий: github.com/IamAlex-afk/human-os-patch-33-protocols
- Автор: Aleksei Sergeevich Bitkin, ORCID 0009-0002-7986-3812, Zenodo DOI 10.5281/zenodo.17972301

## Что в продакшене
- 12 языков: en, ru, es, de, fr, ja, vi, th, pt, ko, it, hi — статические страницы генерируются через `.\build.ps1`
- `js/translations-core.js` (логика getT/Proxy) + `js/translations/<lang>.js` (по языку). Каждая страница грузит только свой язык + en.js (фолбэк)
- Шрифты: Inter самохостится (`css/fonts.css` + `css/fonts/*.woff2`). Noto Sans JP подключается только на `/ja/` через Google Fonts
- CSP сужен (без Google-доменов в style-src/font-src/connect-src) везде кроме `/ja/`
- PWA: манифест с одной иконкой `apple-touch-icon.png` (180×180), кнопка "Install App" в nav, beforeinstallprompt
- sw.js: precache core assets + translations-core.js + en.js + все языковые страницы
- Глобальный опрос: реальный backend на Google Apps Script (`poll-backend/Code.gs`), хранит только 3 счётчика, без IP/email/timestamp. API отдаёт только проценты (forPct/neutralPct/againstPct)
- Вирусные механики: Web Share API, canvas-карточка результата, кнопка "Пригласить друга"
- sitemap.xml: 12 URL, hreflang (13 тегов на странице, включая x-default), schema.org (WebPage + Quiz + FAQPage + SoftwareApplication + BreadcrumbList)
- robots.txt: AI-боты разрешены, sitemap указан
- Google Search Console: верификация файлом `googled8a35f2a8c073799.html`
- Порядок секций на странице (после Poll): AI FAQ → основной FAQ → FAQ slang ("Popular Questions and Answers") → Ecosystem (база знаний со ссылками) → 33 Protocols → How it works. Менять порядок — только в `index.html`, затем `.\build.ps1` пересобирает все 12 языков.

## Структура теста (ФАКТ, проверено по коду)
- 3 оси зависимости × 8 вопросов = 24 вопроса (q1=мышление, q2=эмоции, q3=продуктивность)
- Тест «страх ИИ» = 4 вопроса (fearQ)
- Итого 28 вопросов. config: MAX_AXIS=32, TOTAL_MAX=96, FEAR_MAX=16

## Открытые вопросы
1. **LICENSE конфликт** — README говорит CC BY-NC-ND, файл LICENSE — GPL v3.
2. **Google Search Console** — индексация запрошена не для всех 12 языковых URL (лимит 10/день).

Twitter/X handle — решено не добавлять (владелец подтвердил, что не нужен).

## Как запустить build.ps1 (генерация языковых страниц)
```powershell
cd C:\Users\79643\human-os-patch-33-protocols
.\build.ps1
```
Создаёт/перезаписывает: ru/, es/, de/, fr/, ja/, vi/, th/, pt/, ko/, it/, hi/ (index.html в каждой)

## Как проверить локально (HTTP-сервер)
```powershell
python -m http.server 8000
# затем открыть http://localhost:8000
```
