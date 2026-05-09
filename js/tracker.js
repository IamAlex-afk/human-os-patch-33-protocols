/* ====== Mind-OS Tracker Module v3.0 ====== */

const Tracker = (function() {
  'use strict';

  const STORAGE_KEY = 'mindos_tracker_v3';

  function getData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  function render() {
    var t = window.I18n ? I18n.t : function(k) { return k; };
    var container = document.getElementById('trackerContainer');
    if (!container) return;

    var data = getData();
    var last7 = data.slice(-7);

    var html = '<div class="tracker-chart">';
    if (last7.length === 0) {
      html += '<p class="no-data">' + (t('noData') || 'No data yet.') + '</p>';
    } else {
      var maxVal = 10;
      html += '<div class="tracker-bars">';
      last7.forEach(function(entry) {
        var pct = (entry.value / maxVal) * 100;
        var barClass = 'tracker-bar';
        if (entry.value <= 3) barClass += ' low';
        else if (entry.value <= 6) barClass += ' mid';
        else barClass += ' high';

        html += '<div class="tracker-entry">' +
          '<div class="tracker-bar-wrap"><div class="' + barClass + '" style="height:' + pct + '%"></div></div>' +
          '<div class="tracker-date">' + formatDate(entry.date) + '</div>' +
          '<div class="tracker-val">' + entry.value + '</div>' +
          '</div>';
      });
      html += '</div>';

      var avg = (last7.reduce(function(a, b) { return a + b.value; }, 0) / last7.length).toFixed(1);
      html += '<p class="tracker-summary">' + (t('trackerSummaryPrefix') || '7-day average: ') + avg + '</p>';

      if (last7.length >= 2) {
        var first = last7[0].value;
        var last = last7[last7.length - 1].value;
        if (last > first + 0.5) html += '<p class="tracker-trend trend-up">' + (t('trendIncreasing') || 'Trending up') + '</p>';
        else if (last < first - 0.5) html += '<p class="tracker-trend trend-down">' + (t('trendDecreasing') || 'Trending down') + '</p>';
        else html += '<p class="tracker-trend trend-stable">' + (t('trendStable') || 'Stable') + '</p>';
      }
    }
    html += '</div>';
    container.innerHTML = html;
  }

  function init() {
    var t = window.I18n ? I18n.t : function(k) { return k; };
    var slider = document.getElementById('trackerSlider');
    var saveBtn = document.getElementById('saveTrackerEntry');
    var resetBtn = document.getElementById('resetTrackerData');
    var valueDisplay = document.getElementById('trackerValueDisplay');

    if (slider && valueDisplay) {
      slider.addEventListener('input', function() {
        valueDisplay.textContent = slider.value;
      });
      valueDisplay.textContent = slider.value;
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        if (!slider) return;
        var val = parseInt(slider.value);
        var data = getData();
        var today = new Date().toISOString().split('T')[0];

        var existing = null;
        for (var i = 0; i < data.length; i++) {
          if (data[i].date === today) { existing = data[i]; break; }
        }
        if (existing) {
          existing.value = val;
        } else {
          data.push({ date: today, value: val });
        }
        saveData(data);
        render();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('Clear all tracker data?')) {
          localStorage.removeItem(STORAGE_KEY);
          render();
        }
      });
    }

    render();
  }

  return { init: init, render: render };
})();

window.Tracker = Tracker;
