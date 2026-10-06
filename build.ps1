# build.ps1 — generates static language subdirectories for SEO
# Usage: cd to repo root, then: .\build.ps1

$ErrorActionPreference = 'Stop'
$BASE = "https://iamalex-afk.github.io/human-os-patch-33-protocols"

$langs = @{
  ru = @{
    title  = "Тест на зависимость от ИИ и ChatGPT — бесплатно"
    desc   = "Анонимный тест из 28 вопросов: насколько вы полагаетесь на ИИ и ChatGPT в мышлении, эмоциях и работе. Основан на шкалах LLM-D12 и AIAS. Без регистрации."
    locale = "ru_RU"
  }
  es = @{
    title  = "Test de dependencia de la IA y ChatGPT, gratis"
    desc   = "Test anónimo de 28 preguntas: ¿cuánto dependes de la IA y de ChatGPT para pensar, sentir y trabajar? Basado en LLM-D12 y AIAS. Sin registro."
    locale = "es_ES"
  }
  de = @{
    title  = "KI-Abhängigkeit: Selbsttest gratis (ChatGPT & Co.)"
    desc   = "Anonymer Test mit 28 Fragen: Wie sehr verlassen Sie sich beim Denken, Fühlen und Arbeiten auf KI und ChatGPT? Basiert auf LLM-D12 und AIAS. Ohne Anmeldung."
    locale = "de_DE"
  }
  fr = @{
    title  = "Test de dépendance à l’IA et à ChatGPT, gratuit"
    desc   = "Test anonyme de 28 questions : à quel point dépendez-vous de l’IA et de ChatGPT pour penser, ressentir et travailler ? Basé sur LLM-D12 et AIAS. Sans inscription."
    locale = "fr_FR"
  }
  ja = @{
    title  = "AI依存度チェック【無料・匿名】28の質問で診断"
    desc   = "AI依存度を28問で無料チェック。認知的オフロード、AI不安、デジタル燃え尽き症候群を科学的根拠に基づき匿名で診断。登録不要、データ収集なし。よくある質問とグローバル投票も含まれています。"
    locale = "ja_JP"
  }
  vi = @{
    title  = "Bài test mức độ phụ thuộc AI và ChatGPT miễn phí"
    desc   = "Bài test ẩn danh gồm 28 câu hỏi: bạn dựa vào AI và ChatGPT đến mức nào khi suy nghĩ, cảm xúc và làm việc? Dựa trên thang LLM-D12 và AIAS. Không cần đăng ký."
    locale = "vi_VN"
  }
  th = @{
    title  = "แบบทดสอบการพึ่งพา AI และ ChatGPT ฟรี"
    desc   = "แบบทดสอบฟรีและไม่ระบุตัวตน 28 ข้อ: คุณพึ่งพา AI และ ChatGPT มากแค่ไหนในการคิด อารมณ์ และการทำงาน อ้างอิงมาตรวัด LLM-D12 และ AIAS ไม่ต้องสมัครสมาชิก"
    locale = "th_TH"
  }
  pt = @{
    title  = "Teste de dependência de IA e ChatGPT, grátis"
    desc   = "Teste anônimo com 28 perguntas: quanto você depende da IA e do ChatGPT para pensar, sentir e trabalhar? Baseado em LLM-D12 e AIAS. Sem cadastro."
    locale = "pt_PT"
  }
  ko = @{
    title  = "AI·챗GPT 의존도 테스트 – 무료 자가진단"
    desc   = "28문항 무료 익명 테스트: 생각, 감정, 업무에서 AI와 챗GPT에 얼마나 의존하고 있나요? LLM-D12와 AIAS 척도 기반. 가입 불필요."
    locale = "ko_KR"
  }
  it = @{
    title  = "Test di dipendenza da IA e ChatGPT, gratis"
    desc   = "Test anonimo di 28 domande: quanto ti affidi all’IA e a ChatGPT per pensare, per le emozioni e per il lavoro? Basato su LLM-D12 e AIAS. Senza registrazione."
    locale = "it_IT"
  }
  hi = @{
    title  = "AI और ChatGPT निर्भरता टेस्ट – मुफ़्त"
    desc   = "28 सवालों का मुफ़्त और गुमनाम टेस्ट: सोचने, भावनाओं और काम के लिए आप AI और ChatGPT पर कितना निर्भर हैं? LLM-D12 और AIAS पर आधारित। साइन-अप की ज़रूरत नहीं।"
    locale = "hi_IN"
  }
}

$template = Get-Content "index.html" -Raw -Encoding UTF8

