// Mind-OS open scales: scores one test page in the browser. Nothing is sent or stored.
// The page carries everything it needs: questions as radio groups q0..qN, data-max, item areas, level blocks.
(function () {
  // Pure scoring, also run by the scoring tests, so the tests check exactly the code the pages use.
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

  // 'Share my result as a picture': drawn here on a canvas, shared through the phone's share sheet or downloaded.
  var shareBox = document.getElementById('scaleShareBox'), shareBtn = document.getElementById('scaleShare');
  function wrap(ctx, text, x, y, maxW, lh) {          // breaks at spaces, or between characters (Japanese, Thai)
    var line = '', lastSpace = -1;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], test = line + ch;
      if (ch === ' ') lastSpace = line.length;
      if (ctx.measureText(test).width > maxW && line) {
        if (lastSpace > 0) { ctx.fillText(line.slice(0, lastSpace), x, y); line = line.slice(lastSpace + 1) + ch; }
        else { ctx.fillText(line, x, y); line = ch === ' ' ? '' : ch; }
        y += lh; lastSpace = line.lastIndexOf(' ');
      } else line = test;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }
  function draw() {
    var W = 1080, H = 1350, P = 80, c = document.createElement('canvas'); c.width = W; c.height = H;
    var x = c.getContext('2d'), F = 'Inter, system-ui, sans-serif', accent = '#00e57a';
    x.fillStyle = '#0a0f0c'; x.fillRect(0, 0, W, H);
    x.strokeStyle = accent; x.lineWidth = 6; x.strokeRect(24, 24, W - 48, H - 48);
    x.textBaseline = 'top';
    x.fillStyle = accent; x.font = '700 44px ' + F; x.fillText('Mind-OS', P, P);
    var title = document.querySelector('.scale-page h1, .scale-home-title');
    x.fillStyle = '#ffffff'; x.font = '800 64px ' + F;
    var y = wrap(x, title ? title.textContent.trim() : '', P, P + 90, W - 2 * P, 76) + 30;
    x.fillStyle = accent; x.font = '700 56px ' + F; x.fillText(document.getElementById('scaleScore').textContent, P, y); y += 90;
    var lv = result.querySelector('[data-level]:not([hidden]) .scale-level');
    x.fillStyle = '#ffffff'; x.font = '600 46px ' + F; y = wrap(x, lv ? lv.textContent : '', P, y, W - 2 * P, 58) + 40;
    result.querySelectorAll('[data-area]').forEach(function (row) {
      var name = row.querySelector('.scale-area-name').textContent, pct = row.querySelector('.scale-area-pct').textContent;
      x.fillStyle = '#dfe7e2'; x.font = '500 36px ' + F; x.fillText(name, P, y);
      x.textAlign = 'right'; x.fillText(pct, W - P, y); x.textAlign = 'left';
      x.fillStyle = '#1f2a24'; x.fillRect(P, y + 52, W - 2 * P, 18);
      x.fillStyle = accent; x.fillRect(P, y + 52, (W - 2 * P) * (parseInt(pct, 10) || 0) / 100, 18);
      y += 110;
    });
    x.fillStyle = accent; x.font = '600 30px ' + F; x.fillText(shareBox.dataset.site, P, H - P - 80);
    x.fillStyle = '#9fb0a6'; x.font = '400 28px ' + F; x.fillText(shareBox.dataset.cta, P, H - P - 36);
    return c;
  }
  shareBtn.addEventListener('click', function () {
    var go = function () {
      draw().toBlob(function (blob) {
        if (!blob) return;
        var name = shareBox.dataset.file + '.png';
        var file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file] }).catch(function () {});
        } else {
          var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        }
      }, 'image/png');
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  });
})();
