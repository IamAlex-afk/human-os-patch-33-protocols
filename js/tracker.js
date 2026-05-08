/* ====== Mind-OS Tracker Module v3.0 ====== */
/* UTF-8. Daily cognitive load logging with 7-day chart. i18n-aware. */

const Tracker = (function() {
  'use strict';

  const { STORAGE_KEYS } = window.CONFIG || {};

  function getData() {
    return window.Storage ? (Storage.get(STORAGE_KEYS.TRACKER) || []) : [];
  }

  function saveData(data) {
    if (window.Storage) Storage.set(STORAGE_KEYS.TRACKER, data);
  }

  function todayStr() {
    var d = new Date();
    return d.toISOString().split('T')[0];
  }

  function formatDate(s) {
    var parts = s.split('-');
    return parts[2] + '.' + parts[1];
  }

  function addEntry(score) {
    var data = getData();
    var today = todayStr();
    var found = false;
    for (var i = 0; i < data.length; i++) {
      if (data[i].date === today) {
        data[i].score = score;
        found = true;
        break;
      }
    }
    if (!found) data.push({ date: today, score: score });
    if (data.length > 30) data = data.slice(-30);
    saveData(data);
    render();
  }

  function clearData() {
    if (window.Storage) Storage.remove(STORAGE_KEYS.TRACKER);
    render();
  }

  function render() {
    var data = getData();
    var container = document.getElementById('trackerChartContainer');
    var summary = document.getElementById('trackerSummary');
    var t = window.I18n ? I18n.t : function(k, v) { return k; };

    if (!data || data.length === 0) {
      if (container) container.innerHTML = '<p class="no-data">' + t('noData') + '</p>';
      if (summary) summary.innerHTML = '';
      return;
    }

    var last7 = data.slice(-7);
    var avg = last7.reduce(function(s, e) { return s + e.score; }, 0) / last7.length;

    var trendMsg = '';
    if (last7.length >= 3) {
      var half = Math.floor(last7.length / 2);
      var fAvg = last7.slice(0, half).reduce(function(s, e) { return s + e.score; }, 0) / half;
      var sAvg = last7.slice(half).reduce(function(s, e) { return s + e.score; }, 0) / (last7.length - half);
      if (sAvg > fAvg + 0.5) trendMsg = t('trendIncreasing');
      else if (sAvg < fAvg - 0.5) trendMsg = t('trendDecreasing');
      else trendMsg = t('trendStable');
    }

    if (container) {
      var html = '<div class="chart-wrapper">';
      html += '<div class="chart-row"><span class="chart-label">10</span>';
      for (var i = 0; i < last7.length; i++) {
        html += '<span class="chart-bar ' + (last7[i].score >= 10 ? 'filled' : 'empty') + '"></span>';
      }
      html += '</div>';
      for (var row = 8; row >= 0; row -= 2) {
        html += '<div class="chart-row"><span class="chart-label">' + row + '</span>';
        for (var i = 0; i < last7.length; i++) {
          html += '<span class="chart-bar ' + (last7[i].score >= row ? 'filled' : 'empty') + '"></span>';
        }
        html += '</div>';
      }
      html += '<div class="chart-row"><span class="chart-label"></span>';
      for (var i = 0; i < last7.length; i++) {
        html += '<span class="chart-date">' + formatDate(last7[i].date) + '</span>';
      }
      html += '</div></div>';
      container.innerHTML = html;
    }

    if (summary) {
      summary.innerHTML = '<p><strong>' + t('trackerSummaryPrefix') + '</strong>' + avg.toFixed(1) + '/10</p>' +
        (trendMsg ? '<p class="trend">' + trendMsg + '</p>' : '');
    }
  }

  function init() {
    var slider = document.getElementById('trackerScore');
    var display = document.getElementById('trackerValueDisplay');
    var saveBtn = document.getElementById('saveTrackerEntry');
    var resetBtn = document.getElementById('resetTrackerData');

    if (slider && display) {
      slider.addEventListener('input', function() { display.textContent = this.value; });
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        var score = slider ? parseInt(slider.value, 10) : 5;
        addEntry(score);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm(window.I18n ? I18n.t('resetBtn') + '?' : 'Reset all data?')) {
          clearData();
        }
      });
    }
    render();
  }

  return { init, addEntry, clearData, render };
})();

window.Tracker = Tracker;
