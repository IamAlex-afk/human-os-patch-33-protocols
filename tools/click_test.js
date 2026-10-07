// Drives a local headless Chrome over the DevTools protocol: opens pages of the local site, clicks, reads results.
// usage: node click_test.js   (expects http://localhost:8765 serving the site)
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const CH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const prof = path.join(os.tmpdir(), 'gavfix', 'prof_click');
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  fs.rmSync(prof, { recursive: true, force: true });
  const chrome = spawn(CH, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, '--window-size=520,900', 'about:blank'], { stdio: 'ignore' });
  let ws, id = 0; const pending = new Map(); const errors = [];
  try {
    let target;
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(250);
      try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find(t => t.type === 'page'); } catch (e) {}
    }
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result || m); pending.delete(m.id); }
      if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    });
    const send = (method, params = {}) => new Promise(r => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
    const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;
    const open = async url => { await send('Page.navigate', { url }); await sleep(1800); };
    await send('Runtime.enable'); await send('Page.enable');
    const B = 'http://localhost:8765/';
    const out = {};

    // 1) FAQ accordion on the home page and on faq.html (ru)
    for (const p of ['ru/', 'ru/faq.html', 'ja/faq.html']) {
      await open(B + p);
      out['faq ' + p] = await ev(`(() => { const b = document.querySelectorAll('.faq-question'); const first = b[0], last = b[b.length-1];
        const vis = el => getComputedStyle(el.closest('.faq-item').querySelector('.faq-answer')).display;
        const before = vis(first); first.click(); const a1 = vis(first); last.click(); const a2 = [vis(first), vis(last)];
        return { questions: b.length, inHeading: [...b].every(x => x.parentElement.tagName === 'H3'), before, afterClick: a1, afterSecond: a2,
                 link: !!document.querySelector('.faq-answer a[href="./"]') }; })()`);
    }

    // 2) the whole test on the Russian page: answer every question, read the result
    await open(B + 'ru/');
    await ev(`localStorage.clear()`); await open(B + 'ru/');
    out.test = await ev(`(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      let clicks = 0;
      for (let step = 0; step < 80; step++) {
        const groups = [...document.querySelectorAll('.options')].filter(g => !g.querySelector('input:checked') && g.offsetParent);
        if (!groups.length) {
          const btn = [...document.querySelectorAll('.test-card button, .fear-test-card button')].find(b => !b.disabled && b.offsetParent && !/←/.test(b.textContent) && !b.classList.contains('faq-question'));
          if (!btn) break;
          btn.click(); clicks++; await sleep(450); continue;
        }
        const inputs = groups[0].querySelectorAll('input'); inputs[step % inputs.length].click(); clicks++; await sleep(450);
      }
      await sleep(800);
      const blk = document.getElementById('overallBlock');
      return { clicks, resultShown: blk && getComputedStyle(blk).display !== 'none',
               archetype: document.getElementById('overallArchetype')?.textContent, score: document.getElementById('overallPercentile')?.textContent,
               bars: [...document.querySelectorAll('.axis-row')].map(r => r.textContent.trim()),
               progress: document.getElementById('overallProgress')?.textContent.trim().slice(0, 60) };
    })()`);

    // 3) language switcher keeps the page
    await open(B + 'ru/poll.html');
    out.pollPage = await ev(`({ h1: document.querySelector('h1')?.textContent.trim(), voteBtn: !!document.getElementById('submitPoll'), notice: !!document.querySelector('[data-i18n="pollPrivacy"]'), langButtons: document.querySelectorAll('#langDropdown [data-lang], #langDropdown button').length })`);
    out.errors = errors;
    console.log(JSON.stringify(out, null, 1));
  } finally {
    try { ws && ws.close(); } catch (e) {}
    chrome.kill(); await sleep(500);
    fs.rmSync(prof, { recursive: true, force: true });
  }
})().catch(e => { console.error('FAILED', e); process.exit(1); });
