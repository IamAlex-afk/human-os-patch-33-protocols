/* ====== Mind-OS Global AI Sentiment Poll ====== */
/* The vote is sent to a Google Apps Script backend only when the visitor presses the vote button;
   the backend answers with the current percentages, which are then kept in this browser. */

const Poll = (function() {
  const { STORAGE_KEYS } = CONFIG;
  let currentLang = CONFIG.DEFAULT_LANG;

  const POLL_API = 'https://script.google.com/macros/s/AKfycbzuPpzgXRHcTl-fBSthX3Te9NuPTT917s-HKDIs2xgzmlwXkFIZCFzUZBmi7ViHyNvt/exec';

  function setLang(lang) { currentLang = lang; }

  /* Results stored in this browser by the last real answer of the backend (set when a vote is sent).
     Never simulated: without real numbers the bars stay empty. */
  function getLocalFallback() {
    return storage.get(STORAGE_KEYS.POLL_BASE) || null;
  }

  function normalizeLegacy(data) {
    if (data.forPct !== undefined) return data;
    return {
      forPct: data['for'] || 0,
      neutralPct: data['neutral'] || 0,
      againstPct: data['against'] || 0
    };
  }

  function renderBars(rawData) {
    if (!rawData) {            // no real numbers yet (e.g. the vote request failed): show no bars rather than invented ones
      const empty = document.getElementById('pollBars');
      if (empty) empty.innerHTML = '';
      return;
    }
    const data = normalizeLegacy(rawData);
    const t = getT(currentLang);
    const items = [
      { key: 'forPct',     label: t.pollFor,     color: 'var(--accent)' },
      { key: 'neutralPct', label: t.pollNeutral,  color: '#b4cec0' },
      { key: 'againstPct', label: t.pollAgainst,  color: '#ff5555' }
    ];
    const pollBars = document.getElementById('pollBars');
    if (pollBars) {
      pollBars.innerHTML = items.map(item => {
        const val = data[item.key] || 0;
        return `<div class="poll-bar-container">
          <div class="poll-bar-label"><span>${item.label}</span><span>${val}%</span></div>
          <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${val}%; background:${item.color};"></div></div>
        </div>`;
      }).join('');
    }
    const totalEl = document.getElementById('pollTotal');
    if (totalEl) totalEl.textContent = '';
  }

  function showResults(data) {
    const t = getT(currentLang);
    const pollOptions = document.getElementById('pollOptions');
    const submitBtn = document.getElementById('submitPoll');
    const pollResults = document.getElementById('pollResults');
    const inviteBtn = document.getElementById('pollInviteBtn');

    if (pollOptions) pollOptions.style.display = 'none';
    if (submitBtn) {
      submitBtn.style.display = 'none';
      if (!document.getElementById('pollVotedMsg')) {
        const msg = document.createElement('p');
        msg.id = 'pollVotedMsg';
        msg.textContent = t.pollVotedText || '✅ Your vote has been recorded (anonymous)';
        msg.style.cssText = 'color:var(--accent);font-weight:600;margin-top:1rem;';
        submitBtn.parentNode.insertBefore(msg, submitBtn);
      }
    }
    if (pollResults) pollResults.style.display = 'block';
    if (inviteBtn) inviteBtn.style.display = '';
    renderBars(data);
  }

  /* Returning visitor who has voted: show the numbers saved in this browser. No network request here —
     the only request this file makes is the vote itself, in submit(). */
  function syncUI() {
    if (!storage.get(STORAGE_KEYS.POLL_VOTED)) return;
    showResults(getLocalFallback());
  }

  function submit() {
    const sel = document.querySelector('input[name="aiPoll"]:checked');
    if (!sel) return;
    const btn = document.getElementById('submitPoll');
    if (btn) { btn.textContent = '...'; btn.disabled = true; }
    const vote = sel.value;
    storage.set(STORAGE_KEYS.POLL_VOTED, true);
    storage.set(STORAGE_KEYS.POLL_VOTE, vote);
    if (POLL_API) {
      fetch(POLL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      })
        .then(r => r.json())
        .then(data => { storage.set(STORAGE_KEYS.POLL_BASE, data); setTimeout(() => showResults(data), 400); })
        .catch(() => setTimeout(() => showResults(getLocalFallback()), 400));
    } else {
      setTimeout(() => showResults(getLocalFallback()), 400);
    }
  }

  return { setLang, syncUI, submit };
})();

window.Poll = Poll;
