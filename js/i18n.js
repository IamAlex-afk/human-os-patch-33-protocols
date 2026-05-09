/* ====== Mind-OS i18n Engine v3.0 ====== */
/* UTF-8. Lazy-loads translations.json. Fallbacks to en. */

const I18n = (function() {
  'use strict';

  const { SUPPORTED_LANGS, DEFAULT_LANG, RTL_LANGS, STORAGE_KEYS } = window.CONFIG || {};
  const TRANSLATIONS_PATH = './locales/translations.json';

  let currentLang = DEFAULT_LANG || 'en';
  let fallbackLang = DEFAULT_LANG || 'en';
  let translationCache = {};
  let loadPromise = null;
  let isReady = false;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  }

  function getNested(obj, path) {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let val = obj;
    for (const p of parts) {
      if (val == null || typeof val !== 'object') return undefined;
      val = val[p];
    }
    return val;
  }

  function interpolate(template, vars) {
    if (!vars || typeof template !== 'string') return template;
    return template.replace(/\{(\w+)\}/g, (_, key) => {
      const val = vars[key];
      return val !== undefined ? escapeHtml(String(val)) : `{${key}}`;
    });
  }

  async function loadAll() {
    if (isReady) return translationCache;
    if (loadPromise) return loadPromise;

    try {
      const cached = sessionStorage.getItem('mindos_i18n_cache');
      const cachedTs = sessionStorage.getItem('mindos_i18n_ts');
      if (cached && cachedTs && (Date.now() - parseInt(cachedTs, 10)) < 3600000) {
        translationCache = JSON.parse(cached);
        isReady = true;
        return translationCache;
      }
    } catch (_) {}

    loadPromise = fetch(TRANSLATIONS_PATH)
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        translationCache = data || {};
        isReady = true;
        try {
          sessionStorage.setItem('mindos_i18n_cache', JSON.stringify(translationCache));
          sessionStorage.setItem('mindos_i18n_ts', String(Date.now()));
        } catch (_) {}
        return translationCache;
      })
      .catch(() => {
        translationCache = {};
        isReady = true;
        return translationCache;
      });

    return loadPromise;
  }

  function ensureLoaded() {
    if (!isReady) console.warn('[I18n] Translation accessed before load.');
  }

  function t(key, vars) {
    ensureLoaded();
    let val = translationCache[currentLang]?.[key];
    if (val === undefined && key.includes('.')) val = getNested(translationCache[currentLang], key);
    if (val === undefined) {
      val = translationCache[fallbackLang]?.[key];
      if (val === undefined && key.includes('.')) val = getNested(translationCache[fallbackLang], key);
    }
    if (val === undefined) {
      console.warn(`[I18n] Missing key: "${key}" for lang: ${currentLang}`);
      return key;
    }
    if (typeof val !== 'string') return val;
    return interpolate(val, vars);
  }

  function raw(key) {
    ensureLoaded();
    let val = translationCache[currentLang]?.[key];
    if (val === undefined && key.includes('.')) val = getNested(translationCache[currentLang], key);
    if (val === undefined) {
      val = translationCache[fallbackLang]?.[key];
      if (val === undefined && key.includes('.')) val = getNested(translationCache[fallbackLang], key);
    }
    return val;
  }

  function getQuestions(axisPrefix) {
    const questions = raw(axisPrefix);
    return Array.isArray(questions) ? questions : [];
  }

  function getReverseKeys(axisPrefix) {
    const rk = raw('reverseKeys');
    return (rk && rk[axisPrefix]) || [];
  }

  function getOptions() {
    const opts = raw('options');
    return Array.isArray(opts) ? opts : ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  }

  function setLang(lang) {
    const supported = (SUPPORTED_LANGS || []).map(l => l.code);
    if (!supported.includes(lang)) {
      console.warn(`[I18n] Unsupported language: ${lang}, falling back to ${DEFAULT_LANG}`);
      lang = DEFAULT_LANG;
    }
    currentLang = lang;
    const html = document.documentElement;
    const shouldBeRTL = RTL_LANGS.includes(lang);
    html.dir = shouldBeRTL ? 'rtl' : 'ltr';
    html.lang = lang;
    html.classList.toggle('rtl', shouldBeRTL);
    try {
      localStorage.setItem(STORAGE_KEYS?.LANG || 'mindos_lang', lang);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('mindos:langchange', { detail: { lang, rtl: shouldBeRTL } }));
    return lang;
  }

  function getLang() { return currentLang; }
  function isRTL() { return RTL_LANGS.includes(currentLang); }

  async function init(preferredLang) {
    await loadAll();
    const lang = setLang(preferredLang || DEFAULT_LANG);
    return lang;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function load(callback) {
    loadAll().then(function() { if (callback) callback(true); })
             .catch(function(err) { console.warn('[I18n] Load failed:', err); if (callback) callback(false); });
  }

  return {
    init, setLang, getLang, t, raw, getQuestions, getReverseKeys, getOptions, isRTL, prefersReducedMotion,
    load, loadAll,
    _cache: () => translationCache
  };
})();

window.I18n = I18n;
