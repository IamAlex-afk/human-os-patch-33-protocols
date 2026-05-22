/* ====== Mind-OS Storage Utilities ====== */

const storage = {
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
  },
  get(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; }
  },
  remove(k) {
    try { localStorage.removeItem(k); } catch(e) {}
  },
  // БЛОК ЗАЩИТЫ ОТ XSS: Фильтр опасных символов
  escape(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
    );
  }
};

window.storage = storage;
