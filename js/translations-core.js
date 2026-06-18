window.translations = window.translations || {};

function getT(lang) {
  return new Proxy(translations[lang] || translations.en, {
    get: function(target, prop) {
      if (prop in target) return target[prop];
      return translations.en[prop];
    }
  });
}

window.translations = translations;
window.getT = getT;
