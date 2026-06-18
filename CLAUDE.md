# CLAUDE.md — рабочий контекст проекта Mind-OS

Этот файл — память между чатами. Прочитай его первым.

## Как работать (правила, согласованные с владельцем)
- ТОЛЬКО проверенные факты. Ноль догадок и предположений.
- Не поддакивать. Прав — объясни почему. Не прав — скажи прямо.
- НЕ делать git push без явного "пуш делай" от владельца.
- НЕ добавлять новые языки без явного запроса.
- НЕ использовать New-Object в PowerShell (ConstrainedLanguage mode).
- Только улучшать и добавлять — никогда не удалять существующий функционал.
- Если владелец говорит "стоп" — немедленно остановиться.
- Общаться ТОЛЬКО на русском языке.

## Что это за проект
Mind-OS — бесплатный анонимный браузерный тест на зависимость от ИИ.
Vanilla HTML/CSS/JS, без фреймворков, localStorage, PWA, 12 языков (en/ru/es/de/fr/ja/vi/th/pt/ko/it/hi).
- Живой сайт: https://iamalex-afk.github.io/human-os-patch-33-protocols/ (деплоится из main)
- Репозиторий: github.com/IamAlex-afk/human-os-patch-33-protocols
- Автор: Aleksei Sergeevich Bitkin, ORCID 0009-0002-7986-3812, Zenodo DOI 10.5281/zenodo.17972301

## Текущее состояние git (по состоянию на 2026-06-18)
**Ветка:** main (задеплоена — PR #5 смержен, сайт живой)

**Что в продакшене:**
- 12 языков: en, ru, es, de, fr, ja, vi, th, pt, ko, it, hi
- pt/ko/it/hi — добавлены 2026-06-18 (после vi/th), полные статические страницы с переводами
- `js/translations.js` (304 КБ, все 12 языков) разбит на `js/translations-core.js` (логика getT/Proxy) + `js/translations/<lang>.js` (по языку, ~20-43 КБ). Каждая страница грузит только свой язык + en.js (фолбэк)
- Шрифты: Inter самохостится (`css/fonts.css` + `css/fonts/*.woff2`, 7 файлов/228 КБ), Google Fonts больше не используется на 11 из 12 страниц. Noto Sans JP остаётся на Google Fonts, но подключается только на `/ja/` (через `TRANSLATIONS_LANG_PLACEHOLDER`/`JP_FONT_PLACEHOLDER` в build.ps1)
- CSP сужен (`style-src`/`font-src`/`connect-src` без Google-доменов) везде кроме `/ja/`, где он расширяется обратно
- PWA: кнопка "Install App" в nav, beforeinstallprompt, SW mindos-2026-7
- Глобальный опрос: POLL_API='' (симуляция), кнопка "Пригласить друга"
- `.github/workflows/refresh-sitemap.yml` УДАЛЁН 2026-06-18 — еженедельно проставлял lastmod всем 12 URL без реальных изменений контента; по данным Google Search Central это подрывает доверие к lastmod как сигналу для переиндексации. Теперь lastmod в sitemap.xml обновляется вручную только при реальном изменении контента
- sitemap.xml: 12 URL со schema, hreflang, image sitemap
- Schema.org: WebPage + Quiz (inLanguage все 12 языков) + FAQPage(13) + SoftwareApplication (inLanguage все 12)

## Структура теста (ФАКТ, проверено по коду)
- 3 оси зависимости × 8 вопросов = 24 вопроса (q1=мышление, q2=эмоции, q3=продуктивность)
- Тест «страх ИИ» = 4 вопроса (fearQ)
- Итого 28 вопросов. config: MAX_AXIS=32, TOTAL_MAX=96, FEAR_MAX=16.

## Что сделано (продакшен, 2026-06-18)

### SEO и AI-совместимость
- Static multilingual pages: ru/, es/, de/, fr/, ja/, vi/, th/, pt/, ko/, it/, hi/ — генерируются через .\build.ps1
- sitemap.xml: 12 URL, bidirectional hreflang, image sitemap, lastmod обновляется ВРУЧНУЮ при реальных изменениях (не cron)
- Schema.org: WebPage + Quiz (inLanguage 12 языков) + FAQPage(13) + SoftwareApplication (inLanguage 12) + BreadcrumbList
- Person sameAs: ORCID + Zenodo DOI + GitHub
- robots.txt: 15+ AI-ботов разрешены, sitemap указан
- hreflang: на всех 12 страницах + sitemap.xml

### Производительность и приватность
- `js/translations-core.js` + `js/translations/<lang>.js` вместо одного файла на 304 КБ — экономия ~80-93% JS на странице
- Inter самохостится, Noto Sans JP только на /ja/ — закрывает противоречие между "zero data collection" заявлением и кросс-доменными запросами к Google Fonts на остальных 11 страницах

### PWA
- sw.js: CACHE mindos-2026-7, PRECACHE включает core assets + translations-core.js + en.js (остальные языки кэшируются лениво при первом визите) + все 11 языковых страниц
- manifest.json: standalone, theme_color, shortcuts
- Кнопка установки в nav (скрыта до beforeinstallprompt)

### Вирусные механики
- Web Share API + canvas-карточка результата
- Кнопка "Пригласить друга" в секции опроса
- Глобальный опрос — РЕАЛЬНЫЙ backend подключён 2026-06-18 (Google Apps Script, `poll-backend/Code.gs`). Хранит только 3 счётчика (PropertiesService), без IP/email/timestamp/per-vote записей. API отдаёт только проценты (forPct/neutralPct/againstPct), total не возвращается и не показывается в UI. Deployment: "Execute as: Me", "Who has access: Anyone, even anonymous"

## Открытые вопросы (НЕ решать без явного запроса)
1. ~~POLL_API~~ — закрыто 2026-06-18, backend реальный и подключён.
2. **Twitter/X handle** — twitter:creator не добавлен (handle неизвестен).
3. **512px иконка PWA** — нет отдельного 512×512 PNG (используется тот же файл что 192px).
4. **LICENSE конфликт** — README говорит CC BY-NC-ND, файл LICENSE — GPL v3. Владелец решает.
5. **Google Search Console** — запросить индексацию для: /, /ru/, /es/, /de/, /fr/, /ja/, /th/, /pt/, /ko/, /it/, /hi/ (vi/ уже запрошен). Лимит 10/день.

## Как запустить build.ps1 (генерация языковых страниц)
```powershell
cd C:\Users\79643\human-os-patch-33-protocols
.\build.ps1
```
Создаёт/перезаписывает: ru/index.html, es/index.html, de/index.html, fr/index.html, ja/index.html, vi/index.html, th/index.html, pt/index.html, ko/index.html, it/index.html, hi/index.html

## Как проверить локально (HTTP-сервер)
```powershell
python -m http.server 8000
# затем открыть http://localhost:8000
```
