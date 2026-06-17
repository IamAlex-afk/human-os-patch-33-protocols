# CLAUDE.md — рабочий контекст проекта Mind-OS

Этот файл — память между чатами. Прочитай его первым.

## Как работать (правила, согласованные с владельцем)
- ТОЛЬКО проверенные факты. Ноль догадок и предположений.
- Не поддакивать. Прав — объясни почему. Не прав — скажи прямо.
- НЕ делать git push без явного "пуш делай" от владельца.
- НЕ добавлять новые языки (pt/ko/it и т.д.) без явного запроса.
- НЕ использовать New-Object в PowerShell (ConstrainedLanguage mode).
- Только улучшать и добавлять — никогда не удалять существующий функционал.
- Если владелец говорит "стоп" — немедленно остановиться.
- Общаться ТОЛЬКО на русском языке.

## Что это за проект
Mind-OS — бесплатный анонимный браузерный тест на зависимость от ИИ.
Vanilla HTML/CSS/JS, без фреймворков, localStorage, PWA, 6 языков (en/ru/es/de/fr/ja).
- Живой сайт: https://iamalex-afk.github.io/human-os-patch-33-protocols/ (деплоится из main)
- Репозиторий: github.com/IamAlex-afk/human-os-patch-33-protocols
- Автор: Aleksei Sergeevich Bitkin, ORCID 0009-0002-7986-3812, Zenodo DOI 10.5281/zenodo.17972301

## Текущее состояние git (по состоянию на 2026-06-17)
**Ветка:** test-final (НЕ задеплоена — GitHub Pages деплоит только из main)

**Коммиты в test-final:**
1. `2b94057` — chore: update .gitignore (исключён LICENSE-CC-BY-NC-ND-alternative.txt)
2. `35cf8a8` — chore: production readiness, PWA, AI discoverability
3. `d857dbc` — fix: charset UTF-8, translation errors DE/FR/ES
4. `9a41ea6` — feat: static multilingual SEO pages (ru/ es/ de/ fr/ ja/)
5. `24256d3` — audit: sync 28q, remove Amazon CTA, dual-license, SEO/GEO fixes

**Staged (не закоммичено):** удаление site.webmanifest (дубликат, устаревший)

## Структура теста (ФАКТ, проверено по коду)
- 3 оси зависимости × 8 вопросов = 24 вопроса (q1=мышление, q2=эмоции, q3=продуктивность)
- Тест «страх ИИ» = 4 вопроса (fearQ)
- Итого 28 вопросов. config: MAX_AXIS=32, TOTAL_MAX=96, FEAR_MAX=16.

## Что сделано (всё проверено, кроме реального браузера у владельца)

### SEO и AI-совместимость
- Static multilingual pages: ru/, es/, de/, fr/, ja/ — генерируются через .\build.ps1
- sitemap.xml: 6 URL со статическими путями + полный bidirectional hreflang
- Schema.org: WebPage + FAQPage(13) + SoftwareApplication + BreadcrumbList + Quiz schema
- Person sameAs: ORCID + Zenodo DOI + GitHub в author блоке
- llms.txt, ai.txt, robots.txt — все AI-боты разрешены (OpenAI, Gemini, Claude, Perplexity, DeepSeek, Mistral, Yandex)
- hreflang: на всех 6 страницах, самореферентные ссылки

### Технические исправления
- charset UTF-8 добавлен первым в <head> (без него Кириллица/Японский/эмодзи отображались кракозябрами)
- SW registration path: './sw.js' → '../sw.js' в языковых подпапках (через build.ps1)
- Переводы: DE prokrastination, FR protocoles/contrats, ES ¿Vas a la IA?

### PWA
- sw.js: Service Worker v2026.1, прекэширует основные ассеты
- manifest.json: полный PWA манифест (категории, shortcuts, icons)
- site.webmanifest: УДАЛЁН (старый дубликат, конфликтовал с manifest.json по start_url)

## Что нужно сделать (в порядке приоритета)

### 1. Закоммитить удаление site.webmanifest (staging уже готов)
```powershell
git commit -m "chore: remove obsolete site.webmanifest, manifest.json is canonical"
```

### 2. Дождаться "пуш делай" от владельца
```powershell
git push origin test-final
```

### 3. После push — создать PR и смержить в main
GitHub Actions задеплоит автоматически (~2 мин).

### 4. После деплоя
- Google Search Console → Submit sitemap: https://iamalex-afk.github.io/human-os-patch-33-protocols/sitemap.xml
- Lighthouse/F12 проверка (владелец сам, в браузере)

## Открытые вопросы (НЕ решать без явного запроса)
1. **Twitter/X handle** — неизвестен. twitter:creator не добавлен. Спросить у владельца.
2. **512px иконка PWA** — используется тот же файл что 192px (размытие). Нужна реальная 512px PNG.
3. **sw.js** — не кэширует языковые страницы /ru/, /es/ и т.д. PWA работает только для EN.
4. **LICENSE конфликт** — README говорит CC BY-NC-ND, файл LICENSE — GPL v3. Владелец решает.

## Как запустить build.ps1 (генерация языковых страниц)
```powershell
cd C:\Users\79643\human-os-patch-33-protocols
.\build.ps1
```
Создаёт/перезаписывает: ru/index.html, es/index.html, de/index.html, fr/index.html, ja/index.html

## Как проверить локально (HTTP-сервер)
```powershell
python -m http.server 8000
# затем открыть http://localhost:8000
```
