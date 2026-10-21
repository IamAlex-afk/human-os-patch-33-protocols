/* ====== Mind-OS Configuration ====== */
const CONFIG = {
  MAX_AXIS: 32,
  TOTAL_MAX: 96,
  FEAR_MAX: 16,

  STORAGE_KEYS: {
    TEST_ANSWERS:   'mindos_test_answers',
    TEST_WIZARD:    'mindos_test_wizard',
    TEST_COMPLETED: 'mindos_test_completed',
    LANG:           'mindos_lang',
    LANG_BANNER_DISMISSED: 'mindos_lang_banner_dismissed'
  },

  DEFAULT_LANG: 'en'
};

window.CONFIG = CONFIG;
