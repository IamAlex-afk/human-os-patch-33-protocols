# build.ps1 — generates static language subdirectories for SEO
# Usage: cd to repo root, then: .\build.ps1

$ErrorActionPreference = 'Stop'
$BASE = "https://iamalex-afk.github.io/human-os-patch-33-protocols"

$langs = @{
  ru = @{
    title  = "Бесплатный тест на зависимость от ИИ"
    desc   = "Научно-обоснованная анонимная оценка когнитивной разгрузки, ИИ-тревожности и цифрового выгорания. Без регистрации, без сбора данных."
    locale = "ru_RU"
  }
  es = @{
    title  = "Test gratuito de dependencia de IA – Comprende tus hábitos"
    desc   = "Evaluación anónima de la descarga cognitiva, ansiedad por IA y agotamiento digital. Sin registro, sin recopilación de datos."
    locale = "es_ES"
  }
  de = @{
    title  = "Kostenloser KI-Abhängigkeitstest – Verstehen Sie Ihre Gewohnheiten"
    desc   = "Wissenschaftlich fundierte anonyme Bewertung von kognitiver Entlastung, KI-Angst und digitalem Burnout. Keine Anmeldung, keine Daten."
    locale = "de_DE"
  }
  fr = @{
    title  = "Test gratuit de dépendance à l'IA – Comprenez vos habitudes"
    desc   = "Évaluation anonyme basée sur la science de la décharge cognitive, de l'anxiété liée à l'IA et de l'épuisement numérique. Sans inscription, sans collecte de données."
    locale = "fr_FR"
  }
  ja = @{
    title  = "無料AI依存度テスト – あなたの習慣を理解する"
    desc   = "認知的オフロード、AI不安、デジタル燃え尽き症候群の科学的かつ匿名のアセスメント。登録不要、データ収集なし。"
    locale = "ja_JP"
  }
  vi = @{
    title  = "Bài kiểm tra phụ thuộc AI miễn phí – Hiểu thói quen AI của bạn"
    desc   = "Đánh giá ẩn danh dựa trên khoa học về giảm tải nhận thức, lo lắng AI và kiệt sức kỹ thuật số. Không đăng ký, không thu thập dữ liệu."
    locale = "vi_VN"
  }
  th = @{
    title  = "แบบทดสอบการพึ่งพา AI ฟรี – เข้าใจนิสัยของคุณ"
    desc   = "การประเมินแบบไม่ระบุตัวตนตามหลักวิทยาศาสตร์เกี่ยวกับการถ่ายโอนงานด้านความคิด ความวิตกกังวลด้าน AI และความหมดไฟดิจิทัล ไม่ต้องสมัครสมาชิก ไม่เก็บข้อมูล"
    locale = "th_TH"
  }
  pt = @{
    title  = "Teste Gratuito de Dependência de IA – Entenda Seus Hábitos com IA"
    desc   = "Avaliação anônima com base científica sobre sobrecarga cognitiva, ansiedade por IA e esgotamento digital. Sem cadastro, sem coleta de dados."
    locale = "pt_PT"
  }
  ko = @{
    title  = "무료 AI 의존도 테스트 – 나의 AI 습관 이해하기"
    desc   = "인지적 외주화, AI 불안, 디지털 탈진에 대한 과학적 기반의 익명 평가. 가입 불필요, 데이터 수집 없음."
    locale = "ko_KR"
  }
  it = @{
    title  = "Test Gratuito sulla Dipendenza dall'IA – Comprendi le Tue Abitudini con l'IA"
    desc   = "Valutazione anonima su base scientifica del sovraccarico cognitivo, dell'ansia da IA e dell'esaurimento digitale. Senza registrazione, senza raccolta dati."
    locale = "it_IT"
  }
  hi = @{
    title  = "मुफ़्त AI निर्भरता परीक्षण – अपनी AI आदतों को समझें"
    desc   = "संज्ञानात्मक भार, AI चिंता और डिजिटल थकान का वैज्ञानिक आधार पर गुमनाम मूल्यांकन। कोई साइनअप नहीं, कोई डेटा संग्रह नहीं।"
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
