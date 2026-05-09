/* ====== Mind-OS Global AI Sentiment Poll ====== */

const Poll = (function() {
  const { POLL_API_URL, STORAGE_KEYS } = CONFIG;
  let currentLang = CONFIG.DEFAULT_LANG;

  function setLang(lang) { currentLang = lang; }

  async function syncUI() {
    const hasVoted = storage.get(STORAGE_KEYS.POLL_VOTED);
    const t = getT(currentLang);
    try {
      const response = await fetch(POLL_API_URL);
      const data = await response.json();
      if (hasVoted) {
        document.getElementById('pollOptions').style.display = 'none';
        document.getElementById('submitPoll').style.display = 'none';
        document.getElementById('pollResults').style.display = 'block';

        const items = [
          { label: t.pollFor, val: data.for, color: 'var(--accent)' },
          { label: t.pollNeutral, val: data.neutral, color: '#b4cec0' },
          { label: t.pollAgainst, val: data.against, color: '#ff5555' }
        ];

        document.getElementById('pollBars').innerHTML = items.map(item => `
          <div class="poll-bar-container">
            <div class="poll-bar-label"><span>${item.label}</span><span>${item.val}%</span></div>
            <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${item.val}%; background:${item.color};"></div></div>
          </div>
        `).join('');
      }
    } catch(e) {}
  }

  async function submit() {
    const sel = document.querySelector('input[name="aiPoll"]:checked');
    if (!sel) return;
    const btn = document.getElementById('submitPoll');
    btn.textContent = "...";
    btn.disabled = true;
    storage.set(STORAGE_KEYS.POLL_VOTED, true);
    try {
      await fetch(POLL_API_URL + "?vote=" + sel.value);
      syncUI();
    } catch(e) {
      syncUI();
    }
  }

  return { setLang, syncUI, submit };
})();

window.Poll = Poll;
