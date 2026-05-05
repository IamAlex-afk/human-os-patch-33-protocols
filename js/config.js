/* ====== Mind-OS Configuration ====== */

const CONFIG = {
  MAX_AXIS: 32,
  TOTAL_MAX: 96,
  FEAR_MAX: 16,
  POLL_API_URL: "https://script.google.com/macros/s/AKfycbxCL8wxUhHPGLQyhAhT7B5rBCSjKnRLq2oO7TApvFJlaYC8oVOwTNcrwR3wa5JeYmv18A/exec",
  STORAGE_KEYS: {
    TRACKER: 'mindos_tracker_v3',
    POLL_VOTED: 'mindos_poll_v3_voted',
    TEST_ANSWERS: 'mindos_test_answers',
    TEST_WIZARD: 'mindos_test_wizard',
    TEST_COMPLETED: 'mindos_test_completed',
    LANG: 'mindos_lang'
  },
  DEFAULT_LANG: 'en'
};

// Expose globally
window.CONFIG = CONFIG;
