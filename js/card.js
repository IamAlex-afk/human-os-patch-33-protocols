/* ====== Mind-OS Result Card Generator ======
   Рисует PNG-карточку результата на Canvas и скачивает.
   Изолирован, защищён try/catch — не влияет на остальной код.
*/
(function() {
  function getAxisScores() {
    // Читаем проценты с радара (data) или из текста — берём из overallArchetype контекста
    // Безопасно достаём 3 значения из подписей радара
    const texts = document.querySelectorAll('#radarHolder svg text');
    const pcts = [];
    texts.forEach(t => {
      const m = (t.textContent || '').match(/^(\d+)%$/);
      if (m) pcts.push(parseInt(m[1], 10));
    });
    return pcts; // [a1%, a2%, a3%] или []
  }

  function drawCard() {
    try {
      const archEl = document.getElementById('overallArchetype');
      const archetype = archEl && archEl.textContent ? archEl.textContent.trim() : 'AI Identity';
      const pcts = getAxisScores();

      const W = 1200, H = 630;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Фон
      ctx.fillStyle = '#0b100d';
      ctx.fillRect(0, 0, W, H);
      // Рамка-акцент
      ctx.strokeStyle = '#00e57a';
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      // Заголовок
      ctx.fillStyle = '#b4cec0';
      ctx.font = '600 30px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Mind-OS — AI Dependency Profile', 70, 95);

      // Архетип
      ctx.fillStyle = '#00e57a';
      ctx.font = '700 64px Inter, system-ui, sans-serif';
      // Перенос если длинный
      const maxW = W - 140;
      let line = archetype;
      while (ctx.measureText(line).width > maxW && line.length > 4) {
        line = line.slice(0, -2);
      }
      ctx.fillText(line === archetype ? archetype : line + '…', 70, 185);

      // Три оси (бары)
      const labels = ['Thinking & Memory', 'Anxiety & Attachment', 'Digital Burnout'];
      const barX = 70, barW = W - 320, barH = 34, gap = 70;
      let y = 280;
      for (let i = 0; i < 3; i++) {
        const pct = pcts[i] != null ? pcts[i] : 0;
        ctx.fillStyle = '#ecf7f0';
        ctx.font = '600 26px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(labels[i], barX, y - 12);
        // Track
        ctx.fillStyle = '#1f3027';
        ctx.fillRect(barX, y, barW, barH);
        // Fill
        ctx.fillStyle = '#00e57a';
        ctx.fillRect(barX, y, barW * Math.min(pct, 100) / 100, barH);
        // %
        ctx.fillStyle = '#ecf7f0';
        ctx.font = '700 26px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(pct + '%', barX + barW + 20, y + 27);
        y += gap;
      }

      // Низ — призыв
      ctx.fillStyle = '#b4cec0';
      ctx.font = '400 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Free · Anonymous · No signup', 70, H - 55);
      ctx.fillStyle = '#00e57a';
      ctx.font = '600 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('iamalex-afk.github.io/human-os-patch-33-protocols', W - 70, H - 55);

      // Скачивание
      canvas.toBlob(function(blob) {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mind-os-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
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
