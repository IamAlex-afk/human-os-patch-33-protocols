/* ====== Mind-OS Cognitive Load Tracker ====== */

const Tracker = (function() {
  const { STORAGE_KEYS } = CONFIG;
  let currentLang = CONFIG.DEFAULT_LANG;

  function setLang(lang) { currentLang = lang; }

  function updateUI() {
    const t = getT(currentLang);
    const data = storage.get(STORAGE_KEYS.TRACKER) || {};
    const today = new Date().toISOString().slice(0, 10);
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ date: key, score: data[key] ?? null });
    }

    const validScores = last7.filter(d => d.score !== null).map(d => d.score);
    const avg = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : null;

    const chartDiv = document.getElementById('trackerChartContainer');
    let chartHtml = '<div class="tracker-chart">';
    last7.forEach(d => {
      const height = d.score !== null ? (d.score / 10) * 80 + 10 : 8;
      const opacity = d.score !== null ? '1' : '0.2';
      chartHtml += `<div class="chart-bar"><div class="bar-fill" style="height:${height}px; opacity:${opacity};"></div><div class="bar-label">${d.date.slice(5)}</div></div>`;
    });
    chartHtml += '</div>';
    if (chartDiv) chartDiv.innerHTML = chartHtml;

    let trendText = t.noData;
    if (validScores.length >= 3) {
      const mid = Math.floor(validScores.length / 2);
      const avg1 = validScores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const avg2 = validScores.slice(mid).reduce((a, b) => a + b, 0) / (validScores.length - mid);
      if (avg2 > avg1 + 0.5) trendText = t.trendIncreasing;
      else if (avg2 < avg1 - 0.5) trendText = t.trendDecreasing;
      else trendText = t.trendStable;
    }

    const summaryDiv = document.getElementById('trackerSummary');
    if (summaryDiv) summaryDiv.innerHTML = `<div style="margin-top:1rem;"><strong>${t.trackerSummaryPrefix} ${avg ?? '—'}</strong><br><span style="font-size:0.9rem;color:var(--text-dim);">${trendText}</span></div>`;

    const disp = document.getElementById('trackerValueDisplay');
    const scoreInp = document.getElementById('trackerScore');
    if (disp) disp.textContent = data[today] ?? scoreInp.value;
  }

  function saveEntry() {
    const tSlider = document.getElementById('trackerScore');
    const today = new Date().toISOString().slice(0, 10);
    const data = storage.get(STORAGE_KEYS.TRACKER) || {};
    data[today] = parseInt(tSlider.value);
    const keys = Object.keys(data).sort().slice(-30);
    const trimmed = {}; keys.forEach(k => trimmed[k] = data[k]);
    storage.set(STORAGE_KEYS.TRACKER, trimmed);
    updateUI();
  }

  function resetData() {
    storage.remove(STORAGE_KEYS.TRACKER);
    updateUI();
  }

  return { setLang, updateUI, saveEntry, resetData };
})();

window.Tracker = Tracker;
