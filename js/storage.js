/* ====== Mind-OS Storage Module v3.0 ====== */
/* UTF-8. Privacy-first localStorage with 7-day TTL. */

const Storage = (function() {
  'use strict';

  const PREFIX = 'mindos_';
  const EXPIRE_DAYS = 7;
  const MAX_AGE = EXPIRE_DAYS * 24 * 60 * 60 * 1000;

  function now() { return Date.now(); }

  function autoExpire() {
    const cutoff = now() - MAX_AGE;
    Object.keys(localStorage).forEach(function(key) {
      if (!key.startsWith(PREFIX)) return;
      try {
        var data = JSON.parse(localStorage.getItem(key));
        if (data && data._ts && data._ts < cutoff) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ _ts: now(), value: value }));
      return true;
    } catch (e) {
      console.warn('[Storage] Quota exceeded for key:', key);
      return false;
    }
  }

  function get(key) {
    try {
      var raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data._ts && (now() - data._ts > MAX_AGE)) {
        localStorage.removeItem(PREFIX + key);
        return null;
      }
      return data ? data.value : null;
    } catch (e) {
      return null;
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key);
  }

  function clearAll() {
    Object.keys(localStorage).forEach(function(key) {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  autoExpire();

  return {
    set: set,
    get: get,
    remove: remove,
    clearAll: clearAll,
    autoExpire: autoExpire
  };
})();

window.Storage = Storage;
