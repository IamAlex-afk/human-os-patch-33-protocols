/* ====== Mind-OS Game Module v3.0 ====== */
/* UTF-8. "AI or Human?" game. i18n-aware. */

const Game = (function() {
  'use strict';

  let texts = [];
  let order = [];
  let idx = 0;
  let score = 0;
  let total = 0;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function loadTexts() {
    var t = window.I18n ? I18n.raw('gameTexts') : null;
    if (t && Array.isArray(t) && t.length >= 5) {
      texts = t;
    } else {
      texts = [
        { text: 'The sun dipped below the horizon, painting the sky in shades of orange.', isAI: true },
        { text: "I couldn't believe my eyes. We had actually won after brutal practice.", isAI: false },
        { text: 'In quantum mechanics, particles exist in multiple states simultaneously.', isAI: true },
        { text: "Made the best lasagna. Secret ingredient? Way too much garlic.", isAI: false },
        { text: "As an AI, I don't have feelings, but I understand context.", isAI: true }
      ];
    }
  }

  function render() {
    var qEl = document.getElementById('gameQuestion');
    var fbEl = document.getElementById('gameFeedback');
    var humanBtn = document.getElementById('gameBtnHuman');
    var aiBtn = document.getElementById('gameBtnAI');
    var nextBtn = document.getElementById('gameNextBtn');
    var restartBtn = document.getElementById('gameRestartBtn');
    var scoreEl = document.getElementById('gameScore');
    var totalEl = document.getElementById('gameTotal');
    var t = window.I18n ? I18n.t : function(k) { return k; };

    if (scoreEl) scoreEl.textContent = score;
    if (totalEl) totalEl.textContent = total;

    if (idx >= order.length) {
      if (qEl) qEl.textContent = t('gameScoreLabel') + ' ' + score + '/' + total;
      if (humanBtn) humanBtn.style.display = 'none';
      if (aiBtn) aiBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (restartBtn) restartBtn.style.display = 'inline-block';
      if (fbEl) fbEl.textContent = '';
      return;
    }

    if (qEl) qEl.textContent = texts[order[idx]].text;
    if (humanBtn) humanBtn.style.display = 'inline-block';
    if (aiBtn) aiBtn.style.display = 'inline-block';
    if (nextBtn) nextBtn.style.display = 'none';
    if (restartBtn) restartBtn.style.display = 'none';
    if (fbEl) fbEl.textContent = '';
  }

  function guess(isAIGuess) {
    var fbEl = document.getElementById('gameFeedback');
    var humanBtn = document.getElementById('gameBtnHuman');
    var aiBtn = document.getElementById('gameBtnAI');
    var nextBtn = document.getElementById('gameNextBtn');
    var t = window.I18n ? I18n.t : function(k) { return k; };

    if (idx >= order.length) return;
    var correct = texts[order[idx]].isAI;
    total++;
    if (isAIGuess === correct) score++;

    if (fbEl) {
      var msg = (isAIGuess === correct) ? t('gameFeedbackCorrect') : t('gameFeedbackWrong');
      msg += ' ' + (correct ? t('gameFeedbackAI') : t('gameFeedbackHuman'));
      fbEl.textContent = msg;
    }

    if (humanBtn) humanBtn.style.display = 'none';
    if (aiBtn) aiBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'inline-block';

    var scoreEl = document.getElementById('gameScore');
    var totalEl = document.getElementById('gameTotal');
    if (scoreEl) scoreEl.textContent = score;
    if (totalEl) totalEl.textContent = total;
  }

  function next() {
    idx++;
    render();
  }

  function restart() {
    idx = 0;
    score = 0;
    total = 0;
    order = shuffle(texts.map(function(_, i) { return i; }));
    render();
  }

  function init() {
    loadTexts();
    order = shuffle(texts.map(function(_, i) { return i; }));

    var humanBtn = document.getElementById('gameBtnHuman');
    var aiBtn = document.getElementById('gameBtnAI');
    var nextBtn = document.getElementById('gameNextBtn');
    var restartBtn = document.getElementById('gameRestartBtn');

    if (humanBtn) humanBtn.addEventListener('click', function() { guess(false); });
    if (aiBtn) aiBtn.addEventListener('click', function() { guess(true); });
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (restartBtn) restartBtn.addEventListener('click', restart);

    render();
  }

  return { init: init };
})();

window.Game = Game;