foreach ($lang in $langs.Keys) {
  $t = $langs[$lang]
  $html = $template

  # 1. html lang attribute
  $html = $html -replace '(<html lang=")[^"]*(")', "`$1$lang`$2"

  # 2. title tag
  $safeTitle = [regex]::Escape($t.title) -replace '\$', '$$$$'
  $html = $html -replace '(<title id="dynamicTitle">)[^<]*(</title>)', "`$1$($t.title) | Mind-OS`$2"

  # 3. meta description
  $html = $html -replace '(<meta name="description" id="dynamicDescription" content=")[^"]*(")', "`$1$($t.desc)`$2"

  # 4. canonical href
  $html = $html -replace '(<link rel="canonical" id="dynamicCanonical" href=")[^"]*(")', "`$1$BASE/$lang/`$2"

  # 5. og:url
  $html = $html -replace '(<meta property="og:url" id="dynamicOgUrl" content=")[^"]*(")', "`$1$BASE/$lang/`$2"

  # 6. og:title
  $html = $html -replace '(<meta property="og:title" id="dynamicOgTitle" content=")[^"]*(")', "`$1$($t.title)`$2"

  # 7. og:description
  $html = $html -replace '(<meta property="og:description" id="dynamicOgDescription" content=")[^"]*(")', "`$1$($t.desc)`$2"

  # 8. og:locale (primary)
  $html = $html -replace '(<meta property="og:locale" content=")[^"]*(")', "`$1$($t.locale)`$2"

  # 9. twitter:title
  $html = $html -replace '(<meta name="twitter:title" content=")[^"]*(")', "`$1$($t.title)`$2"

  # 10. twitter:description
  $html = $html -replace '(<meta name="twitter:description" content=")[^"]*(")', "`$1$($t.desc)`$2"

  # 10b. Noto Sans JP (Google Fonts) — only needed on /ja/, self-hosted Inter covers the rest
  if ($lang -eq 'ja') {
    $jpFontBlock = @'
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet"></noscript>
'@
    $html = $html -replace '<!-- JP_FONT_PLACEHOLDER -->', $jpFontBlock
    $html = $html -replace "style-src 'self' 'unsafe-inline';", "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    $html = $html -replace "font-src 'self';", "font-src 'self' https://fonts.gstatic.com;"
    $html = $html -replace 'https://script\.googleusercontent\.com;\"', 'https://script.googleusercontent.com https://fonts.gstatic.com;"'
  } else {
    $html = $html -replace '\s*<!-- JP_FONT_PLACEHOLDER -->\r?\n', "`n"
  }

  # 10c. Load this language's translation file (en.js is always loaded as fallback)
  $html = $html -replace '<!-- TRANSLATIONS_LANG_PLACEHOLDER -->', "<script src=`"js/translations/$lang.js`" defer></script>"

  # 11. Fix relative asset paths (add ../ prefix)
  $html = $html -replace 'href="css/', 'href="../css/'
  $html = $html -replace 'href="js/', 'href="../js/'
  $html = $html -replace 'href="privacy.html"', 'href="../privacy.html"'
  $html = $html -replace 'src="js/', 'src="../js/'
  $html = $html -replace 'href="favicon\.ico"', 'href="../favicon.ico"'
  $html = $html -replace 'href="apple-touch-icon\.png"', 'href="../apple-touch-icon.png"'
  $html = $html -replace 'href="manifest\.json"', 'href="../manifest.json"'
  $html = $html -replace 'href="humans\.txt"', 'href="../humans.txt"'

  # 12. Fix service worker registration path
  $html = $html -replace "register\('sw\.js'\)", "register('../sw.js')"
  $html = $html -replace "register\('\./sw\.js'\)", "register('../sw.js')"
  $html = $html -replace 'register\("sw\.js"\)', 'register("../sw.js")'
  $html = $html -replace 'register\("\./sw\.js"\)', 'register("../sw.js")'

  # 13. Inject SITE_LANG before </head>
  $html = $html -replace '</head>', "<script>window.SITE_LANG='$lang';</script>`n</head>"

  # 14. Replace H1 inline text (fallback visible before JS loads)
  $html = $html -replace '(<h1 id="mainTitle"[^>]*>)[^<]*', "`$1$($t.title)"

  # 15. Replace subhead inline text
  $html = $html -replace '(<div class="subhead" id="subheadText">)[^<]*', "`$1$($t.desc)"

  # 16. Write output
  New-Item -ItemType Directory -Force -Path $lang | Out-Null
  [System.IO.File]::WriteAllText("$lang/index.html", $html, [System.Text.Encoding]::UTF8)
  Write-Host "OK $lang/index.html"
}

Write-Host "Done. Generated: $($langs.Keys -join ', ')"

# Localize JSON-LD structured data (WebPage/Quiz/FAQPage/BreadcrumbList) per language.
# Done in Python for reliable UTF-8 handling.
python localize_jsonld.py
