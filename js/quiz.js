/* ====== Mind-OS Quiz Engine ====== */

const Quiz = (function() {
  const { MAX_AXIS, TOTAL_MAX, FEAR_MAX, STORAGE_KEYS } = CONFIG;

  let currentLang = CONFIG.DEFAULT_LANG;
  const axisKeyMap = { a1: 'q1', a2: 'q2', a3: 'q3', fear: 'fearQ' };
  const COMPLETED_AXES = { a1: false, a2: false, a3: false };
  const userAnswers = { a1: {}, a2: {}, a3: {}, fear: {} };
  const wizardState = { a1: 0, a2: 0, a3: 0, fear: 0 };

  // Load persisted state
  function loadPersisted() {
    const saved = storage.get(STORAGE_KEYS.TEST_ANSWERS);
    const savedWiz = storage.get(STORAGE_KEYS.TEST_WIZARD);
    const savedComp = storage.get(STORAGE_KEYS.TEST_COMPLETED);
    if (saved) Object.assign(userAnswers, saved);
    if (savedWiz) Object.assign(wizardState, savedWiz);
    if (savedComp) Object.assign(COMPLETED_AXES, savedComp);
  }

  function persist() {
    storage.set(STORAGE_KEYS.TEST_ANSWERS, userAnswers);
    storage.set(STORAGE_KEYS.TEST_WIZARD, wizardState);
    storage.set(STORAGE_KEYS.TEST_COMPLETED, COMPLETED_AXES);
  }

  function clearAll() {
    storage.remove(STORAGE_KEYS.TEST_ANSWERS);
    storage.remove(STORAGE_KEYS.TEST_WIZARD);
    storage.remove(STORAGE_KEYS.TEST_COMPLETED);
    Object.keys(userAnswers).forEach(k => userAnswers[k] = {});
    Object.keys(wizardState).forEach(k => wizardState[k] = 0);
    Object.keys(COMPLETED_AXES).forEach(k => COMPLETED_AXES[k] = false);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  function setLang(lang) { currentLang = lang; }

  function renderWizard(containerId, questions, prefix, t) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const currentIndex = wizardState[prefix];
    const total = questions.length;
    container.innerHTML = '';

    // If already completed, show nothing (result shown instead)
    const isCompleted = prefix === 'fear'
      ? document.getElementById('fearResult')?.style.display === 'block'
      : document.getElementById(prefix === 'a1' ? 'r1' : prefix === 'a2' ? 'r2' : 'r3')?.style.display === 'block';

    // Skip rendering wizard if axis is completed
    if (prefix !== 'fear' && COMPLETED_AXES[prefix]) return;

    const stepDiv = document.createElement('div');
    stepDiv.className = 'question-step active';

    const qText = document.createElement('div');
    qText.className = 'question-text';
    qText.id = `${containerId}_q${currentIndex}`;
    qText.textContent = `${currentIndex + 1}. ${questions[currentIndex]}`;
    stepDiv.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'options';
    optsDiv.setAttribute('role', 'radiogroup');
    optsDiv.setAttribute('aria-labelledby', qText.id);

    t.options.forEach((optText, i) => {
      const label = document.createElement('label');
      label.className = 'option-label';
      const currentVal = userAnswers[prefix][currentIndex];
      if (currentVal === i.toString()) label.classList.add('selected');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `${prefix}_${currentIndex}`;
      input.value = i;
      if (currentVal === i.toString()) input.checked = true;
      input.onchange = (e) => {
        userAnswers[prefix][currentIndex] = e.target.value;
        label.parentElement.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        persist();
        updateOverallProgress();
        if (currentIndex < total - 1) {
          setTimeout(() => { navigateWizard(prefix, 1, containerId, questions, t); }, 300);
        } else {
          renderWizard(containerId, questions, prefix, t);
        }
      };

      label.appendChild(input);
      label.appendChild(document.createTextNode(optText));
      optsDiv.appendChild(label);
    });

    stepDiv.appendChild(optsDiv);

    // Navigation
    const navDiv = document.createElement('div');
    navDiv.className = 'wizard-nav';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn-nav';
    btnPrev.textContent = t.prevBtn;
    btnPrev.disabled = currentIndex === 0;
    btnPrev.onclick = () => navigateWizard(prefix, -1, containerId, questions, t);

    let btnNext;
    if (currentIndex < total - 1) {
      btnNext = document.createElement('button');
      btnNext.className = 'btn-nav';
      btnNext.textContent = t.nextBtn;
      btnNext.disabled = userAnswers[prefix][currentIndex] === undefined;
      btnNext.onclick = () => navigateWizard(prefix, 1, containerId, questions, t);
    } else {
      btnNext = document.createElement('button');
      btnNext.className = 'btn-submit';
      btnNext.textContent = t.submitBtn;
      btnNext.disabled = userAnswers[prefix][currentIndex] === undefined;
      btnNext.onclick = () => {
        if (prefix === 'fear') finishFear(total, t);
        else finishAxis(prefix, total, t);
      };
    }

    navDiv.appendChild(btnPrev);
    navDiv.appendChild(btnNext);
    stepDiv.appendChild(navDiv);
    container.appendChild(stepDiv);

    const pText = document.getElementById(`${prefix}Progress`);
    if (pText) pText.textContent = t.progressText.replace('{answered}', currentIndex + 1).replace('{total}', total);
  }

  function navigateWizard(prefix, direction, containerId, questions, t) {
    wizardState[prefix] += direction;
    persist();
    renderWizard(containerId, questions, prefix, t);
  }

  function computeAxisScore(prefix, n, reverseIndices) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const val = userAnswers[prefix][i];
      if (val === undefined) return null;
      let score = parseInt(val);
      if (reverseIndices && reverseIndices.includes(i)) score = 4 - score;
      sum += score;
    }
    return sum;
  }

  // Детекция «прямых ответов» (careless responding) — все ответы одинаковы
  let straightLineCount = 0;
  function isStraightLine(prefix, n) {
    const vals = [];
    for (let i = 0; i < n; i++) {
      if (userAnswers[prefix][i] === undefined) return false;
      vals.push(userAnswers[prefix][i]);
    }
    return vals.length > 1 && vals.every(v => v === vals[0]);
  }

  function finishAxis(prefix, total, t) {
    if (isStraightLine(prefix, total)) straightLineCount++;
    const reverseKeys = t.reverseKeys[axisKeyMap[prefix]] || [];
    const score = computeAxisScore(prefix, total, reverseKeys);
    if (score === null) { alert(t.alertIncomplete); return; }

    const containerId = prefix === 'a1' ? 'q1Container' : (prefix === 'a2' ? 'q2Container' : 'q3Container');
    const resId = prefix === 'a1' ? 'r1' : (prefix === 'a2' ? 'r2' : 'r3');

    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';
    const progressEl = document.getElementById(`${prefix}Progress`);
    if (progressEl) progressEl.style.display = 'none';

    const div = document.getElementById(resId);
    if (div) {
      div.style.display = 'block';
      const ratio = score / MAX_AXIS;
      let arch = t.archetypes.low;
      if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
      if (ratio > 0.7) arch = t.archetypes.high;
      div.innerHTML = `<div class="result-header"><strong>${t.scoreLabel}: ${score}/${MAX_AXIS}</strong><span class="result-badge">${arch.name}</span></div><div class="result-advice">${arch.advice}</div>`;
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    COMPLETED_AXES[prefix] = true;
    persist();
    updateOverallProgress();
    checkOverallReady();
  }

  function finishFear(total, t) {
    const score = computeAxisScore('fear', total, []);
    if (score === null) { alert(t.alertIncomplete); return; }

    const container = document.getElementById('qFearContainer');
    if (container) container.style.display = 'none';
    const progressEl = document.getElementById('fearProgress');
    if (progressEl) progressEl.style.display = 'none';

    const div = document.getElementById('fearResult');
    if (div) {
      div.style.display = 'block';
      const pct = Math.round((score / FEAR_MAX) * 100);
      let level = t.fearLevels.low;
      if (score <= 4) level = t.fearLevels.low;
      else if (score <= 8) level = t.fearLevels.medium;
      else if (score <= 12) level = t.fearLevels.high;
      else level = t.fearLevels.veryHigh;
      div.innerHTML = `<div class="result-header"><strong>${t.fearResultTitle}: ${pct}% (${level.name})</strong></div><div class="poll-bar-track" style="margin: 1rem 0;"><div class="poll-bar-fill" style="width: ${pct}%; background: var(--accent);"></div></div><div class="result-advice">${level.advice}</div>`;
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
      _fearRatio = score / FEAR_MAX;
      _raw.fear = score;
      renderMatrix();
    }
  }

  // ── РАДАР-ГРАФИК (SVG, без библиотек) ──
  function renderRadar(s1, s2, s3) {
    const holder = document.getElementById('radarHolder');
    if (!holder) return;
    const t = getT(currentLang);
    const max = MAX_AXIS; // 32
    const size = 260, cx = size/2, cy = size/2 + 6, R = 88;
    const axes = [
      { v: s1/max, label: (t.axis1Title||'Thinking').replace(/^[^\wА-Яа-я]+/, '').trim() },
      { v: s2/max, label: (t.axis2Title||'Anxiety').replace(/^[^\wА-Яа-я]+/, '').trim() },
      { v: s3/max, label: (t.axis3Title||'Burnout').replace(/^[^\wА-Яа-я]+/, '').trim() }
    ];
    const ang = i => (Math.PI/2) + (i * 2*Math.PI/3) * -1 - Math.PI; // старт сверху
    const pt = (i, r) => [cx + r*Math.cos(ang(i)), cy + r*Math.sin(ang(i))];

    // Сетка (3 кольца)
    let grid = '';
    for (let ring=1; ring<=3; ring++) {
      const rr = R*ring/3;
      const pts = [0,1,2].map(i => pt(i, rr).map(n=>n.toFixed(1)).join(',')).join(' ');
      grid += `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1" opacity="0.5"/>`;
    }
    // Лучи
    let spokes = '';
    [0,1,2].forEach(i => {
      const [x,y] = pt(i, R);
      spokes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="1" opacity="0.5"/>`;
    });
    // Данные (заполненный треугольник)
    const dataPts = axes.map((a,i) => pt(i, R*Math.max(a.v,0.04)).map(n=>n.toFixed(1)).join(',')).join(' ');
    const dataPoly = `<polygon points="${dataPts}" fill="var(--accent)" fill-opacity="0.25" stroke="var(--accent)" stroke-width="2.5"/>`;
    // Точки + значения
    let dots = '';
    axes.forEach((a,i) => {
      const [x,y] = pt(i, R*Math.max(a.v,0.04));
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--accent)"/>`;
    });
    // Подписи осей
    let labels = '';
    axes.forEach((a,i) => {
      const [x,y] = pt(i, R+24);
      const anchor = i===0 ? 'middle' : (x>cx ? 'start' : 'end');
      const pctVal = Math.round(a.v*100);
      labels += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="600" fill="var(--text)">${a.label}</text>`;
      labels += `<text x="${x.toFixed(1)}" y="${(y+15).toFixed(1)}" text-anchor="${anchor}" font-size="11" fill="var(--accent)">${pctVal}%</text>`;
    });

    holder.innerHTML = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Radar chart of your three AI dependency axes">${grid}${spokes}${dataPoly}${dots}${labels}</svg>`;
  }

  // ── СПЕКТР ЗАВИСИМОСТИ ──
  function renderSpectrum(ratio) {
    const marker = document.getElementById('spectrumMarker');
    if (!marker) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pct = Math.min(Math.max(ratio*100, 2), 98);
    if (reduce) { marker.style.left = pct + '%'; return; }
    marker.style.left = '2%';
    setTimeout(() => { marker.style.left = pct + '%'; }, 100);
  }

  // ── БЛОК "ЧТО ДЕЛАТЬ" — по самой высокой оси ──
  function renderWhatToDo(s1, s2, s3) {
    const box = document.getElementById('whatToDo');
    const txt = document.getElementById('whatToDoText');
    const title = document.getElementById('whatToDoTitle');
    if (!box || !txt) return;
    const t = getT(currentLang);
    const scores = [ {k:'axis1', v:s1}, {k:'axis2', v:s2}, {k:'axis3', v:s3} ];
    scores.sort((a,b) => b.v - a.v);
    const top = scores[0].k;
    const tips = t.focusTips || {};
    if (title && t.whatToDoTitle) title.textContent = t.whatToDoTitle;
    if (tips[top]) {
      txt.textContent = tips[top];
      box.removeAttribute('hidden');
    }
  }

  // Сырые баллы для shareable URL (ноль данных на сервер)
  let _raw = { s1: null, s2: null, s3: null, fear: -1 };

  function encodeResult() {
    if (_raw.s1 === null) return '';
    try {
      const data = { a: _raw.s1, b: _raw.s2, c: _raw.s3, f: _raw.fear };
      return btoa(JSON.stringify(data)).replace(/=+$/, '');
    } catch (e) { return ''; }
  }

  function buildShareURL() {
    const base = window.location.origin + window.location.pathname;
    const enc = encodeResult();
    return enc ? base + '#r=' + enc : window.location.href;
  }

  function showResultFromScores(s1, s2, s3, fear, shared) {
    const t = getT(currentLang);
    const totalScore = s1 + s2 + s3;
    const ratio = totalScore / TOTAL_MAX;
    let arch = t.archetypes.low;
    if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
    if (ratio > 0.7) arch = t.archetypes.high;

    const block = document.getElementById('overallBlock');
    if (!block) return;
    block.style.display = 'block';
    const aEl = document.getElementById('overallArchetype');
    const pEl = document.getElementById('overallPercentile');
    const adEl = document.getElementById('overallAdvice');
    if (aEl) aEl.textContent = arch.name;
    if (pEl) pEl.textContent = t.overallPercentileLabel.replace('{percentile}', arch.percentile);
    if (adEl) adEl.textContent = arch.advice;

    renderRadar(s1, s2, s3);
    renderSpectrum(ratio);
    renderWhatToDo(s1, s2, s3);
    _depRatio = ratio;
    if (fear >= 0) _fearRatio = fear / FEAR_MAX;
    renderMatrix();

    const banner = document.getElementById('sharedBanner');
    if (banner) { if (shared) banner.removeAttribute('hidden'); else banner.setAttribute('hidden',''); }

    setTimeout(() => { block.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
  }

  function checkSharedResult() {
    const hash = window.location.hash || '';
    const m = hash.match(/[#&]r=([A-Za-z0-9+/]+)/);
    if (!m) return false;
    try {
      const d = JSON.parse(atob(m[1]));
      const s1 = +d.a, s2 = +d.b, s3 = +d.c, f = +d.f;
      const ok = [s1, s2, s3].every(v => Number.isFinite(v) && v >= 0 && v <= MAX_AXIS)
                 && Number.isFinite(f) && f >= -1 && f <= FEAR_MAX;
      if (!ok) return false;
      showResultFromScores(s1, s2, s3, f, true);
      return true;
    } catch (e) { return false; }
  }

  // Матрица Зависимость × Страх — храним оба показателя
  let _depRatio = null, _fearRatio = null;

  function renderMatrix() {
    if (_depRatio === null || _fearRatio === null) return;
    const box = document.getElementById('depFearMatrix');
    if (!box) return;
    const t = getT(currentLang);
    const m = t.matrix;
    if (!m || !m.quadrants) return;

    const depHigh = _depRatio > 0.5;
    const fearHigh = _fearRatio > 0.5;
    let q;
    if (depHigh && !fearHigh) q = 'confident';
    else if (depHigh && fearHigh) q = 'anxious';
    else if (!depHigh && fearHigh) q = 'rejecting';
    else q = 'sovereign';

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('matrixTitle', m.title);
    setTxt('matrixDepAxis', m.depAxis + ' \u2191');
    setTxt('matrixFearAxis', m.fearAxis + ' \u2192');
    setTxt('matrixNote', m.note);

    box.querySelectorAll('.matrix-cell').forEach(cell => {
      const key = cell.getAttribute('data-q');
      const nameEl = cell.querySelector('.cell-name');
      if (nameEl && m.quadrants[key]) nameEl.textContent = m.quadrants[key].name;
      cell.classList.toggle('active', key === q);
    });

    const resultEl = document.getElementById('matrixResult');
    if (resultEl && m.quadrants[q]) {
      resultEl.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = m.quadrants[q].name;
      const span = document.createElement('span');
      span.textContent = m.quadrants[q].desc;
      resultEl.appendChild(strong);
      resultEl.appendChild(span);
    }
    box.removeAttribute('hidden');
  }

  function checkOverallReady() {
    if (COMPLETED_AXES.a1 && COMPLETED_AXES.a2 && COMPLETED_AXES.a3) {
      const t = getT(currentLang);
      const s1 = computeAxisScore('a1', 8, t.reverseKeys.q1);
      const s2 = computeAxisScore('a2', 8, t.reverseKeys.q2);
      const s3 = computeAxisScore('a3', 8, t.reverseKeys.q3);
      const totalScore = s1 + s2 + s3;
      const ratio = totalScore / TOTAL_MAX;

      let arch = t.archetypes.low;
      if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
      if (ratio > 0.7) arch = t.archetypes.high;

      const block = document.getElementById('overallBlock');
      block.style.display = 'block';
      document.getElementById('overallArchetype').textContent = arch.name;
      document.getElementById('overallPercentile').textContent = t.overallPercentileLabel.replace('{percentile}', arch.percentile);
      document.getElementById('overallAdvice').textContent = arch.advice;

      // Предупреждение о качестве ответов (если прямые ответы в 2+ осях)
      const warnEl = document.getElementById('answerQualityWarning');
      if (warnEl) {
        if (straightLineCount >= 2 && t.answerQualityWarning) {
          warnEl.textContent = t.answerQualityWarning;
          warnEl.removeAttribute('hidden');
        } else {
          warnEl.setAttribute('hidden', '');
        }
      }

      // Визуализация: радар, спектр, что делать
      renderRadar(s1, s2, s3);
      renderSpectrum(ratio);
      renderWhatToDo(s1, s2, s3);
      _depRatio = ratio;
      _raw.s1 = s1; _raw.s2 = s2; _raw.s3 = s3;
      renderMatrix();

      // Show reset button
      const resetBtn = document.getElementById('resetTestButton');
      if (resetBtn) resetBtn.style.display = 'inline-flex';

      setTimeout(() => { block.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 500);
    }
  }

  // Overall progress bar across all axes
  function updateOverallProgress() {
    const t = getT(currentLang);
    const totalQuestions = 28; // 8+8+8+4
    let answered = 0;
    ['a1', 'a2', 'a3', 'fear'].forEach(axis => {
      answered += Object.keys(userAnswers[axis]).length;
    });

    const progressEl = document.getElementById('overallProgress');
    const progressFill = document.getElementById('overallProgressFill');
    const progressLabel = document.getElementById('overallProgressLabel');
    const progressCount = document.getElementById('overallProgressCount');

    if (progressEl && answered > 0) {
      progressEl.classList.add('visible');
      const pct = Math.round((answered / totalQuestions) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = t.overallProgressLabel;
      if (progressCount) progressCount.textContent = t.overallProgressText.replace('{answered}', answered).replace('{total}', totalQuestions);
      // Анимированный счётчик процентов
      animateCounter(progressFill, pct);
    }
  }

  // Плавная анимация процента (уважает prefers-reduced-motion)
  function animateCounter(el, target) {
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.setAttribute('data-pct', target + '%');
    if (reduce) return;
    const from = parseFloat(el.getAttribute('data-anim') || '0');
    const start = performance.now();
    const dur = 500;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const val = Math.round(from + (target - from) * p);
      el.setAttribute('data-pct', val + '%');
      if (p < 1) requestAnimationFrame(step);
      else el.setAttribute('data-anim', String(target));
    }
    requestAnimationFrame(step);
  }

  // Reset entire test
  function resetTest() {
    clearAll();
    straightLineCount = 0;
    _depRatio = null;
    _fearRatio = null;
    _raw = { s1: null, s2: null, s3: null, fear: -1 };
    const _mx = document.getElementById('depFearMatrix');
    if (_mx) _mx.setAttribute('hidden', '');
    // Reset UI
    ['q1Container', 'q2Container', 'q3Container', 'qFearContainer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    ['r1', 'r2', 'r3', 'fearResult', 'overallBlock'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    ['a1Progress', 'a2Progress', 'a3Progress', 'fearProgress'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    const resetBtn = document.getElementById('resetTestButton');
    if (resetBtn) resetBtn.style.display = 'none';
    const progressEl = document.getElementById('overallProgress');
    if (progressEl) progressEl.classList.remove('visible');

    // Re-render
    const t = getT(currentLang);
    renderWizard('q1Container', t.q1, 'a1', t);
    renderWizard('q2Container', t.q2, 'a2', t);
    renderWizard('q3Container', t.q3, 'a3', t);
    renderWizard('qFearContainer', t.fearQ, 'fear', t);
  }

  return {
    loadPersisted,
    setLang,
    renderWizard,
    finishAxis,
    finishFear,
    checkOverallReady,
    updateOverallProgress,
    resetTest,
    COMPLETED_AXES,
    userAnswers,
    wizardState,
    buildShareURL,
    checkSharedResult
  };
})();

window.Quiz = Quiz;
