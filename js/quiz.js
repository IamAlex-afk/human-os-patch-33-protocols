[09.05.2026 10:01] Alex Vietnam: /* ====== Mind-OS Quiz Engine v3.1 ====== */
/* Safely handles missing CONFIG, Storage, I18n. */

const Quiz = (function() {
  'use strict';

  const CONFIG = window.CONFIG || {};
  const STORAGE_KEYS = CONFIG.STORAGE_KEYS || {
    TEST_ANSWERS: 'mindos_answers',
    TEST_COMPLETED: 'mindos_completed'
  };
  const MAX_AXIS = CONFIG.MAX_AXIS || 32;
  const FEAR_MAX = CONFIG.FEAR_MAX || 32;

  const Store = {
    _ok: !!(window.Storage && window.Storage.get && window.Storage.set),
    get(key) { return this._ok ? window.Storage.get(key) || [] : []; },
    set(key, val) { if (this._ok) window.Storage.set(key, val); },
    remove(key) { if (this._ok) window.Storage.remove(key); }
  };

  const I18N = {
    _ok: !!(window.I18n),
    t(key, params) { return this._ok ? window.I18n.t(key, params) : key; },
    raw(key) { return this._ok ? window.I18n.raw(key) || {} : {}; },
    getQuestions(axis) {
      if (this._ok) return window.I18n.getQuestions(axis) || [];
      if (axis === 'q1') return [
        'I rely on AI for memory recall',
        'I let AI complete my sentences',
        'I feel uneasy without AI access',
        'AI organises my schedule',
        'I trust AI suggestions blindly',
        'I prefer AI over human advice',
        'I check facts after AI gives answer',
        'I outsource thinking to AI'
      ];
      if (axis === 'fearQ') return [
        'I worry AI will replace me',
        'I fear AI surpassing humans',
        'AI makes me anxious',
        'I feel threatened by AI progress',
        'I am concerned about AI ethics',
        'I believe AI should be restricted'
      ];
      return ['Question 1','Question 2','Question 3','Question 4','Question 5','Question 6','Question 7','Question 8'];
    },
    getReverseKeys(axis) {
      if (this._ok && typeof window.I18n.getReverseKeys === 'function')
        return window.I18n.getReverseKeys(axis) || [];
      return [];
    },
    getOptions() {
      if (this._ok && typeof window.I18n.getOptions === 'function')
        return window.I18n.getOptions();
      return ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
    }
  };

  let state = {};

  function getAnswers(axis) {
    return Store.get(STORAGE_KEYS.TEST_ANSWERS + '_' + axis);
  }

  function saveAnswers(axis, arr) {
    Store.set(STORAGE_KEYS.TEST_ANSWERS + '_' + axis, arr);
  }

  function clearAll() {
    ['q1', 'q2', 'q3', 'fearQ'].forEach(function(axis) {
      Store.remove(STORAGE_KEYS.TEST_ANSWERS + '_' + axis);
    });
    state = {};
  }

  function build(axis, containerId, progressId, resultId, maxScore) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const questions = I18N.getQuestions(axis);
    const reverseKeys = I18N.getReverseKeys(axis);
    const options = I18N.getOptions();
    const isFear = (axis === 'fearQ');
    const max = maxScore || (isFear ? FEAR_MAX : MAX_AXIS);

    let answers = getAnswers(axis);
    let step = answers.length;

    function render() {
      container.innerHTML = '';

      if (step < questions.length) {
        const qText = questions[step];
        const qDiv = document.createElement('div');
        qDiv.className = 'question';

        const qNum = document.createElement('p');
        qNum.className = 'progress-text';
        qNum.textContent = I18N.t('progressText', { answered: step+1, total: questions.length });
        qDiv.appendChild(qNum);

        const qTextEl = document.createElement('h4');
        qTextEl.textContent = qText;
        qDiv.appendChild(qTextEl);

        const optsDiv = document.createElement('div');
        optsDiv.className = 'options';
        options.forEach(function(opt, idx) {
          const label = document.createElement('label');
          label.className = 'option-label';
[09.05.2026 10:01] Alex Vietnam: const input = document.createElement('input');
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
          prevBtn.textContent = I18N.t('prevBtn') || '← Back';
          prevBtn.addEventListener('click', function() {
            step--;
            render();
          });
          btnDiv.appendChild(prevBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-submit';
        if (step === questions.length - 1) {
          nextBtn.textContent = I18N.t('submitBtn') || 'Get Result';
        } else {
          nextBtn.textContent = I18N.t('nextBtn') || 'Next →';
        }
        nextBtn.addEventListener('click', function() {
          if (answers[step] === undefined) {
            alert(I18N.t('alertIncomplete') || 'Please answer the current question.');
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

        const progressEl = document.getElementById(progressId);
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
      const score = computeScore(answers, reverseKeys);
      const pct = Math.round((score / max) * 100);

      const resultEl = document.getElementById(resultId);
      if (resultEl) {
        const level = getLevel(pct);
        const levelData = I18N.raw('fearLevels');
        let label = '', advice = '';
        if (isFear && levelData[level]) {
          label = levelData[level].name || '';
          advice = levelData[level].advice || '';
        } else {
          label = (I18N.t('scoreLabel') || 'Score') + ': ' + score + '/' + max;
        }
        resultEl.innerHTML = '<div class="result-card">' +
          '<h3>' + (isFear ? (I18N.t('fearResultTitle')  'Fear Index') : (I18N.t('scoreLabel')  'Score')) + ': ' + score + '/' + max + '</h3>' +
          '<p>' + (isFear ? label : pct + '%') + '</p>' +
          (advice ? '<p class="advice">' + advice + '</p>' : '') +
          '</div>';
        resultEl.style.display = 'block';
      }

      Store.set(STORAGE_KEYS.TEST_COMPLETED + '_' + axis, true);
      container.innerHTML = '<p class="completed-msg">' + I18N.t('overallProgressText', { answered: questions.length, total: questions.length }) + '</p>';
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
[09.05.2026 10:01] Alex Vietnam: function computeScore(answers, reverseKeys) {
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] === undefined) continue;
      let val = Number(answers[i]);
      if (reverseKeys.includes(i)) val = 4 - val;
      total += val;
    }
    return total;
  }

  function getOverallScore() {
    const axes = ['q1', 'q2', 'q3'];
    let grandTotal = 0, grandMax = 0;
    axes.forEach(function(axis) {
      const questions = I18N.getQuestions(axis);
      const reverseKeys = I18N.getReverseKeys(axis);
      const answers = getAnswers(axis);
      const max = questions.length * 4;
      const score = computeScore(answers, reverseKeys);
      grandTotal += score;
      grandMax += max;
    });
    return { total: grandTotal, max: grandMax, pct: grandMax > 0 ? Math.round((grandTotal / grandMax) * 100) : 0 };
  }

  function getFearScore() {
    const questions = I18N.getQuestions('fearQ');
    const answers = getAnswers('fearQ');
    let total = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] !== undefined) total += Number(answers[i]);
    }
    const max = questions.length * 4;
    return { total, max, pct: max > 0 ? Math.round((total / max) * 100) : 0 };
  }

  function updateOverallProgress() {
    const axes = ['q1', 'q2', 'q3', 'fearQ'];
    let totalAnswered = 0, totalQuestions = 0;
    axes.forEach(function(axis) {
      const questions = I18N.getQuestions(axis);
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
    if (label) label.textContent = I18N.t('overallProgressLabel') || 'Assessment Progress';
    if (count) count.textContent = totalAnswered + ' / ' + totalQuestions;
  }

  function isComplete() {
    const axes = ['q1', 'q2', 'q3'];
    return axes.every(function(axis) {
      const questions = I18N.getQuestions(axis);
      const answers = getAnswers(axis);
      return answers.length >= questions.length && answers.every(function(a) { return a !== undefined; });
    });
  }

  function getArchetype(pct) {
    const archetypes = I18N.raw('archetypes');
    if (pct < 33) return archetypes.low || { name: 'Digital Zen Master', advice: 'You maintain cognitive sovereignty.' };
    if (pct < 66) return archetypes.medium || { name: 'Balanced Navigator', advice: 'You lean on AI without losing yourself.' };
    return archetypes.high || { name: 'AI-Dependent Delegate', advice: 'You outsource much thinking to AI. Try a digital detox.' };
  }

  return {
    build, clearAll, getOverallScore, getFearScore, isComplete, getArchetype, updateOverallProgress
  };
})();

window.Quiz = Quiz;
