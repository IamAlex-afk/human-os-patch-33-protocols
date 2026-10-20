// Mind-OS open scales: scores one test page in the browser. Nothing is sent or stored.
// The page carries everything it needs: questions as radio groups q0..qN, data-max, item areas, level blocks.
(function () {
  var form = document.getElementById('scaleForm');
  if (!form) return;
  var n = Number(form.dataset.items);
  var max = Number(form.dataset.max);
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

    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    var ratio = sum / max;
    var level = ratio <= 0.4 ? 0 : ratio <= 0.7 ? 1 : 2;   // same thresholds as the rest of the site (see methodology)

    document.getElementById('scaleScore').textContent = result.dataset.scoreTpl.replace('{score}', sum);
    result.querySelectorAll('[data-level]').forEach(function (el) {
      el.hidden = Number(el.dataset.level) !== level;
    });

    var per = {}, perMax = {};
    itemAreas.forEach(function (a, i) {
      per[a] = (per[a] || 0) + vals[i];
      perMax[a] = (perMax[a] || 0) + 4;
    });
    result.querySelectorAll('[data-area]').forEach(function (row) {
      var a = row.dataset.area;
      var pct = Math.round(per[a] / perMax[a] * 100);
      row.querySelector('.scale-area-pct').textContent = pct + '%';
      row.querySelector('.scale-area-fill').style.width = pct + '%';
    });

    document.getElementById('scaleSame').hidden = !vals.every(function (v) { return v === vals[0]; });
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  });

  form.addEventListener('change', function () { missing.hidden = true; });
})();
