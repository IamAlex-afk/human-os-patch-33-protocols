/* ====== Mind-OS Quiz Engine ====== */

const Quiz = (function() {
  const { MAX_AXIS, TOTAL_MAX, FEAR_MAX, STORAGE_KEYS } = CONFIG;

  let currentLang = CONFIG.DEFAULT_LANG;
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
    qText.textContent = `${currentIndex + 1}. ${questions[currentIndex]}`;
    stepDiv.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'options';

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

  function finishAxis(prefix, total, t) {
    const reverseKeys = t.reverseKeys[prefix] || [];
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
    }
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
      const pct = (answered / totalQuestions) * 100;
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressLabel) progressLabel.textContent = t.overallProgressLabel;
      if (progressCount) progressCount.textContent = t.overallProgressText.replace('{answered}', answered).replace('{total}', totalQuestions);
    }
  }

  // Reset entire test
  function resetTest() {
    clearAll();
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
    wizardState
  };
})();

window.Quiz = Quiz;
