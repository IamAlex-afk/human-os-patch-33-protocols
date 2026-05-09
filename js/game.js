/* ====== Mind-OS AI or Not Game ====== */

const Game = (function() {
  let currentLang = CONFIG.DEFAULT_LANG;
  let gameIndex = 0;
  let gameScore = 0;

  function setLang(lang) { currentLang = lang; }

  function loadQuestion() {
    const t = getT(currentLang);
    const qEl = document.getElementById('gameQuestion');
    const feedbackEl = document.getElementById('gameFeedback');
    if (!qEl) return;
    const q = t.gameTexts[gameIndex];
    qEl.textContent = q.text;
    if (feedbackEl) feedbackEl.textContent = '';
    document.getElementById('gameBtnHuman').style.display = 'inline-flex';
    document.getElementById('gameBtnAI').style.display = 'inline-flex';
    document.getElementById('gameNextBtn').style.display = 'none';
    document.getElementById('gameRestartBtn').style.display = 'none';
    document.getElementById('gameTotal').textContent = t.gameTexts.length;
    document.getElementById('gameScore').textContent = gameScore;
  }

  function handleGuess(isAIGuess) {
    const t = getT(currentLang);
    const q = t.gameTexts[gameIndex];
    const isCorrect = isAIGuess === q.isAI;
    if (isCorrect) gameScore++;

    const fb = document.getElementById('gameFeedback');
    fb.textContent = (isCorrect ? t.gameFeedbackCorrect : t.gameFeedbackWrong) + " " + (q.isAI ? t.gameFeedbackAI : t.gameFeedbackHuman);
    fb.style.color = isCorrect ? 'var(--accent)' : '#ff5555';

    document.getElementById('gameBtnHuman').style.display = 'none';
    document.getElementById('gameBtnAI').style.display = 'none';
    document.getElementById('gameScore').textContent = gameScore;

    if (gameIndex < t.gameTexts.length - 1) {
      document.getElementById('gameNextBtn').style.display = 'inline-flex';
    } else {
      document.getElementById('gameRestartBtn').style.display = 'inline-flex';
    }
  }

  function next() {
    const t = getT(currentLang);
    if (gameIndex < t.gameTexts.length - 1) {
      gameIndex++;
      loadQuestion();
    }
  }

  function restart() {
    gameIndex = 0;
    gameScore = 0;
    loadQuestion();
  }

  return { setLang, loadQuestion, handleGuess, next, restart };
})();

window.Game = Game;
