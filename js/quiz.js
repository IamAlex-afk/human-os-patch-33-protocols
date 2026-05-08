/* ====== Mind-OS Quiz Engine v3.0 ====== */
/* UTF-8. Uses I18n for all strings. Supports 16 languages. */

const Quiz = (function() {
  'use strict';

  const { STORAGE_KEYS, MAX_AXIS, TOTAL_MAX, FEAR_MAX } = window.CONFIG || {};
  const MAX_PER_AXIS = MAX_AXIS || 32;

  let state = {};

  function getAnswers(axis) {
    return window.Storage ? Storage.get(STORAGE_KEYS.TEST_ANSWERS + '_' + axis) || [] : [];
  }

  function saveAnswers(axis, arr) {
    if (window.Storage) Storage.set(STORAGE_KEYS.TEST_ANSWERS + '_' + axis, arr);
  }

  function clearAll() {
    ['q1', 'q2', 'q3', 'fearQ'].forEach(function(axis) {
      if (window.Storage) Storage.remove(STORAGE_KEYS.TEST_ANSWERS + '_' + axis);
    });
    state = {};
  }

  function build(axis, containerId, progressId, resultId, maxScore) {
    const container = document.getElementById(containerId);
    const progressEl = document.getElementById(progressId);
    const resultEl = document.getElementById(resultId);
    if (!container) return;

    const questions = window.I18n ? I18n.getQuestions(axis) : [];
    const reverseKeys = window.I18n ? I18n.getReverseKeys(axis) : [];
    const options = window.I18n ? I18n.getOptions() : ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
    const isFear = (axis === 'fearQ');
    const max = maxScore || (isFear ? FEAR_MAX : MAX_PER_AXIS);

    let answers = getAnswers(axis);
    let step = answers.length;

    function render() {
      container.innerHTML = '';
      if (progressEl) progressEl.innerHTML = '';

      if (step < questions.length) {
        const qText = questions[step];
        const qDiv = document.createElement('div');
        qDiv.className = 'question';

        const qNum = document.createElement('p');
        qNum.className = 'progress-text';
        qNum.textContent = (window.I18n ? I18n.t('progressText', { answered: step + 1, total: questions.length }) : 'Question ' + (step + 1));
        qDiv.appendChild(qNum);

        const qTextEl = document.createElement('h4');
        qTextEl.textContent = qText;
        qDiv.appendChild(qTextEl);

        const optsDiv = document.createElement('div');
        optsDiv.className = 'options';
        options.forEach(function(opt, idx) {
          const label = document.createElement('label');
          label.className = 'option-label';
          const input = document.createElement('input');
          input.type = 'radio';
          input.name = axis + '_q' + step;
          input.value = idx;
          input.checked = (answers[step] !== undefined && answers[step] === idx);
          input.addEventListener('change', function() {
            answers[step] = idx;
            saveAnswers(axis, answers);
          });
          label.appendChild(input);
          label.appendChild(document.createTextNode(' ' + opt));
          optsDiv.appendChild(label);
        });
        qDiv.appendChild(optsDiv);

        const btnDiv = document.createElement('div');
        btnDiv.style.marginTop = '1.5rem';
        btnDiv.style.display = 'flex';
        btnDiv.style.gap = '1rem';
        btnDiv.style.flexWrap = 'wrap';

        if (step > 0) {
          const prevBtn = document.createElement('button');
          prevBtn.className = 'btn-nav';
          prevBtn.textContent = window.I18n ? I18n.t('prevBtn') : '← Back';
          prevBtn.addEventListener('click', function() {
            step--;
            render();
          });
          btnDiv.appendChild(prevBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-submit';
        nextBtn.textContent = (step === questions.length - 1)
          ? (window.I18n ? I18n.t('submitBtn') : 'Get Result')
          : (window.I18n ? I18n.t('nextBtn') : 'Next →');
        nextBtn.addEventListener('click', function() {
          if (answers[step] === undefined) {
            alert(window.I18n ? I18n.t('alertIncomplete') : 'Please answer the current question.');
            return;
          }
          step++;
          if (step >= questions.length) {
            saveAnswers(axis, answers);
            showResult();
          } else {
            render();
          }
        });
        btnDiv.appendChild(nextBtn);
        qDiv.appendChild(btnDiv);
        container.appendChild(qDiv);

        if (progressEl) {
          const pct = Math.round((step / questions.length) * 100);
          progressEl.innerHTML = '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
        }
        updateOverallProgress();
      } else {
        showResult();
      }
    }

    function showResult() {
      const score = computeScore(axis, answers, reverseKeys);
      const pct = Math.round((score / max) * 100);

      if (resultEl) {
        const level = getLevel(pct);
        const levelData = window.I18n ? I18n.raw('fearLevels') || {} : {};
        let label, advice;
        if (isFear && levelData && levelData[level]) {
          label = levelData[level].name;
          advice = levelData[level].advice;
        } else {
          label = (window.I18n ? I18n.t('scoreLabel') : 'Score') + ': ' + score + '/' + max;
          advice = '';
        }
        resultEl.innerHTML = '<div class="result-card">' +
          '<h3>' + (isFear ? (window.I18n ? I18n.t('fearResultTitle') : 'Fear Index') : (window.I18n ? I18n.t('scoreLabel') : 'Score')) + ': ' + score + '/' + max + '</h3>' +
          '<p>' + (isFear ? label : pct + '%') + '</p>' +
          (advice ? '<p class="advice">' + advice + '</p>' : '') +
          '</div>';
        resultEl.style.display = 'block';
      }
      if (window.Storage) Storage.set(STORAGE_KEYS.TEST_COMPLETED + '_' + axis, true);
      container.innerHTML = '<p class="completed-msg">' + (window.I18n ? I18n.t('overallProgressText', { answered: questions.length, total: questions.length }) : 'Completed') + '</p>';
      updateOverallProgress();
    }

    function getLevel(pct) {
      if (pct < 25) return 'low';
      if (pct < 50) return 'medium';
      if (pct < 75) return 'high';
      return 'veryHigh';
    }

    if (step >= questions.length && answers.length >= questions.length) {
      showResult();
    } else {
      render();
    }
  }

  function computeScore(axis, answers, reverseKeys) {
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === undefined) continue;
      let val = answers[i];
      if (reverseKeys && reverseKeys.includes(i)) val = 4 - val;
      total += val;
    }
    return total;
  }

  function getOverallScore() {
    const axes = ['q1', 'q2', 'q3'];
    let grandTotal = 0, grandMax = 0;
    axes.forEach(function(axis) {
      const questions = window.I18n ? I18n.getQuestions(axis) : [];
      const reverseKeys = window.I18n ? I18n.getReverseKeys(axis) : [];
      const answers = getAnswers(axis);
      const max = questions.length * 4;
      const score = computeScore(axis, answers, reverseKeys);
      grandTotal += score;
      grandMax += max;
    });
    return { total: grandTotal, max: grandMax, pct: grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0 };
  }

  function getFearScore() {
    const questions = window.I18n ? I18n.getQuestions('fearQ') : [];
    const answers = getAnswers('fearQ');
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] !== undefined) total += answers[i];
    }
    const max = questions.length * 4;
    return { total, max, pct: max > 0 ? Math.round((total / max) * 100) : 0 };
  }

  function updateOverallProgress() {
    const axes = ['q1', 'q2', 'q3', 'fearQ'];
    let totalAnswered = 0, totalQuestions = 0;
    axes.forEach(function(axis) {
      const questions = window.I18n ? I18n.getQuestions(axis) : [];
      const answers = getAnswers(axis);
      totalQuestions += questions.length;
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] !== undefined) totalAnswered++;
      }
    });
    const fill = document.getElementById('overallProgressFill');
    const label = document.getElementById('overallProgressLabel');
    const count = document.getElementById('overallProgressCount');
    if (fill) fill.style.width = (totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0) + '%';
    if (label && window.I18n) label.textContent = I18n.t('overallProgressLabel');
    if (count) count.textContent = totalAnswered + ' / ' + totalQuestions;
  }

  function isComplete() {
    const axes = ['q1', 'q2', 'q3'];
    return axes.every(function(axis) {
      const questions = window.I18n ? I18n.getQuestions(axis) : [];
      const answers = getAnswers(axis);
      return answers.length >= questions.length && answers.every(function(a) { return a !== undefined; });
    });
  }

  function getArchetype(pct) {
    const archetypes = window.I18n ? I18n.raw('archetypes') || {} : {};
    if (pct < 33) return archetypes.low || { name: 'Digital Zen Master', advice: 'You maintain cognitive sovereignty.' };
    if (pct < 66) return archetypes.medium || { name: 'Balanced Navigator', advice: 'You lean on AI without losing yourself.' };
    return archetypes.high || { name: 'AI-Dependent Delegate', advice: 'You outsource much thinking to AI. Try a digital detox.' };
  }

  return {
    build, clearAll, getOverallScore, getFearScore, isComplete, getArchetype, updateOverallProgress
  };
})();

window.Quiz = Quiz;
