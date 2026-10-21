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
    var areas = {}, top = null;
    Object.keys(per).forEach(function (a) {
      areas[a] = Math.round(per[a] / perMax[a] * 100);
      if (top === null || areas[a] > areas[top]) top = a;   // the 7-day plan follows the highest area (first one on a tie)
    });
    return {
      top: top,
      sum: sum, max: max,
      level: ratio <= 0.4 ? 0 : ratio <= 0.7 ? 1 : 2,
      areas: areas,
      same: vals.every(function (v) { return v === vals[0]; })
    };
  }
  // What "Save on this device" keeps (only when the visitor presses it): date, total, area shares - never the answers.
  function record(r, date) { return { d: date, s: r.sum, a: r.areas }; }
  window.MindOSScale = { score: score, record: record };

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

    result.querySelectorAll('[data-plan]').forEach(function (el) { el.hidden = el.dataset.plan !== r.top; });
    document.getElementById('scaleSame').hidden = !r.same;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    result.focus({ preventScroll: true });
  });

  form.addEventListener('change', function () { missing.hidden = true; });

  // Opt-in saving for a later comparison; storage may be unavailable (private mode), then the buttons just say nothing.
  var KEY = 'mindos-results-' + form.dataset.test;
  var box = document.getElementById('scaleSaveBox');
  var saveBtn = document.getElementById('scaleSave'), forgetBtn = document.getElementById('scaleForget');
  var msg = document.getElementById('scaleSaveMsg'), cmp = document.getElementById('scaleCompare');
  var last = null;
  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function today() {
    var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  }
  function showDate(d) {
    var p = d.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString(document.documentElement.lang || undefined);
  }
  form.addEventListener('submit', function () {
    var checked = form.querySelectorAll('input:checked');
    if (checked.length !== n) return;                // incomplete form: no result to compare or save
    var list = load(), prev = list[list.length - 1];
    last = window.MindOSScale.score(Array.prototype.map.call(checked, function (i) { return Number(i.value); }), itemAreas);
    if (prev && typeof prev.s === 'number') {
      var dlt = last.sum - prev.s;
      var diff = dlt === 0 ? box.dataset.same : (dlt < 0 ? box.dataset.lower : box.dataset.higher).replace('{n}', Math.abs(dlt));
      cmp.textContent = box.dataset.prev.replace('{date}', showDate(prev.d)).replace('{old}', prev.s).replace('{now}', last.sum).replace('{diff}', diff);
      cmp.hidden = false;
    } else cmp.hidden = true;
    saveBtn.disabled = false; msg.textContent = '';
    forgetBtn.hidden = list.length === 0;
  });
  saveBtn.addEventListener('click', function () {
    if (!last) return;
    var list = load(); list.push(window.MindOSScale.record(last, today()));
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-10))); } catch (e) { return; }
    msg.textContent = box.dataset.saved; saveBtn.disabled = true; forgetBtn.hidden = false;
  });
  forgetBtn.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    msg.textContent = box.dataset.forgotten; forgetBtn.hidden = true; cmp.hidden = true; saveBtn.disabled = false;
  });
})();
