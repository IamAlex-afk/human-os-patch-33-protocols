/* ====== Mind-OS Configuration v3.0 ====== */
/* UTF-8. 16-language support. Amazon-optimized. */

const CONFIG = {
  MAX_AXIS: 32,
  TOTAL_MAX: 96,
  FEAR_MAX: 16,

  POLL_API_URL: 'https://script.google.com/macros/s/AKfycbxze15u0M-8LrpJuwSVMAIbAGovp_cB9auqW6rsDY_lr_ZM5iiMjSr2__7RzJcD3p6S7A/exec',

  STORAGE_KEYS: {
    TRACKER:      'mindos_tracker_v3',
    POLL_VOTED:   'mindos_poll_v3_voted',
    TEST_ANSWERS: 'mindos_test_answers',
    TEST_WIZARD:  'mindos_test_wizard',
    TEST_COMPLETED:'mindos_test_completed',
    LANG:         'mindos_lang'
  },

  DEFAULT_LANG: 'en',
  RTL_LANGS: ['ar', 'he'],

  SUPPORTED_LANGS: [
    { code: 'en', name: 'English',    flag: '🇬🇧', amazon: 'https://www.amazon.com/dp/B0G35SBQR3' },
    { code: 'de', name: 'Deutsch',    flag: '🇩🇪', amazon: 'https://www.amazon.de/dp/B0G35SBQR3' },
    { code: 'fr', name: 'Français',   flag: '🇫🇷', amazon: 'https://www.amazon.fr/dp/B0G35SBQR3' },
    { code: 'it', name: 'Italiano',   flag: '🇮🇹', amazon: 'https://www.amazon.it/dp/B0G35SBQR3' },
    { code: 'es', name: 'Español',    flag: '🇪🇸', amazon: 'https://www.amazon.es/dp/B0G35SBQR3' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱', amazon: 'https://www.amazon.nl/dp/B0G35SBQR3' },
    { code: 'pl', name: 'Polski',     flag: '🇵🇱', amazon: 'https://www.amazon.pl/dp/B0G35SBQR3' },
    { code: 'sv', name: 'Svenska',    flag: '🇸🇪', amazon: 'https://www.amazon.se/dp/B0G35SBQR3' },
    { code: 'ja', name: '日本語',      flag: '🇯🇵', amazon: 'https://www.amazon.co.jp/dp/B0G35SBQR3' },
    { code: 'zh', name: '中文',       flag: '🇨🇳', amazon: 'https://www.amazon.cn/dp/B0G35SBQR3' },
    { code: 'pt', name: 'Português',  flag: '🇵🇹', amazon: 'https://www.amazon.pt/dp/B0G35SBQR3' },
    { code: 'ar', name: 'العربية',    flag: '🇸🇦', amazon: 'https://www.amazon.sa/dp/B0G35SBQR3' },
    { code: 'he', name: 'עברית',      flag: '🇮🇱', amazon: 'https://www.amazon.com/dp/B0G35SBQR3' },
    { code: 'ko', name: '한국어',      flag: '🇰🇷', amazon: 'https://www.amazon.co.kr/dp/B0G35SBQR3' },
    { code: 'tr', name: 'Türkçe',     flag: '🇹🇷', amazon: 'https://www.amazon.com.tr/dp/B0G35SBQR3' },
    { code: 'ru', name: 'Русский',    flag: '🇷🇺', amazon: 'https://www.litres.ru/author/aleksei-bitkin/' }
  ],

  getAmazonUrl(lang) {
    const found = this.SUPPORTED_LANGS.find(l => l.code === lang);
    return (found && found.amazon) ? found.amazon : this.SUPPORTED_LANGS[0].amazon;
  },

  getLangName(lang) {
    const found = this.SUPPORTED_LANGS.find(l => l.code === lang);
    return found ? found.name : lang;
  }
};

window.CONFIG = CONFIG;
