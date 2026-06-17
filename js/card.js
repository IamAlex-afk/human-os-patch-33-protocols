/* ====== Mind-OS Result Card Generator ======
   Draws multilingual PNG result card on Canvas.
   Isolated, try/catch protected — does not affect other code.
*/
(function() {
  function detectLang() {
    return document.documentElement.lang || 'en';
  }

  function getAxisScores() {
    const texts = document.querySelectorAll('#radarHolder svg text');
    const pcts = [];
    texts.forEach(function(t) {
      const m = (t.textContent || '').match(/^(\d+)%$/);
      if (m) pcts.push(parseInt(m[1], 10));
    });
    return pcts;
  }

  function drawCard() {
    try {
      const lang = detectLang();
      const t = (window.getT ? window.getT(lang) : null) || (window.translations && window.translations.en) || {};

      const archEl = document.getElementById('overallArchetype');
      const archetype = archEl && archEl.textContent ? archEl.textContent.trim() : 'AI Identity';
      const pcts = getAxisScores();

      const W = 1200, H = 630;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const fontStack = lang === 'ja'
        ? '"Noto Sans JP", "Yu Gothic", "Meiryo", Inter, system-ui, sans-serif'
        : 'Inter, system-ui, sans-serif';

      // Background
      ctx.fillStyle = '#0b100d';
      ctx.fillRect(0, 0, W, H);
      // Border
      ctx.strokeStyle = '#00e57a';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      // Title
      const cardTitle = t.cardTitle || 'Mind-OS — AI Dependency Profile';
      ctx.fillStyle = '#b4cec0';
      ctx.font = '600 30px ' + fontStack;
      ctx.textAlign = 'left';
      ctx.fillText(cardTitle, 70, 95);

      // Archetype
      ctx.fillStyle = '#00e57a';
      ctx.font = '700 64px ' + fontStack;
      const maxW = W - 140;
      let line = archetype;
      while (ctx.measureText(line).width > maxW && line.length > 4) {
        line = line.slice(0, -2);
      }
      ctx.fillText(line === archetype ? archetype : line + '…', 70, 185);

      // Axis bars with translated labels
      const labels = [
        t.axis1Title || 'Thinking & Memory',
        t.axis2Title || 'Anxiety & Attachment',
        t.axis3Title || 'Digital Burnout'
      ];
      const barX = 70, barW = W - 320, barH = 34, gap = 70;
      let y = 280;
      for (let i = 0; i < 3; i++) {
        const pct = pcts[i] != null ? pcts[i] : 0;
        ctx.fillStyle = '#ecf7f0';
        ctx.font = '600 26px ' + fontStack;
        ctx.textAlign = 'left';
        ctx.fillText(labels[i], barX, y - 12);
        ctx.fillStyle = '#1f3027';
        ctx.fillRect(barX, y, barW, barH);
        ctx.fillStyle = '#00e57a';
        ctx.fillRect(barX, y, barW * Math.min(pct, 100) / 100, barH);
        ctx.fillStyle = '#ecf7f0';
        ctx.font = '700 26px ' + fontStack;
        ctx.textAlign = 'left';
        ctx.fillText(pct + '%', barX + barW + 20, y + 27);
        y += gap;
      }

      // Bottom tagline + URL
      const tagline = t.cardTagline || 'Free · Anonymous · No signup';
      ctx.fillStyle = '#b4cec0';
      ctx.font = '400 24px ' + fontStack;
      ctx.textAlign = 'left';
      ctx.fillText(tagline, 70, H - 55);
      ctx.fillStyle = '#00e57a';
      ctx.font = '600 22px ' + fontStack;
      ctx.textAlign = 'right';
      ctx.fillText('iamalex-afk.github.io/human-os-patch-33-protocols', W - 70, H - 55);

      canvas.toBlob(function(blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind-os-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      }, 'image/png');
    } catch (err) {
      console.warn('[card] generation failed:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('downloadCardBtn');
    if (btn) btn.addEventListener('click', drawCard);
  });
})();
