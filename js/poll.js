/* ====== Mind-OS Global AI Sentiment Poll ====== */
/* Real-time results via Google Apps Script when POLL_API is set.
   Falls back to local simulation if API is unavailable or not configured. */

const Poll = (function() {
  const { STORAGE_KEYS } = CONFIG;
  let currentLang = CONFIG.DEFAULT_LANG;

  // ← вставь URL задеплоенного бэкенда когда будет готов
  const POLL_API = '';

  function setLang(lang) { currentLang = lang; }

  function getLocalFallback() {
    if (!storage.get(STORAGE_KEYS.POLL_BASE)) {
      const f = Math.floor(Math.random() * 30) + 45; // 45–75
      const n = Math.floor(Math.random() * 20) + 15; // 15–35
      const a = 100 - f - n;
      storage.set(STORAGE_KEYS.POLL_BASE, { forPct: f, neutralPct: n, againstPct: a, total: 0 });
    }
    return storage.get(STORAGE_KEYS.POLL_BASE);
  }

  function normalizeLegacy(data) {
    // старый формат: { for, neutral, against } → новый: { forPct, neutralPct, againstPct }
    if (data.forPct !== undefined) return data;
    return {
      forPct: data['for'] || 0,
      neutralPct: data['neutral'] || 0,
      againstPct: data['against'] || 0,
      total: data.total || 0
    };
  }

  function renderBars(rawData) {
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
    if (totalEl && data.total > 0) {
      totalEl.textContent = data.total.toLocaleString() + ' ' + (t.pollTotalVotes || 'votes worldwide');
    }
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

  function syncUI() {
    if (!storage.get(STORAGE_KEYS.POLL_VOTED)) return;
    if (POLL_API) {
      fetch(POLL_API)
        .then(r => r.json())
        .then(data => { storage.set(STORAGE_KEYS.POLL_BASE, data); showResults(data); })
        .catch(() => showResults(getLocalFallback()));
    } else {
      showResults(getLocalFallback());
    }
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
