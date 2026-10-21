// Mind-OS open scales: scores one test page in the browser. Nothing is sent or stored.
// The page carries everything it needs: questions as radio groups q0..qN, data-max, item areas, level blocks.
(function () {
  // Pure scoring, also run by tools/test_scales.mjs, so the tests check exactly the code the pages use.
  // vals: points per answer (0-4); itemAreas: area key per item. Level: <= 40% of the maximum low (0),
  // <= 70% moderate (1), above high (2) - the thresholds stated on the methodology page.
  function score(vals, itemAreas) {
    var max = 4 * vals.length;
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    var ratio = sum / max;
    var per = {}, perMax = {};
    itemAreas.forEach(function (a, i) {
      per[a] = (per[a] || 0) + vals[i];
      perMax[a] = (perMax[a] || 0) + 4;
    });
    var areas = {};
    Object.keys(per).forEach(function (a) { areas[a] = Math.round(per[a] / perMax[a] * 100); });
    return {
      sum: sum, max: max,
      level: ratio <= 0.4 ? 0 : ratio <= 0.7 ? 1 : 2,
      areas: areas,
      same: vals.every(function (v) { return v === vals[0]; })
    };
  }
  window.MindOSScale = { score: score };

  var form = document.getElementById('scaleForm');
  if (!form) return;
  var n = Number(form.dataset.items);
  var itemAreas = JSON.parse(form.dataset.areas);   // item index -> area key
  var result = document.getElementById('scaleResult');
  var missing = document.getElementById('scaleMissing');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var vals = [];
    for (var i = 0; i < n; i++) {
      var checked = form.querySelector('input[name="q' + i + '"]:checked');
      if (!checked) {
        missing.hidden = false;
        var fs = document.getElementById('q' + i);
        fs.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fs.querySelector('input').focus({ preventScroll: true });
        return;
      }
      vals.push(Number(checked.value));
    }
    missing.hidden = true;

    var r = score(vals, itemAreas);
    document.getElementById('scaleScore').textContent = result.dataset.scoreTpl.replace('{score}', r.sum);
    result.querySelectorAll('[data-level]').forEach(function (el) {
      el.hidden = Number(el.dataset.level) !== r.level;
    });
    result.querySelectorAll('[data-area]').forEach(function (row) {
      var pct = r.areas[row.dataset.area];
      row.querySelector('.scale-area-pct').textContent = pct + '%';
      row.querySelector('.scale-area-fill').style.width = pct + '%';
    });

    document.getElementById('scaleSame').hidden = !r.same;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  });

  form.addEventListener('change', function () { missing.hidden = true; });
})();
