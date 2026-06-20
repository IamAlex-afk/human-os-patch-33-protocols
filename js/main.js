/* ====== Mind-OS Main Application ====== */
/* PATCH 2026-06-06:
   1. confirm() теперь использует t.resetTestConfirm вместо лейбла кнопки
   2. ctaText и pollPrivacy теперь создаются в DOM если не найдены в HTML
*/

(function() {
  const { DEFAULT_LANG, STORAGE_KEYS } = CONFIG;
  let currentLang = DEFAULT_LANG;

  // Флаг + название + код для каждого языка
  const LANG_META = {
    en: { flag: '🇬🇧', name: 'English',  code: 'EN' },
    ru: { flag: '🇷🇺', name: 'Русский',  code: 'RU' },
    es: { flag: '🇪🇸', name: 'Español',  code: 'ES' },
    de: { flag: '🇩🇪', name: 'Deutsch',  code: 'DE' },
    fr: { flag: '🇫🇷', name: 'Français', code: 'FR' },
    ja: { flag: '🇯🇵', name: '日本語',    code: 'JA' },
    vi: { flag: '🇻🇳', name: 'Tiếng Việt', code: 'VI' },
    th: { flag: '🇹🇭', name: 'ภาษาไทย',   code: 'TH' },
    pt: { flag: '🇵🇹', name: 'Português', code: 'PT' },
    ko: { flag: '🇰🇷', name: '한국어',     code: 'KO' },
    it: { flag: '🇮🇹', name: 'Italiano',  code: 'IT' },
    hi: { flag: '🇮🇳', name: 'हिन्दी',     code: 'HI' }
  };

  // Сообщения для мягкого баннера "похоже, вы предпочитаете другой язык" — на языке, который предлагается
  const LANG_SUGGEST = {
    en: { text: 'It looks like your browser is set to English.', link: 'View in English', close: 'Close' },
    ru: { text: 'Похоже, ваш браузер настроен на русский язык.', link: 'Открыть на русском', close: 'Закрыть' },
    es: { text: 'Parece que tu navegador está en español.', link: 'Ver en español', close: 'Cerrar' },
    de: { text: 'Ihr Browser scheint auf Deutsch eingestellt zu sein.', link: 'Auf Deutsch anzeigen', close: 'Schließen' },
    fr: { text: 'Il semble que votre navigateur soit en français.', link: 'Voir en français', close: 'Fermer' },
    ja: { text: 'お使いのブラウザは日本語に設定されているようです。', link: '日本語で表示', close: '閉じる' },
    vi: { text: 'Có vẻ trình duyệt của bạn đang dùng tiếng Việt.', link: 'Xem bằng tiếng Việt', close: 'Đóng' },
    th: { text: 'ดูเหมือนเบราว์เซอร์ของคุณตั้งค่าเป็นภาษาไทย', link: 'ดูเป็นภาษาไทย', close: 'ปิด' },
    pt: { text: 'Parece que o seu navegador está em português.', link: 'Ver em português', close: 'Fechar' },
    ko: { text: '브라우저 언어가 한국어로 설정된 것 같습니다.', link: '한국어로 보기', close: '닫기' },
    it: { text: 'Sembra che il tuo browser sia impostato in italiano.', link: 'Vedi in italiano', close: 'Chiudi' },
    hi: { text: 'लगता है आपका ब्राउज़र हिंदी में सेट है।', link: 'हिंदी में देखें', close: 'बंद करें' }
  };

  function initLangSuggestBanner() {
    const banner = document.getElementById('langSuggestBanner');
    if (!banner) return;
    const browserLang = (navigator.language || '').split('-')[0];
    const msg = LANG_SUGGEST[browserLang];
    if (!msg || browserLang === currentLang) return;
    if (storage.get(STORAGE_KEYS.LANG_BANNER_DISMISSED) === browserLang) return;

    document.getElementById('langSuggestText').textContent = msg.text;
    const link = document.getElementById('langSuggestLink');
    link.textContent = msg.link;
    link.href = window.SITE_LANG
      ? (browserLang === 'en' ? '../' : '../' + browserLang + '/')
      : (browserLang === 'en' ? './' : browserLang + '/');

    const closeBtn = document.getElementById('langSuggestClose');
    closeBtn.setAttribute('aria-label', msg.close);
    closeBtn.onclick = () => {
      banner.hidden = true;
      storage.set(STORAGE_KEYS.LANG_BANNER_DISMISSED, browserLang);
    };

    banner.hidden = false;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function renderProtocols(list) {
    const grid = document.getElementById('protocolGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const t = getT(currentLang);
    const word = (t.protocolWord || 'Protocol');
    list.forEach(p => {
      const item = document.createElement('div');
      item.className = 'protocol-item';
      const btn = document.createElement('button');
      btn.className = 'protocol-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = `<span class="protocol-num">${word} ${p.num}</span><span class="protocol-title">${escapeHtml(p.title)}</span><span class="protocol-arrow" aria-hidden="true">▼</span>`;
      const body = document.createElement('div');
      body.className = 'protocol-body';
      body.innerHTML = `<p>${escapeHtml(p.desc)}</p>`;
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.classList.toggle('active', !open);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
      });
      item.appendChild(btn);
      item.appendChild(body);
      grid.appendChild(item);
    });
  }

  function openLangDropdown() {
    const dd = document.getElementById('langDropdown');
    const tg = document.getElementById('langToggle');
    const sel = document.getElementById('langSelector');
    if (dd) dd.removeAttribute('hidden');
    if (tg) tg.setAttribute('aria-expanded', 'true');
    if (sel) sel.classList.add('open');
  }

  function closeLangDropdown() {
    const dd = document.getElementById('langDropdown');
    const tg = document.getElementById('langToggle');
    const sel = document.getElementById('langSelector');
    if (dd) dd.setAttribute('hidden', '');
    if (tg) tg.setAttribute('aria-expanded', 'false');
    if (sel) sel.classList.remove('open');
  }

  function initLangBar() {
    const toggle = document.getElementById('langToggle');
    const dropdown = document.getElementById('langDropdown');
    if (!toggle || !dropdown) return;

    dropdown.innerHTML = '';
    Object.keys(LANG_META).forEach(l => {
      const meta = LANG_META[l] || { flag: '', name: translations[l].langName, code: l.toUpperCase() };
      const item = document.createElement('button');
      item.className = `lang-option lang-btn ${l === currentLang ? 'active' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('data-lang', l);
      item.setAttribute('aria-selected', l === currentLang ? 'true' : 'false');
      item.innerHTML = `<span class="lang-flag" aria-hidden="true">${meta.flag}</span><span class="lang-name">${meta.name}</span>`;
      item.onclick = () => {
        if (window.SITE_LANG) {
          window.location.href = l === 'en' ? '../' : '../' + l + '/';
        } else if (l === 'en' || translations[l]) {
          applyLanguage(l);
          closeLangDropdown();
        } else {
          // translations/<l>.js isn't loaded on this page (only en.js is) — navigate instead
          window.location.href = l + '/' + window.location.hash;
        }
      };
      dropdown.appendChild(item);
    });

    toggle.onclick = (e) => {
      e.stopPropagation();
      if (dropdown.hasAttribute('hidden')) openLangDropdown();
      else closeLangDropdown();
    };

    // Закрытие по клику вне окна
    document.addEventListener('click', (e) => {
      const sel = document.getElementById('langSelector');
      if (sel && !sel.contains(e.target)) closeLangDropdown();
    });

    // Закрытие по Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLangDropdown();
    });
  }

  /* ПАТЧ: гарантируем существование ctaText и pollPrivacy в DOM */
  function ensureDynamicElements() {
    /* ctaText — вставляем в .poll-block если нет */
    if (!document.getElementById('ctaText')) {
      const pollBlock = document.querySelector('.poll-block');
      if (pollBlock) {
        const el = document.createElement('p');
        el.id = 'ctaText';
        el.style.cssText = 'font-size:0.95rem;color:var(--text-dim);margin-top:1rem;';
        pollBlock.appendChild(el);
      }
    }
    /* pollPrivacy — вставляем в pollResults если нет */
    if (!document.querySelector('[data-i18n="pollPrivacy"]')) {
      const pollResults = document.getElementById('pollResults');
      if (pollResults) {
        const el = document.createElement('p');
        el.setAttribute('data-i18n', 'pollPrivacy');
        el.style.cssText = 'font-size:0.8rem;color:var(--text-dim);margin-top:0.8rem;opacity:0.75;';
        pollResults.appendChild(el);
      }
    }
  }

  function applyLanguage(lang) {
    const t = getT(lang);
    currentLang = lang;

    storage.set(STORAGE_KEYS.LANG, lang);

    if (!window.SITE_LANG) {
      const url = new URL(window.location);
      if (lang === 'en') url.searchParams.delete('lang');
      else url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url);
      const _canon = document.getElementById('dynamicCanonical');
      if (_canon) {
        const _base = 'https://iamalex-afk.github.io/human-os-patch-33-protocols/';
        _canon.href = lang === 'en' ? _base : _base + lang + '/';
      }
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      if (btn.hasAttribute('aria-selected')) btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    // Обновляем код языка на кнопке-планете
    const _code = document.getElementById('langCurrentCode');
    if (_code) _code.textContent = (LANG_META[lang] || { code: lang.toUpperCase() }).code;

    document.documentElement.setAttribute('lang', lang);

    const ut = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.textContent = val; };
    const uh = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.innerHTML = val; };

    document.title = `${t.mainTitle} | Mind-OS`;
    const descMeta = document.getElementById('dynamicDescription');
    if (descMeta) descMeta.content = t.subhead;
    const ogTitle = document.getElementById('dynamicOgTitle');
    if (ogTitle) ogTitle.content = t.mainTitle;
    const ogDesc = document.getElementById('dynamicOgDescription');
    if (ogDesc) ogDesc.content = t.subhead;
    const ogUrl = document.getElementById('dynamicOgUrl');
    if (ogUrl && !window.SITE_LANG) ogUrl.content = lang === 'en'
      ? 'https://iamalex-afk.github.io/human-os-patch-33-protocols/'
      : `https://iamalex-afk.github.io/human-os-patch-33-protocols/${lang}/`;

    ut('navAssessment', t.navAssessment);
    ut('navTracker', t.navTracker);
    ut('navGame', t.navGame);
    ut('navPoll', t.navPoll);
    ut('navProtocols', t.navProtocols);
    ut('navFaq', t.navFaq);
    ut('pwaInstallText', t.installApp);
    ut('mainTitle', t.mainTitle);
    ut('subheadText', t.subhead);
    ut('infoTitle', t.infoTitle);
    ut('infoPara1', t.infoPara1);
    uh('infoPara2', t.infoPara2);
    uh('infoPara3', t.infoPara3);
    ut('infoDisclaimer', t.infoDisclaimer);

    ['1', '2', '3'].forEach(i => {
      ut(`axis${i}Title`, t[`axis${i}Title`]);
      ut(`axis${i}Desc`, t[`axis${i}Desc`]);
      ut(`axis${i}Hint`, t[`axis${i}Hint`]);
    });

    ut('fearTitle', t.fearTitle);
    ut('fearDesc', t.fearDesc);
    ut('fearHint', t.fearHint);

    ut('trackerTitle', t.trackerTitle);
    ut('trackerDesc', t.trackerDesc);
    ut('trackerLowLabel', t.trackerLowLabel);
    ut('trackerMidLabel', t.trackerMidLabel);
    ut('trackerHighLabel', t.trackerHighLabel);
    ut('saveTrackerEntry', t.saveBtn);
    ut('resetTrackerData', t.resetBtn);

    ut('gameTitle', t.gameTitle);
    ut('gameDesc', t.gameDesc);
    ut('gameBtnHuman', t.gameBtnHuman);
    ut('gameBtnAI', t.gameBtnAI);
    ut('gameNextBtn', t.gameNextBtn);
    ut('gameRestartBtn', t.gameRestartBtn);
    ut('gameScoreLabel', t.gameScoreLabel);

    ut('pollTitle', t.pollTitle);
    ut('pollDesc', t.pollDesc);
    ut('pollFor', t.pollFor);
    ut('pollNeutral', t.pollNeutral);
    ut('pollAgainst', t.pollAgainst);
    ut('submitPoll', t.submitPoll);
    ut('pollResultsTitle', t.pollResultsTitle);
    uh('pollBridge', t.pollBridge);
    ut('pollInviteText', t.pollInviteText);

    /* ПАТЧ: ctaText и pollPrivacy — гарантированно обновляются */
    ut('ctaText', t.ctaText);
    const pollPrivacyEl = document.querySelector('[data-i18n="pollPrivacy"]');
    if (pollPrivacyEl) {
      const fallback = lang === 'ru'
        ? 'Данные хранятся только в вашем браузере и никуда не передаются.'
        : 'Data is stored locally in your browser and is not transmitted anywhere.';
      pollPrivacyEl.textContent = t.pollPrivacy || fallback;
    }

    ut('ctaBarText', t.ctaBarText);
    ut('footerText', t.footerText);
    ut('protocolsTitle', t.protocolsTitle);
    ut('protocolsDesc', t.protocolsDesc);
    ut('donateText', t.donateText);
    ut('shareBtnText', t.shareBtn);
    ut('downloadCardText', t.downloadCardText);
    ut('resetBtnText', t.resetTestBtn);  // FIX: кнопка перезапуска была всегда на английском
    ut('howTitle', t.howTitle);
    ut('howText', t.howText);
    ut('trustNoSignup', t.trustNoSignup);
    ut('trustLocal', t.trustLocal);
    ut('trustAnonymous', t.trustAnonymous);
    ut('overallTitle', t.overallTitle);
    ut('spectrumLow', t.spectrumLow);
    ut('spectrumMid', t.spectrumMid);
    ut('spectrumHigh', t.spectrumHigh);
    ut('resultDisclaimer', t.resultDisclaimer);
    ut('sharedBanner', t.sharedBannerText);

    const bLink = document.getElementById('bookLink');
    if (bLink) { bLink.href = t.bookUrl || '#'; bLink.textContent = t.bookLabel; }
    const cLink = document.getElementById('ctaBarLink');
    if (cLink) { cLink.href = t.bookUrl || '#'; }

    ut('ecosystemTitle', t.ecosystemTitle);
    ut('ecosystemSubtitle', t.ecosystemSubtitle);
    ut('ecoCardPreprint', t.ecoCardPreprint);
    ut('ecoCardDataset', t.ecoCardDataset);
    ut('ecoCardTechProfile', t.ecoCardTechProfile);
    ut('ecoCardAuthorProfile', t.ecoCardAuthorProfile);
    ut('ecoLink1', t.ecoLinkDOI);
    ut('ecoLink2', t.ecoLinkHBR);
    ut('ecoLink3', t.ecoLinkDOI);
    ut('ecoLink4', t.ecoLinkZenodo);
    ut('ecoLink5', t.ecoLinkHF);
    ut('ecoLink6', t.ecoLinkDev);
    ut('ecoLink7', t.ecoLinkORCID);

    ut('faqTitle', t.faqTitle);
    for (let i = 1; i <= 8; i++) {
      ut(`faqQ${i}`, t[`faqQ${i}`] || '');
      uh(`faqA${i}`, t[`faqA${i}`] || '');
    }

    ut('aiFaqTitle', t.aiFaqTitle);
    ut('faqAiWhatQ', t.faqAiWhatQ);    uh('faqAiWhatA', t.faqAiWhatA);
    ut('faqAiHistoryQ', t.faqAiHistoryQ); uh('faqAiHistoryA', t.faqAiHistoryA);
    ut('faqAiHowWorkQ', t.faqAiHowWorkQ); uh('faqAiHowWorkA', t.faqAiHowWorkA);
    ut('faqAiTypesQ', t.faqAiTypesQ);    uh('faqAiTypesA', t.faqAiTypesA);
    ut('faqAiDangerQ', t.faqAiDangerQ);  uh('faqAiDangerA', t.faqAiDangerA);

    if (window.Quiz) Quiz.setLang(lang);
    if (window.Tracker) Tracker.setLang(lang);
    if (window.Game) Game.setLang(lang);
    if (window.Poll) Poll.setLang(lang);

    if (window.Quiz) {
      if (!Quiz.COMPLETED_AXES.a1) Quiz.renderWizard('q1Container', t.q1, 'a1', t);
      if (!Quiz.COMPLETED_AXES.a2) Quiz.renderWizard('q2Container', t.q2, 'a2', t);
      if (!Quiz.COMPLETED_AXES.a3) Quiz.renderWizard('q3Container', t.q3, 'a3', t);
      Quiz.renderWizard('qFearContainer', t.fearQ, 'fear', t);

      if (Quiz.COMPLETED_AXES.a1) {
        const r1 = document.getElementById('r1');
        if (r1) { r1.style.display = 'block'; document.getElementById('q1Container').style.display = 'none'; }
      }
      if (Quiz.COMPLETED_AXES.a2) {
        const r2 = document.getElementById('r2');
        if (r2) { r2.style.display = 'block'; document.getElementById('q2Container').style.display = 'none'; }
      }
      if (Quiz.COMPLETED_AXES.a3) {
        const r3 = document.getElementById('r3');
        if (r3) { r3.style.display = 'block'; document.getElementById('q3Container').style.display = 'none'; }
      }
    }

    renderProtocols(t.protocols);
    if (window.Tracker) Tracker.updateUI();
    if (window.Game) Game.loadQuestion();
    if (window.Poll) Poll.syncUI();
    if (window.Quiz) Quiz.updateOverallProgress();
  }

  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => {
        const active = q.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-question').forEach(el => {
          el.setAttribute('aria-expanded', 'false');
          el.classList.remove('active');
        });
        if (!active) {
          q.setAttribute('aria-expanded', 'true');
          q.classList.add('active');
        }
      });
      q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.Quiz) Quiz.loadPersisted();

    /* ПАТЧ: создаём динамические элементы до applyLanguage */
    ensureDynamicElements();

    initLangBar();

    // Открыт по ссылке с результатом? Показываем его
    if (window.Quiz && Quiz.checkSharedResult) { try { Quiz.checkSharedResult(); } catch(e) {} }

    // Клавиши 1-5 для ответа на текущий вопрос теста
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = parseInt(e.key, 10);
      if (k >= 1 && k <= 5) {
        // Находим видимый активный шаг теста
        const steps = document.querySelectorAll('.question-step.active');
        for (const step of steps) {
          if (step.offsetParent === null) continue; // невидим
          const inputs = step.querySelectorAll('input[type="radio"]');
          if (inputs[k-1]) {
            inputs[k-1].checked = true;
            inputs[k-1].dispatchEvent(new Event('change', { bubbles: true }));
            e.preventDefault();
            break;
          }
        }
      }
    });

    const savedLang = storage.get(STORAGE_KEYS.LANG);
    const urlParams = new URLSearchParams(window.location.search);
    const lang = window.SITE_LANG || urlParams.get('lang') || savedLang || DEFAULT_LANG;
    if (!window.SITE_LANG && lang !== 'en' && !translations[lang]) {
      // translations/<lang>.js isn't loaded on this (English) page — navigate to the real page instead
      window.location.href = lang + '/' + window.location.hash;
      return;
    }
    applyLanguage(lang);
    initLangSuggestBanner();

    const tSlider = document.getElementById('trackerScore');
    if (tSlider) {
      tSlider.addEventListener('input', (e) => {
        document.getElementById('trackerValueDisplay').textContent = e.target.value;
      });
    }

    if (window.Tracker) {
      document.getElementById('saveTrackerEntry')?.addEventListener('click', Tracker.saveEntry);
      document.getElementById('resetTrackerData')?.addEventListener('click', Tracker.resetData);
    }

    if (window.Game) {
      document.getElementById('gameBtnHuman')?.addEventListener('click', () => Game.handleGuess(false));
      document.getElementById('gameBtnAI')?.addEventListener('click', () => Game.handleGuess(true));
      document.getElementById('gameNextBtn')?.addEventListener('click', () => Game.next());
      document.getElementById('gameRestartBtn')?.addEventListener('click', () => Game.restart());
    }

    if (window.Poll) {
      document.getElementById('submitPoll')?.addEventListener('click', () => Poll.submit());
      document.getElementById('pollInviteBtn')?.addEventListener('click', () => {
        const t = getT(currentLang);
        const base = window.location.origin + window.location.pathname.replace(/\/(ru|es|de|fr|ja|vi|th|pt|ko|it|hi)\/?$/, '/');
        const pollUrl = base + '#poll-section';
        const text = (t.pollInviteShareText || 'How do you feel about AI? Vote anonymously in the global Mind-OS poll:');
        if (navigator.share) {
          navigator.share({ title: 'Mind-OS Global AI Poll', text, url: pollUrl }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(text + ' ' + pollUrl).then(() => {
            alert(t.urlCopied || 'Link copied!');
          }).catch(() => {});
        }
      });
    }

    initFAQ();

    document.getElementById('shareButton')?.addEventListener('click', () => {
      const t = getT(currentLang);
      const archEl = document.getElementById('overallArchetype');
      const archetype = archEl && archEl.textContent ? archEl.textContent.trim() : '';
      let shareText = t.subhead;
      if (archetype && t.shareResultText) {
        shareText = t.shareResultText.replace('{archetype}', archetype);
      }
      if (navigator.share) {
        const shareUrl = (window.Quiz && Quiz.buildShareURL) ? Quiz.buildShareURL() : window.location.href;
        navigator.share({ title: document.title, text: shareText, url: shareUrl }).catch(() => {});
      } else if (navigator.clipboard) {
        const shareUrl = (window.Quiz && Quiz.buildShareURL) ? Quiz.buildShareURL() : window.location.href;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert(t.urlCopied || 'Link copied!');
        }).catch(() => {});
      }
    });

    /* ПАТЧ: исправлен диалог сброса — использует корректный вопрос, не лейбл кнопки */
    document.getElementById('resetTestButton')?.addEventListener('click', () => {
      const t = getT(currentLang);
      const msg = t.resetTestConfirm || 'Are you sure you want to restart the assessment?';
      if (confirm(msg)) {
        if (window.Quiz) Quiz.resetTest();
      }
    });

    // Секции для scroll-spy (подсветка активного пункта навигации)
    const navMap = [
      { nav: 'navAssessment', sec: 'test-section' },
      { nav: 'navTracker',    sec: 'tracker-section' },
      { nav: 'navGame',       sec: 'game-section' },
      { nav: 'navPoll',       sec: 'poll-section' },
      { nav: 'navProtocols',  sec: 'protocols-section' },
      { nav: 'navFaq',        sec: 'faq-section' }
    ];

    let _scrollTick = false;
    window.addEventListener('scroll', () => {
      if (_scrollTick) return;
      _scrollTick = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;

        // 1. Плавающая CTA-панель
        const bar = document.getElementById('globalCTABar');
        if (bar) bar.classList.toggle('visible', y > 800);

        // 2. Кнопка "наверх"
        const topBtn = document.getElementById('scrollTopBtn');
        if (topBtn) {
          if (y > 600) topBtn.removeAttribute('hidden');
          else topBtn.setAttribute('hidden', '');
        }

        // 3. Индикатор прогресса чтения
        const prog = document.getElementById('readingProgress');
        if (prog) {
          const h = document.documentElement.scrollHeight - window.innerHeight;
          prog.style.width = h > 0 ? (y / h * 100) + '%' : '0%';
        }

        // 4. Scroll-spy: подсветка активной секции
        let activeNav = null;
        for (const m of navMap) {
          const sec = document.getElementById(m.sec);
          if (sec && sec.getBoundingClientRect().top <= 120) activeNav = m.nav;
        }
        navMap.forEach(m => {
          const link = document.getElementById(m.nav);
          if (link) link.classList.toggle('nav-active', m.nav === activeNav);
        });

        _scrollTick = false;
      });
    }, { passive: true });

    // Кнопка "наверх" — плавный возврат
    const _topBtn = document.getElementById('scrollTopBtn');
    if (_topBtn) {
      _topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // PWA install prompt
    let _pwaPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      _pwaPrompt = e;
      const li = document.getElementById('pwaInstallLi');
      if (li) li.style.display = '';
    });
    document.getElementById('pwaInstallBtn')?.addEventListener('click', () => {
      if (!_pwaPrompt) return;
      _pwaPrompt.prompt();
      _pwaPrompt.userChoice.then(() => {
        _pwaPrompt = null;
        const li = document.getElementById('pwaInstallLi');
        if (li) li.style.display = 'none';
      });
    });
    window.addEventListener('appinstalled', () => {
      _pwaPrompt = null;
      const li = document.getElementById('pwaInstallLi');
      if (li) li.style.display = 'none';
    });
  });
})();
