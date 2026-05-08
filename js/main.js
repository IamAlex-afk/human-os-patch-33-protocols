/* ====== Mind-OS Main Orchestrator v3.0 ====== */
/* UTF-8. Initializes i18n, builds UI, handles language switching. */

(function() {
  'use strict';

  const { SUPPORTED_LANGS, DEFAULT_LANG, STORAGE_KEYS } = window.CONFIG || {};

  function detectLanguage() {
    var params = new URLSearchParams(window.location.search);
    var urlLang = params.get('lang');
    if (urlLang) return urlLang;

    var storedLang = null;
    try {
      storedLang = localStorage.getItem(STORAGE_KEYS ? STORAGE_KEYS.LANG : 'mindos_lang');
    } catch (_) {}
    if (storedLang) return storedLang;

    var browserLang = navigator.language || navigator.userLanguage || 'en';
    var shortLang = browserLang.split('-')[0].toLowerCase();
    var supported = (SUPPORTED_LANGS || []).map(function(l) { return l.code; });
    if (supported.indexOf(shortLang) !== -1) return shortLang;

    return DEFAULT_LANG || 'en';
  }

  function buildLangBar() {
    var bar = document.getElementById('langBar');
    if (!bar) return;
    bar.innerHTML = '';

    (SUPPORTED_LANGS || []).forEach(function(lang) {
      var btn = document.createElement('button');
      btn.className = 'lang-btn';
      btn.setAttribute('data-lang', lang.code);
      btn.setAttribute('aria-label', lang.name);
      btn.textContent = lang.flag + ' ' + lang.code.toUpperCase();
      btn.addEventListener('click', function() {
        switchLanguage(lang.code);
      });
      bar.appendChild(btn);
    });
  }

  function updateLangButtons(activeLang) {
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === activeLang);
    });
  }

  function switchLanguage(lang) {
    if (!window.I18n) return;
    I18n.setLang(lang);
    updateLangButtons(lang);
    updateAllText();
    rebuildDynamicContent();
    updateMetaTags(lang);
    updateAmazonLinks(lang);

    var url = new URL(window.location.href);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url.toString());
  }

  function updateAllText() {
    var t = window.I18n ? I18n.t : function(k) { return k; };

    var idMap = {
      'mainTitle': 'mainTitle', 'subheadText': 'subhead', 'infoTitle': 'infoTitle',
      'infoPara1': 'infoPara1', 'infoPara2': 'infoPara2', 'infoPara3': 'infoPara3',
      'infoDisclaimer': 'infoDisclaimer', 'axis1Title': 'axis1Title', 'axis1Desc': 'axis1Desc',
      'axis1Hint': 'axis1Hint', 'axis2Title': 'axis2Title', 'axis2Desc': 'axis2Desc',
      'axis2Hint': 'axis2Hint', 'axis3Title': 'axis3Title', 'axis3Desc': 'axis3Desc',
      'axis3Hint': 'axis3Hint', 'fearTitle': 'fearTitle', 'fearDesc': 'fearDesc',
      'fearHint': 'fearHint', 'trackerTitle': 'trackerTitle', 'trackerDesc': 'trackerDesc',
      'trackerLowLabel': 'trackerLowLabel', 'trackerMidLabel': 'trackerMidLabel',
      'trackerHighLabel': 'trackerHighLabel', 'saveTrackerEntry': 'saveBtn',
      'resetTrackerData': 'resetBtn', 'gameTitle': 'gameTitle', 'gameDesc': 'gameDesc',
      'gameBtnHuman': 'gameBtnHuman', 'gameBtnAI': 'gameBtnAI', 'gameNextBtn': 'gameNextBtn',
      'gameRestartBtn': 'gameRestartBtn', 'gameScoreLabel': 'gameScoreLabel',
      'pollTitle': 'pollTitle', 'pollDesc': 'pollDesc', 'pollFor': 'pollFor',
      'pollNeutral': 'pollNeutral', 'pollAgainst': 'pollAgainst',
      'submitPoll': 'submitPoll', 'pollResultsTitle': 'pollResultsTitle',
      'pollBridge': 'pollBridge', 'ctaFirstReview': 'ctaFirstReview',
      'ctaBarText': 'ctaBarText', 'footerText': 'footerText',
      'bookLabel': 'bookLabel', 'shareBtnText': 'shareBtn',
      'resetBtnText': 'resetTestBtn', 'shareButton': 'shareBtn',
      'resetTestButton': 'resetTestBtn', 'overallTitle': 'overallTitle',
      'overallProgressLabel': 'overallProgressLabel', 'overallProgressText': 'overallProgressText',
      'protocolsTitle': 'protocolsTitle', 'protocolsDesc': 'protocolsDesc',
      'faqTitle': 'faqTitle', 'aiFaqTitle': 'aiFaqTitle', 'howTitle': 'howTitle',
      'howText': 'howText', 'trustNoSignup': 'trustNoSignup',
      'trustLocal': 'trustLocal', 'trustAnonymous': 'trustAnonymous',
      'reviewProgressText': 'reviewProgressText', 'donateText': 'donateText',
      'installPwa': 'installPwa', 'pwaTitle': 'pwaTitle', 'pwaDesc': 'pwaDesc',
      'privacyTitle': 'privacyTitle', 'privacyDesc': 'privacyDesc',
      'clearDataBtn': 'clearDataBtn', 'autoExpireNote': 'autoExpireNote',
      'resetSession': 'resetSession', 'ctaText': 'ctaText'
    };

    Object.keys(idMap).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var key = idMap[id];
      var translated = t(key);
      if (translated && translated !== key) {
        if (key === 'infoPara1' || key === 'infoPara2' || key === 'infoPara3' ||
            key === 'ctaText' || key === 'pollBridge') {
          el.innerHTML = translated;
        } else {
          el.textContent = translated;
        }
      }
    });

    for (var i = 1; i <= 8; i++) {
      var qEl = document.getElementById('faqQ' + i);
      var aEl = document.getElementById('faqA' + i);
      if (qEl) qEl.textContent = t('faqQ' + i);
      if (aEl) aEl.innerHTML = t('faqA' + i);
    }

    var aiFaqIds = ['faqAiWhat', 'faqAiHistory', 'faqAiHowWork', 'faqAiTypes', 'faqAiDanger'];
    aiFaqIds.forEach(function(fid) {
      var qEl = document.getElementById(fid + 'Q');
      var aEl = document.getElementById(fid + 'A');
      if (qEl) qEl.textContent = t(fid + 'Q');
      if (aEl) aEl.innerHTML = t(fid + 'A');
    });
  }

  function rebuildDynamicContent() {
    var grid = document.getElementById('protocolGrid');
    if (!grid || !window.I18n) return;

    var protocols = I18n.raw('protocols') || [];
    if (!protocols.length) return;

    grid.innerHTML = '';
    protocols.forEach(function(p) {
      var card = document.createElement('div');
      card.className = 'protocol-card';
      card.innerHTML = '<span class="protocol-num">' + p.num + '</span>' +
        '<h4>' + p.title + '</h4><p>' + p.desc + '</p>';
      grid.appendChild(card);
    });

    if (window.Quiz) {
      Quiz.build('q1', 'q1Container', 'a1Progress', 'r1', CONFIG.MAX_AXIS);
      Quiz.build('q2', 'q2Container', 'a2Progress', 'r2', CONFIG.MAX_AXIS);
      Quiz.build('q3', 'q3Container', 'a3Progress', 'r3', CONFIG.MAX_AXIS);
      Quiz.build('fearQ', 'qFearContainer', 'fearProgress', 'fearResult', CONFIG.FEAR_MAX);
      Quiz.updateOverallProgress();
    }

    if (window.Tracker) Tracker.render();
    if (window.Game) Game.init();

    if (window.Quiz && Quiz.isComplete()) {
      showOverallResults();
    }
  }

  function showOverallResults() {
    if (!window.Quiz) return;
    var overall = Quiz.getOverallScore();
    var archetype = Quiz.getArchetype(overall.pct);
    var fear = Quiz.getFearScore();
    var t = window.I18n ? I18n.t : function(k, v) { return k; };

    var archEl = document.getElementById('overallArchetype');
    var pctEl = document.getElementById('overallPercentile');
    var adviceEl = document.getElementById('overallAdvice');
    var resetBtn = document.getElementById('resetTestButton');

    if (archEl) {
      archEl.innerHTML = '<h3>' + (archetype.name || '') + '</h3>' +
        '<p>' + (archetype.advice || '') + '</p>';
    }
    if (pctEl) {
      pctEl.textContent = t('overallPercentileLabel', { percentile: 100 - overall.pct });
    }
    if (adviceEl) {
      var html = '<p><strong>' + (archetype.name || '') + '</strong>: ' + (archetype.advice || '') + '</p>';
      if (fear.total > 0) {
        var fearData = I18n.raw('fearLevels');
        var flabel = '', fadvice = '';
        if (fearData) {
          if (fear.pct < 25 && fearData.low) { flabel = fearData.low.name; fadvice = fearData.low.advice; }
          else if (fear.pct < 50 && fearData.medium) { flabel = fearData.medium.name; fadvice = fearData.medium.advice; }
          else if (fear.pct < 75 && fearData.high) { flabel = fearData.high.name; fadvice = fearData.high.advice; }
          else if (fearData.veryHigh) { flabel = fearData.veryHigh.name; fadvice = fearData.veryHigh.advice; }
        }
        html += '<p><strong>' + t('fearResultTitle') + '</strong>: ' + flabel + ' (' + fear.total + '/' + fear.max + ')</p>';
        if (fadvice) html += '<p>' + fadvice + '</p>';
      }
      adviceEl.innerHTML = html;
    }
    if (resetBtn) resetBtn.style.display = 'inline-block';
  }

  function updateMetaTags(lang) {
    var html = document.documentElement;
    html.lang = lang;
    var titleEl = document.getElementById('dynamicTitle');
    if (titleEl && window.I18n) {
      var t = I18n.t('mainTitle');
      if (t && t !== 'mainTitle') document.title = t + ' | Mind-OS';
    }
    var ogLocale = document.getElementById('ogLocale');
    if (ogLocale) {
      var map = { en: 'en_US', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', es: 'es_ES',
        nl: 'nl_NL', pl: 'pl_PL', sv: 'sv_SE', ja: 'ja_JP', zh: 'zh_CN',
        pt: 'pt_PT', ar: 'ar_SA', he: 'he_IL', ko: 'ko_KR', tr: 'tr_TR', ru: 'ru_RU' };
      ogLocale.content = map[lang] || 'en_US';
    }
  }

  function updateAmazonLinks(lang) {
    var url = CONFIG.getAmazonUrl ? CONFIG.getAmazonUrl(lang) : 'https://www.amazon.com/dp/B0G35SBQR3';
    document.querySelectorAll('[data-amazon-link]').forEach(function(el) { el.href = url; });
    var bookLink = document.getElementById('bookLink');
    if (bookLink) {
      bookLink.href = url;
      bookLink.style.pointerEvents = '';
      bookLink.style.opacity = '';
      bookLink.removeAttribute('aria-disabled');
    }
    var ctaBarLink = document.getElementById('ctaBarLink');
    if (ctaBarLink) {
      ctaBarLink.href = url;
      ctaBarLink.style.pointerEvents = '';
      ctaBarLink.style.opacity = '';
      ctaBarLink.removeAttribute('aria-disabled');
    }
  }

  function initShare() {
    var btn = document.getElementById('shareButton');
    if (!btn) return;
    if (navigator.share) {
      btn.addEventListener('click', function() {
        var t = window.I18n ? I18n.t : function(k) { return k; };
        navigator.share({
          title: document.title,
          text: t('mainTitle'),
          url: window.location.href
        }).catch(function() {});
      });
    } else {
      btn.style.display = 'none';
    }
  }

  function initReset() {
    var btn = document.getElementById('resetTestButton');
    if (!btn) return;
    btn.addEventListener('click', function() {
      if (window.Quiz) Quiz.clearAll();
      window.location.reload();
    });
  }

  function initPrivacy() {
    document.querySelectorAll('[data-action="clear"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (window.Storage) Storage.clearAll();
        window.location.reload();
      });
    });
    var footerReset = document.getElementById('footerResetBtn');
    if (footerReset) {
      footerReset.addEventListener('click', function() {
        if (window.Storage) Storage.clearAll();
        window.location.reload();
      });
    }
  }

  function initFAQs() {
    document.querySelectorAll('.faq-question').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var answer = this.nextElementSibling;
        var expanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !expanded);
        if (answer) answer.style.display = expanded ? 'none' : 'block';
        var arrow = this.querySelector('.faq-arrow');
        if (arrow) arrow.textContent = expanded ? '▼' : '▲';
      });
    });
  }

  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
          .then(function() { console.log('Mind-OS: Engine Online'); })
          .catch(function(err) { console.log('Mind-OS: Engine Offline', err); });
      });
    }
  }

  async function init() {
    var lang = detectLanguage();
    if (window.I18n) {
      await I18n.init(lang);
    }
    buildLangBar();
    updateLangButtons(lang);
    updateAllText();
    rebuildDynamicContent();
    updateMetaTags(lang);
    updateAmazonLinks(lang);

    if (window.Tracker) Tracker.init();
    if (window.Game) Game.init();
    if (window.Poll) Poll.init();

    initShare();
    initReset();
    initPrivacy();
    initFAQs();
    initServiceWorker();

    window.addEventListener('mindos:langchange', function() {
      updateAllText();
      rebuildDynamicContent();
    });

    var ctaBar = document.getElementById('globalCTABar');
    if (ctaBar) ctaBar.style.display = 'flex';

    console.log('Mind-OS v3.0 initialized. Language:', lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
