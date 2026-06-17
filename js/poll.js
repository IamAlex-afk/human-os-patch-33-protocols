/* ====== Mind-OS Global AI Sentiment Poll (Fully Anonymous, Local Simulator) ====== */

const Poll = (function() {
  const { STORAGE_KEYS } = CONFIG;
  let currentLang = CONFIG.DEFAULT_LANG;

  function setLang(lang) { currentLang = lang; }

  // Получить или сгенерировать базовые проценты
  function getBaseData() {
    if (!storage.get(STORAGE_KEYS.POLL_BASE)) {
      const f = Math.floor(Math.random() * 40) + 30; // 30–70
      const n = Math.floor(Math.random() * 30) + 20; // 20–50
      const a = 100 - f - n;
      storage.set(STORAGE_KEYS.POLL_BASE, { for: f, neutral: n, against: a });
    }
    return storage.get(STORAGE_KEYS.POLL_BASE);
  }

  function syncUI() {
    const hasVoted = storage.get(STORAGE_KEYS.POLL_VOTED);
    const t = getT(currentLang);
        
    if (hasVoted) {
      const pollOptions = document.getElementById('pollOptions');
      const submitBtn = document.getElementById('submitPoll');
      const pollResults = document.getElementById('pollResults');
            
      if (pollOptions) pollOptions.style.display = 'none';
      
      if (submitBtn) {
        submitBtn.style.display = 'none';
        
        // Защита от дублирования сообщения при повторных вызовах
        if (!document.getElementById('pollVotedMsg')) {
          const votedMsg = document.createElement('p');
          votedMsg.id = 'pollVotedMsg';
          // Автоматический фолбэк для перевода, чтобы не трогать translations.js
          const fallbackText = currentLang === 'ru' ? '✅ Ваш голос учтён (анонимно)' : '✅ Your vote has been recorded (anonymous)';
          votedMsg.textContent = t.pollVotedText || fallbackText;
          votedMsg.style.color = 'var(--accent)';
          votedMsg.style.fontWeight = '600';
          votedMsg.style.marginTop = '1rem';
          submitBtn.parentNode.insertBefore(votedMsg, submitBtn);
        }
      }
      
      if (pollResults) pollResults.style.display = 'block';
      
      const base = getBaseData();
      const items = [
        { key: 'for', label: t.pollFor, color: 'var(--accent)' },
        { key: 'neutral', label: t.pollNeutral, color: '#b4cec0' },
        { key: 'against', label: t.pollAgainst, color: '#ff5555' }
      ];
      
      const pollBars = document.getElementById('pollBars');
      if (pollBars) {
        pollBars.innerHTML = items.map(item => {
          const val = base[item.key];
          return `
            <div class="poll-bar-container">
              <div class="poll-bar-label"><span>${item.label}</span><span>${val}%</span></div>
              <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${val}%; background:${item.color};"></div></div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function submit() {
    const sel = document.querySelector('input[name="aiPoll"]:checked');
    if (!sel) return;
    
    const btn = document.getElementById('submitPoll');
    if (btn) {
      btn.textContent = "...";
      btn.disabled = true;
    }
    
    storage.set(STORAGE_KEYS.POLL_VOTED, true);
    storage.set(STORAGE_KEYS.POLL_VOTE, sel.value);
    
    const base = getBaseData();
    base[sel.value] = Math.min(100, base[sel.value] + 1); 
    
    const total = base.for + base.neutral + base.against;
    base.for = Math.round((base.for / total) * 100);
    base.neutral = Math.round((base.neutral / total) * 100);
    base.against = 100 - base.for - base.neutral;
    
    storage.set(STORAGE_KEYS.POLL_BASE, base);
    
    setTimeout(() => {
      syncUI();
    }, 400);
  }

  return { setLang, syncUI, submit };
})();

window.Poll = Poll;
