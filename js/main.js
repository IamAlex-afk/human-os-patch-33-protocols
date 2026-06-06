/* ====== Mind-OS Main Application ====== */
/* PATCH 2026-06-06:
   1. confirm() теперь использует t.resetTestConfirm вместо лейбла кнопки
   2. ctaText и pollPrivacy теперь создаются в DOM если не найдены в HTML
*/

(function() {
  const { DEFAULT_LANG, STORAGE_KEYS } = CONFIG;
  let currentLang = DEFAULT_LANG;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function renderProtocols(list) {
    const grid = document.getElementById('protocolGrid');
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'protocol-card';
      card.innerHTML = `<div class="protocol-num">Protocol ${p.num}</div><div class="protocol-title">${escapeHtml(p.title)}</div><div class="protocol-desc">${escapeHtml(p.desc)}</div>`;
      grid.appendChild(card);
    });
  }

  function initLangBar() {
    const bar = document.getElementById('langBar');
    if (!bar) return;
    bar.innerHTML = '';
    Object.keys(translations).forEach(l => {
      const btn = document.createElement('button');
      btn.className = `lang-btn ${l === currentLang ? 'active' : ''}`;
      btn.textContent = translations[l].langName;
      btn.onclick = () => applyLanguage(l);
      bar.appendChild(btn);
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

    const url = new URL(window.location);
    if (lang === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', lang);
    window.history.replaceState(null, '', url);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === t.langName);
    });

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

    /* ПАТЧ: ctaText и pollPrivacy — гарантированно обновляются */
    ut('ctaText', t.ctaText);
    const pollPrivacyEl = document.querySelector('[data-i18n="pollPrivacy"]');
    if (pollPrivacyEl) {
      const fallback = lang === 'ru'
        ? 'Данные хранятся только в вашем браузере и никуда не передаются.'
        : 'Data is stored locally in your browser and is not transmitted anywhere.';
      pollPrivacyEl.textContent = t.pollPrivacy || fallback;
    }

    ut('ctaFirstReview', t.ctaFirstReview);
    ut('ctaBarText', t.ctaBarText);
    ut('footerText', t.footerText);
    ut('protocolsTitle', t.protocolsTitle);
    ut('protocolsDesc', t.protocolsDesc);
    ut('donateText', t.donateText);
    ut('shareBtnText', t.shareBtn);
    ut('howTitle', t.howTitle);
    ut('howText', t.howText);
    ut('trustNoSignup', t.trustNoSignup);
    ut('trustLocal', t.trustLocal);
    ut('trustAnonymous', t.trustAnonymous);
    ut('overallTitle', t.overallTitle);
    ut('reviewProgressText', t.reviewProgressText);

    const bLink = document.getElementById('bookLink');
    if (bLink) { bLink.href = t.bookUrl || '#'; bLink.textContent = t.bookLabel; }
    const cLink = document.getElementById('ctaBarLink');
    if (cLink) { cLink.href = t.bookUrl || '#'; }

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

    const savedLang = storage.get(STORAGE_KEYS.LANG);
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || savedLang || DEFAULT_LANG;
    applyLanguage(lang);

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
    }

    initFAQ();

    document.getElementById('shareButton')?.addEventListener('click', () => {
      const t = getT(currentLang);
      if (navigator.share) {
        navigator.share({ title: document.title, text: t.subhead, url: window.location.href }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('URL copied!');
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

    window.addEventListener('scroll', () => {
      const bar = document.getElementById('globalCTABar');
      if (bar) {
        if (window.scrollY > 800) bar.classList.add('visible');
        else bar.classList.remove('visible');
      }
    });
  });
})();
