/* ====== Mind-OS Quiz Engine v3.0 ====== */

const Quiz = (function() {
  'use strict';

  const { MAX_AXIS, TOTAL_MAX, FEAR_MAX, STORAGE_KEYS } = CONFIG;

  let currentLang = CONFIG.DEFAULT_LANG;
  const COMPLETED_AXES = { a1: false, a2: false, a3: false };
  const userAnswers = { a1: {}, a2: {}, a3: {}, fear: {} };
  const wizardState = { a1: 0, a2: 0, a3: 0, fear: 0 };

  function getT() {
    return window.I18n ? (I18n._cache()[currentLang] || {}) : {};
  }

  function loadPersisted() {
    const saved = Storage.get(STORAGE_KEYS.TEST_ANSWERS);
    const savedWiz = Storage.get(STORAGE_KEYS.TEST_WIZARD);
    const savedComp = Storage.get(STORAGE_KEYS.TEST_COMPLETED);
    if (saved) Object.assign(userAnswers, saved);
    if (savedWiz) Object.assign(wizardState, savedWiz);
    if (savedComp) Object.assign(COMPLETED_AXES, savedComp);
  }

  function persist() {
    Storage.set(STORAGE_KEYS.TEST_ANSWERS, userAnswers);
    Storage.set(STORAGE_KEYS.TEST_WIZARD, wizardState);
    Storage.set(STORAGE_KEYS.TEST_COMPLETED, COMPLETED_AXES);
  }

  function clearAll() {
    Storage.remove(STORAGE_KEYS.TEST_ANSWERS);
    Storage.remove(STORAGE_KEYS.TEST_WIZARD);
    Storage.remove(STORAGE_KEYS.TEST_COMPLETED);
    Object.keys(userAnswers).forEach(k => userAnswers[k] = {});
    Object.keys(wizardState).forEach(k => wizardState[k] = 0);
    Object.keys(COMPLETED_AXES).forEach(k => COMPLETED_AXES[k] = false);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[m]);
  }

  function setLang(lang) { currentLang = lang; }

  function getQuestions(axisPrefix) {
    const t = getT();
    return t[axisPrefix] || [];
  }

  function getOptions() {
    const t = getT();
    return t.options || ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  }

  function renderWizard(containerId, questions, prefix) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const currentIndex = wizardState[prefix];
    const total = questions.length;
    container.innerHTML = '';

    if (prefix !== 'fear' && COMPLETED_AXES[prefix]) return;

    const t = getT();
    const opts = getOptions();
    const stepDiv = document.createElement('div');
    stepDiv.className = 'question-step active';

    const qText = document.createElement('div');
    qText.className = 'question-text';
    qText.textContent = (currentIndex + 1) + '. ' + questions[currentIndex];
    stepDiv.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'options';

    opts.forEach(function(optText, i) {
      const label = document.createElement('label');
      label.className = 'option-label';
      const currentVal = userAnswers[prefix][currentIndex];
      if (currentVal === i.toString()) label.classList.add('selected');

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = prefix + '_' + currentIndex;
      input.value = i;
      if (currentVal === i.toString()) input.checked = true;
      input.onchange = function(e) {
        userAnswers[prefix][currentIndex] = e.target.value;
        label.parentElement.querySelectorAll('.option-label').forEach(function(l) { l.classList.remove('selected'); });
        label.classList.add('selected');
        persist();
        updateOverallProgress();
        if (currentIndex < total - 1) {
          setTimeout(function() { navigateWizard(prefix, 1, containerId, questions); }, 300);
        } else {
          renderWizard(containerId, questions, prefix);
        }
      };

      label.appendChild(input);
      label.appendChild(document.createTextNode(optText));
      optsDiv.appendChild(label);
    });

    stepDiv.appendChild(optsDiv);

    const navDiv = document.createElement('div');
    navDiv.className = 'wizard-nav';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'btn-nav';
    btnPrev.textContent = t.prevBtn || '← Back';
    btnPrev.disabled = currentIndex === 0;
    btnPrev.onclick = function() { navigateWizard(prefix, -1, containerId, questions); };

    let btnNext;
    if (currentIndex < total - 1) {
      btnNext = document.createElement('button');
      btnNext.className = 'btn-nav';
      btnNext.textContent = t.nextBtn || 'Next →';
      btnNext.disabled = userAnswers[prefix][currentIndex] === undefined;
      btnNext.onclick = function() { navigateWizard(prefix, 1, containerId, questions); };
    } else {
      btnNext = document.createElement('button');
      btnNext.className = 'btn-submit';
      btnNext.textContent = t.submitBtn || 'Get Result';
      btnNext.disabled = userAnswers[prefix][currentIndex] === undefined;
      btnNext.onclick = function() {
        if (prefix === 'fear') finishFear(total);
        else finishAxis(prefix, total);
      };
    }

    navDiv.appendChild(btnPrev);
    navDiv.appendChild(btnNext);
    stepDiv.appendChild(navDiv);
    container.appendChild(stepDiv);

    const pText = document.getElementById(prefix + 'Progress');
    if (pText) {
      const pt = t.progressText || 'Question {answered}/{total}';
      pText.textContent = pt.replace('{answered}', currentIndex + 1).replace('{total}', total);
    }
  }

  function navigateWizard(prefix, direction, containerId, questions) {
    wizardState[prefix] += direction;
    persist();
    renderWizard(containerId, questions, prefix);
  }

  function computeAxisScore(prefix, n) {
    const t = getT();
    const reverseIndices = (t.reverseKeys && t.reverseKeys[prefix]) || [];
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const val = userAnswers[prefix][i];
      if (val === undefined) return null;
      let score = parseInt(val);
      if (reverseIndices.indexOf(i) !== -1) score = 4 - score;
      sum += score;
    }
    return sum;
  }

  function finishAxis(prefix, total) {
    const score = computeAxisScore(prefix, total);
    if (score === null) {
      const t = getT();
      alert(t.alertIncomplete || 'Please answer the current question.');
      return;
    }

    const containerId = prefix === 'a1' ? 'q1Container' : (prefix === 'a2' ? 'q2Container' : 'q3Container');
    const resId = prefix === 'a1' ? 'r1' : (prefix === 'a2' ? 'r2' : 'r3');

    const container = document.getElementById(containerId);
    if (container) container.style.display = 'none';
    const progressEl = document.getElementById(prefix + 'Progress');
    if (progressEl) progressEl.style.display = 'none';

    const t = getT();
    const ratio = score / MAX_AXIS;
    let arch = t.archetypes.low;
    if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
    if (ratio > 0.7) arch = t.archetypes.high;

    const div = document.getElementById(resId);
    if (div) {
      div.style.display = 'block';
      div.innerHTML = '<h3>' + escapeHtml(arch.name) + '</h3><p>' + escapeHtml(arch.advice) + '</p>';
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    COMPLETED_AXES[prefix] = true;
    persist();
    updateOverallProgress();
    checkOverallReady();
  }

  function finishFear(total) {
    const score = computeAxisScore('fear', total);
    if (score === null) {
      const t = getT();
      alert(t.alertIncomplete || 'Please answer the current question.');
      return;
    }

    const container = document.getElementById('qFearContainer');
    if (container) container.style.display = 'none';
    const progressEl = document.getElementById('fearProgress');
    if (progressEl) progressEl.style.display = 'none';

    const t = getT();
    const div = document.getElementById('fearResult');
    if (div) {
      div.style.display = 'block';
      let level = t.fearLevels.low;
      if (score <= 4) level = t.fearLevels.low;
      else if (score <= 8) level = t.fearLevels.medium;
      else if (score <= 12) level = t.fearLevels.high;
      else level = t.fearLevels.veryHigh;
      div.innerHTML = '<h3>' + escapeHtml(t.fearResultTitle || 'Fear Index') + ': ' + escapeHtml(level.name) + '</h3><p>' + escapeHtml(level.advice) + '</p>';
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function checkOverallReady() {
    if (COMPLETED_AXES.a1 && COMPLETED_AXES.a2 && COMPLETED_AXES.a3) {
      const t = getT();
      const s1 = computeAxisScore('a1', 8);
      const s2 = computeAxisScore('a2', 8);
      const s3 = computeAxisScore('a3', 8);
      if (s1 === null || s2 === null || s3 === null) return;

      const totalScore = s1 + s2 + s3;
      const ratio = totalScore / TOTAL_MAX;

      let arch = t.archetypes.low;
      if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
      if (ratio > 0.7) arch = t.archetypes.high;

      const block = document.getElementById('overallBlock');
      if (block) {
        block.style.display = 'block';
        const archEl = document.getElementById('overallArchetype');
        const pctEl = document.getElementById('overallPercentile');
        const adviceEl = document.getElementById('overallAdvice');
        if (archEl) archEl.textContent = arch.name;
        if (pctEl) pctEl.textContent = (t.overallPercentileLabel || 'Better than {percentile}%').replace('{percentile}', arch.percentile || Math.round((1-ratio)*100));
        if (adviceEl) adviceEl.textContent = arch.advice;
      }

      const resetBtn = document.getElementById('resetTestButton');
      if (resetBtn) resetBtn.style.display = 'inline-flex';

      setTimeout(function() {
        const ob = document.getElementById('overallBlock');
        if (ob) ob.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }

  function updateOverallProgress() {
    const t = getT();
    const totalQuestions = 28;
    let answered = 0;
    ['a1', 'a2', 'a3', 'fear'].forEach(function(axis) {
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
      if (progressLabel) progressLabel.textContent = t.overallProgressLabel || 'Assessment Progress';
      if (progressCount) {
        const pt = t.overallProgressText || '{answered} of {total} answered';
        progressCount.textContent = pt.replace('{answered}', answered).replace('{total}', totalQuestions);
      }
    }
  }

  function resetTest() {
    clearAll();
    ['q1Container', 'q2Container', 'q3Container', 'qFearContainer'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    ['r1', 'r2', 'r3', 'fearResult', 'overallBlock'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    ['a1Progress', 'a2Progress', 'a3Progress', 'fearProgress'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    const resetBtn = document.getElementById('resetTestButton');
    if (resetBtn) resetBtn.style.display = 'none';
    const progressEl = document.getElementById('overallProgress');
    if (progressEl) progressEl.classList.remove('visible');

    build('q1', 'q1Container', 'a1Progress', 'r1', MAX_AXIS);
    build('q2', 'q2Container', 'a2Progress', 'r2', MAX_AXIS);
    build('q3', 'q3Container', 'a3Progress', 'r3', MAX_AXIS);
    build('fearQ', 'qFearContainer', 'fearProgress', 'fearResult', FEAR_MAX);
  }

  function build(axisPrefix, containerId, progressId, resultId, maxScore) {
    const questions = getQuestions(axisPrefix);
    if (questions.length === 0) {
      console.warn('[Quiz] No questions found for ' + axisPrefix);
      return;
    }
    const prefix = axisPrefix === 'fearQ' ? 'fear' : (axisPrefix === 'q1' ? 'a1' : (axisPrefix === 'q2' ? 'a2' : 'a3'));
    renderWizard(containerId, questions, prefix);
  }

  function isComplete() {
    return COMPLETED_AXES.a1 && COMPLETED_AXES.a2 && COMPLETED_AXES.a3;
  }

  function getOverallScore() {
    const s1 = computeAxisScore('a1', 8);
    const s2 = computeAxisScore('a2', 8);
    const s3 = computeAxisScore('a3', 8);
    if (s1 === null || s2 === null || s3 === null) return { total: 0, max: TOTAL_MAX, pct: 0 };
    const total = s1 + s2 + s3;
    return { total: total, max: TOTAL_MAX, pct: Math.round((total / TOTAL_MAX) * 100) };
  }

  function getArchetype(pct) {
    const t = getT();
    const ratio = pct / 100;
    let arch = t.archetypes.low;
    if (ratio > 0.4 && ratio <= 0.7) arch = t.archetypes.medium;
    if (ratio > 0.7) arch = t.archetypes.high;
    return arch;
  }

  function getFearScore() {
    const score = computeAxisScore('fear', 4);
    if (score === null) return { total: 0, max: FEAR_MAX, pct: 0 };
    return { total: score, max: FEAR_MAX, pct: Math.round((score / FEAR_MAX) * 100) };
  }

  return {
    loadPersisted: loadPersisted,
    setLang: setLang,
    renderWizard: renderWizard,
    finishAxis: finishAxis,
    finishFear: finishFear,
    checkOverallReady: checkOverallReady,
    updateOverallProgress: updateOverallProgress,
    resetTest: resetTest,
    clearAll: clearAll,
    build: build,
    isComplete: isComplete,
    getOverallScore: getOverallScore,
    getArchetype: getArchetype,
    getFearScore: getFearScore,
    COMPLETED_AXES: COMPLETED_AXES,
    userAnswers: userAnswers,
    wizardState: wizardState
  };
})();

window.Quiz = Quiz;
