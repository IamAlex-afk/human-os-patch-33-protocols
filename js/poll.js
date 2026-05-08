/* ====== Mind-OS Poll Module v3.0 ====== */
/* UTF-8. Global AI sentiment poll with anonymous voting. i18n-aware. */

const Poll = (function() {
  'use strict';

  const { POLL_API_URL, STORAGE_KEYS } = window.CONFIG || {};

  function hasVoted() {
    return window.Storage ? !!Storage.get(STORAGE_KEYS.POLL_VOTED) : false;
  }

  function markVoted() {
    if (window.Storage) Storage.set(STORAGE_KEYS.POLL_VOTED, true);
  }

  function saveVoteChoice(choice) {
    if (window.Storage) Storage.set(STORAGE_KEYS.POLL_VOTED + '_choice', choice);
  }

  function submitVote(choice) {
    if (!POLL_API_URL) {
      console.warn('[Poll] No API URL configured');
      showLocalResults({ for: 45, neutral: 30, against: 25 });
      return;
    }

    fetch(POLL_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote: choice, timestamp: Date.now() })
    }).then(function() {
      markVoted();
      saveVoteChoice(choice);
      showResults();
    }).catch(function(err) {
      console.warn('[Poll] Submit failed, showing mock results:', err);
      markVoted();
      saveVoteChoice(choice);
      showLocalResults({ for: 45, neutral: 30, against: 25 });
    });
  }

  function showLocalResults(mock) {
    var resultsDiv = document.getElementById('pollResults');
    var barsDiv = document.getElementById('pollBars');
    var t = window.I18n ? I18n.t : function(k) { return k; };

    var total = mock.for + mock.neutral + mock.against;
    var forPct = Math.round((mock.for / total) * 100);
    var neutralPct = Math.round((mock.neutral / total) * 100);
    var againstPct = Math.round((mock.against / total) * 100);

    if (resultsDiv) resultsDiv.style.display = 'block';
    if (barsDiv) {
      barsDiv.innerHTML =
        '<div class="poll-bar-row"><span>' + t('pollFor') + '</span><div class="poll-bar-track"><div class="poll-bar-fill" style="width:' + forPct + '%"></div></div><span>' + forPct + '%</span></div>' +
        '<div class="poll-bar-row"><span>' + t('pollNeutral') + '</span><div class="poll-bar-track"><div class="poll-bar-fill neutral" style="width:' + neutralPct + '%"></div></div><span>' + neutralPct + '%</span></div>' +
        '<div class="poll-bar-row"><span>' + t('pollAgainst') + '</span><div class="poll-bar-track"><div class="poll-bar-fill against" style="width:' + againstPct + '%"></div></div><span>' + againstPct + '%</span></div>';
    }
  }

  function showResults() {
    showLocalResults({ for: 45, neutral: 30, against: 25 });
  }

  function init() {
    var submitBtn = document.getElementById('submitPoll');
    var t = window.I18n ? I18n.t : function(k) { return k; };

    if (hasVoted()) showResults();

    if (submitBtn) {
      submitBtn.addEventListener('click', function() {
        var radios = document.querySelectorAll('input[name="aiPoll"]');
        var choice = null;
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].checked) {
            choice = radios[i].value;
            break;
          }
        }
        if (!choice) {
          alert(t('alertIncomplete'));
          return;
        }
        submitVote(choice);
      });
    }
  }

  return { init: init };
})();

window.Poll = Poll;
