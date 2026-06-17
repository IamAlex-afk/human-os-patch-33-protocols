/* ====== Mind-OS Storage Utilities ====== */

const storage = {
  set(k, v) {
    if (k === undefined || k === null) { console.warn('[storage] undefined key rejected'); return; }
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
  },
  get(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; }
  },
  remove(k) {
    try { localStorage.removeItem(k); } catch(e) {}
  }
};

window.storage = storage;
