// صفحه‌ی «پناه» — ابزارهای دفترچه‌ی «دستِ استوار، قلبِ بیدار»
import * as J from './jalali.js';
import { S, save } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, dayTitle, toast, openSheet, closeSheet, name, inkWords, vibrate, nameIs } from './ui.js';
import { icon, lantern, squiggle } from './glyphs.js';
import { bus } from './bus.js';
import { queueReact } from './mascot.js';

const T = C.tools;

const CARDS = [
  ['sigh', 'leaf', 'warm'],
  ['box', 'square', 'teal'],
  ['anchor', 'heart', 'sand'],
  ['name', 'pen', 'rose'],
  ['scrub', 'swap', 'teal'],
  ['refuge', 'moon', 'night'],
  ['home', 'cup', 'sand'],
  ['light', 'sun', 'warm'],
  ['signs', 'bell', 'rose'],
];

function heavyWeek() {
  let n = 0;
  const tk = todayKey();
  for (let i = 0; i < 7; i++) { const m = S.moods[J.addDays(tk, -i)]; if (m && (m.w === 'rain' || m.w === 'storm')) n++; }
  return n >= 4;
}

export function renderCare(el) {
  el.innerHTML = `
  <header class="top"><div><h1 class="greet">${C.care.title}</h1><p class="date">${C.care.sub}</p></div></header>
  ${heavyWeek() ? `<button class="card banner" data-tool="signs">${icon('heart', 'sm')} ${C.mood.heavyWeek}</button>` : ''}
  <button class="card mine-card" data-tool="mine"><div class="lbl">${T.mine.t}</div><p>${S.anchor ? `«${esc(S.anchor)}»` : `<span class="muted">${C.pick.mineEmpty}</span>`}</p></button>
  <div class="tools">
    ${CARDS.map(([id, ic, tone]) => `<button class="tool card t-${tone}" data-tool="${id}">
      <span class="ti">${icon(ic)}</span>
      <b>${T[id].t}</b><small>${T[id].d}</small></button>`).join('')}
  </div>
  <p class="about">${C.settings.about}</p>`;
  el.onclick = (e) => { const b = e.target.closest('[data-tool]'); if (b) openTool(b.dataset.tool); };
}

export function openTool(id) {
  ({ sigh, box, anchor, name: nameIt, mine, scrub, loss, refuge, home, light, signs }[id] || (() => {}))();
}

// ── آهِ فیزیولوژیک ────────────────────────────────────────────
function sigh() {
  const body = openSheet(`<div class="breath">${lantern('calm', 'big')}
    <p class="phase">&nbsp;</p><button class="btn solid" data-act="go">${T.sigh.t}</button></div>`, { cls: 'tool-sheet', onClose: () => { stop = true; } });
  let stop = false;
  const lan = $('.lantern', body), ph = $('.phase', body), btn = $('[data-act]', body);
  const set = (scale, ms, text) => new Promise((r) => {
    if (stop) return r();
    ph.textContent = text; vibrate(8);
    lan.style.transition = `transform ${ms}ms cubic-bezier(.4,0,.3,1)`;
    lan.style.setProperty('--breath', scale);
    setTimeout(r, ms);
  });
  btn.onclick = async () => {
    btn.hidden = true;
    await set(1.18, 2000, T.sigh.steps[0]);
    await set(1.3, 900, T.sigh.steps[1]);
    await set(.92, 6000, T.sigh.steps[2]);
    if (stop) return;
    lan.style.setProperty('--breath', 1);
    ph.textContent = T.sigh.done;
    btn.textContent = T.sigh.again; btn.hidden = false;
  };
}

// ── تنفسِ جعبه‌ای ─────────────────────────────────────────────
function box() {
  const body = openSheet(`<div class="breath">
    <svg class="boxpath" viewBox="0 0 200 200"><path d="M30 30h140v140H30z" fill="none" stroke="var(--line)" stroke-width="3" stroke-linejoin="round" filter="url(#wob)"/>
    <circle class="dot" r="9" cx="170" cy="30" fill="var(--amber)"/></svg>
    <p class="phase">&nbsp;</p><p class="round">&nbsp;</p>
    <button class="btn solid" data-act="go">${T.box.t}</button></div>`, { cls: 'tool-sheet', onClose: () => { stop = true; } });
  let stop = false;
  const dot = $('.dot', body), ph = $('.phase', body), rd = $('.round', body), btn = $('[data-act]', body);
  // در راست‌به‌چپ از گوشه‌ی بالا-راست شروع می‌کنیم
  const corners = [[170, 30], [30, 30], [30, 170], [170, 170]];
  const run = (i) => new Promise((r) => {
    const [x0, y0] = corners[i % 4], [x1, y1] = corners[(i + 1) % 4];
    const t0 = performance.now();
    const step = (now) => {
      if (stop) return r();
      const p = Math.min(1, (now - t0) / 4000);
      dot.setAttribute('cx', x0 + (x1 - x0) * p);
      dot.setAttribute('cy', y0 + (y1 - y0) * p);
      p < 1 ? requestAnimationFrame(step) : r();
    };
    requestAnimationFrame(step);
  });
  btn.onclick = async () => {
    btn.hidden = true;
    for (let round = 1; round <= 3 && !stop; round++) {
      rd.textContent = t(T.box.round, { n: fa(round) });
      for (let s = 0; s < 4 && !stop; s++) { ph.textContent = T.box.steps[s]; vibrate(6); await run(s); }
    }
    if (stop) return;
    ph.textContent = T.box.done; rd.innerHTML = '&nbsp;';
    btn.hidden = false;
  };
}

// ── لنگرِ تماسی ───────────────────────────────────────────────
function anchor() {
  openSheet(`<h2 class="sheet-title">${T.anchor.t}</h2>
    <ol class="steps">${T.anchor.items.map((x, i) => `<li style="animation-delay:${i * 160}ms">${x}</li>`).join('')}</ol>
    <p class="quote">${T.anchor.footer}</p>`, { cls: 'tool-sheet' });
}

// ── اسمش رو بگو ───────────────────────────────────────────────
function nameIt() {
  const body = openSheet(`<h2 class="sheet-title">${T.name.t}</h2>
    <div class="feelings">${T.name.feelings.map((f) => `<button class="pill" data-f="${f}">${f}</button>`).join('')}</div>
    <p class="say"></p><p class="hint sub"></p>`, { cls: 'tool-sheet' });
  body.onclick = (e) => {
    const b = e.target.closest('[data-f]');
    if (!b) return;
    $$('.pill', body).forEach((x) => x.classList.toggle('on', x === b));
    $('.say', body).innerHTML = inkWords(t(T.name.say, { f: b.dataset.f }));
    $('.sub', body).textContent = T.name.sub;
    vibrate(10);
  };
}

// ── جمله‌ی من ─────────────────────────────────────────────────
function mine() {
  const body = openSheet('', { cls: 'tool-sheet', onClose: () => bus.refresh() });
  const draw = () => {
    body.innerHTML = `<h2 class="sheet-title">${T.mine.t}</h2>
      ${S.anchor ? `<p class="say big-quote">${inkWords(S.anchor)}</p>` : ''}
      <div class="options">${T.mine.options.map((o) => `<button class="opt ${o === S.anchor ? 'on' : ''}" data-o="${esc(o)}">${o}</button>`).join('')}</div>
      <textarea class="note" rows="2" placeholder="${T.mine.own}">${T.mine.options.includes(S.anchor) ? '' : esc(S.anchor)}</textarea>`;
    const ta = $('.note', body);
    ta.oninput = () => { if (ta.value.trim()) { S.anchor = ta.value.trim(); save(); } };
  };
  body.onclick = (e) => { const o = e.target.closest('[data-o]'); if (o) { S.anchor = o.dataset.o; save(); draw(); } };
  draw();
}

// ── بینِ دو کیس، ۹۰ ثانیه ─────────────────────────────────────
function scrub() {
  const body = openSheet(`<h2 class="sheet-title">${T.scrub.t}</h2>
    <div class="scrub"><svg viewBox="0 0 120 120" class="clock"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--line-soft)" stroke-width="6"/>
      <circle class="arc" cx="60" cy="60" r="50" fill="none" stroke="var(--teal)" stroke-width="6" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-90 60 60) scale(1 -1) translate(0 -120)"/></svg>
      <span class="secs">${fa(90)}</span></div>
    <ol class="steps live">${T.scrub.steps.map((x) => `<li>${x}</li>`).join('')}</ol>
    <button class="btn solid" data-act="go">${T.scrub.start}</button>`, { cls: 'tool-sheet', onClose: () => clearInterval(iv) });
  let iv;
  const btn = $('[data-act]', body), arc = $('.arc', body), secs = $('.secs', body), lis = $$('.steps li', body);
  btn.onclick = () => {
    btn.hidden = true;
    const t0 = Date.now();
    const tick = () => {
      const s = Math.min(90, (Date.now() - t0) / 1000);
      arc.style.strokeDashoffset = 100 - s / 90 * 100;
      secs.textContent = fa(Math.ceil(90 - s));
      const idx = Math.min(3, Math.floor(s / 22.5));
      lis.forEach((li, i) => { li.classList.toggle('now', i === idx); li.classList.toggle('done', i < idx); });
      if (s >= 90) { clearInterval(iv); secs.textContent = T.scrub.done; vibrate([20, 60, 20]); }
    };
    tick(); iv = setInterval(tick, 250);
  };
}

// ── وقتی بیمار می‌رود ─────────────────────────────────────────
function loss() {
  const g = S.grief && S.grief.key === todayKey() ? S.grief.time : '';
  const body = openSheet(`<h2 class="sheet-title">${T.loss.t}</h2>
    <ol class="steps">${T.loss.steps.map((x, i) => `<li style="animation-delay:${i * 200}ms">${x}</li>`).join('')}</ol>
    <div class="appt card"><label>${T.loss.appt} <input type="time" value="${g || '21:00'}" data-time></label>
      <p class="hint">${T.loss.apptHint}</p>
      <button class="btn" data-act="appt">${icon('bell', 'sm')} ${C.ui.save}</button></div>
    <p class="quote">${T.loss.blame}</p>`, { cls: 'tool-sheet soft-night' });
  body.onclick = (e) => {
    if (!e.target.closest('[data-act="appt"]')) return;
    S.grief = { key: todayKey(), time: $('[data-time]', body).value };
    delete S.fired['grief-' + todayKey()];
    save(); toast(T.loss.apptSet);
  };
}

// ── چهار پناه (حدیثِ امام صادق ع) ─────────────────────────────
function refuge() {
  const R = T.refuge;
  openSheet(`<h2 class="sheet-title">${R.t}</h2>
    <p class="refuge-intro">${R.intro}</p>
    ${R.items.map((x) => `<section class="refuge">
      <div class="lbl">${x.when}</div>
      <p class="ar-big">${x.dhikr}</p>
      <p class="ref">${x.ref}</p>
      <p class="after">${x.after}</p>
    </section>`).join('')}`, { cls: 'tool-sheet' });
}

// ── راهِ خونه ─────────────────────────────────────────────────
function home() {
  const body = openSheet('', { cls: 'tool-sheet', onClose: () => bus.refresh() });
  const draw = () => {
    body.innerHTML = `<h2 class="sheet-title">${T.home.t}</h2><p class="hint">${T.home.pick}</p>
      <div class="options">${T.home.options.map((o, i) => `<button class="opt ${i === S.homeRitual ? 'on' : ''}" data-i="${i}">${t(o, { name: esc(name()), nameIs: esc(nameIs(name())) })}</button>`).join('')}
        <button class="opt muted-opt ${S.homeRitual < 0 ? 'on' : ''}" data-i="-1">${T.home.none}</button></div>`;
  };
  body.onclick = (e) => { const o = e.target.closest('[data-i]'); if (o) { S.homeRitual = +o.dataset.i; save(); draw(); } };
  draw();
}

// ── دفترِ روشنایی ─────────────────────────────────────────────
function light() {
  const body = openSheet('', { cls: 'tool-sheet light-book', onClose: () => bus.refresh() });
  const draw = (fresh) => {
    const prompt = T.light.prompts[(S.light.length) % T.light.prompts.length];
    body.innerHTML = `<h2 class="sheet-title">${T.light.t}</h2>
      <textarea class="note" rows="3" placeholder="${prompt}"></textarea>
      <button class="btn solid" data-act="add">${icon('pen', 'sm')} ${T.light.add}</button>
      <p class="hint">${T.light.rule}</p>
      <ul class="entries">${S.light.length ? [...S.light].reverse().map((x, i) => `<li class="${fresh && i === 0 ? 'fresh' : ''}">
        <span class="d">${dayTitle(J.keyOf(new Date(x.at)), false)}</span>${esc(x.text)}</li>`).join('') : `<li class="empty">${T.light.empty}</li>`}</ul>`;
  };
  body.onclick = (e) => {
    if (!e.target.closest('[data-act="add"]')) return;
    const ta = $('.note', body);
    const v = ta.value.trim();
    if (!v) return ta.focus();
    S.light.push({ at: Date.now(), text: v });
    save(); vibrate(12); queueReact('glow'); draw(true);
  };
  draw();
}

// ── چراغ‌ها ───────────────────────────────────────────────────
function signs() {
  const mk = todayKey().slice(0, 7);
  const sel = new Set(S.signs[mk] || []);
  const body = openSheet('', { cls: 'tool-sheet' });
  const draw = () => {
    body.innerHTML = `<h2 class="sheet-title">${T.signs.t}</h2><p class="hint">${T.signs.intro}</p>
      <div class="checks">${T.signs.list.map((s, i) => `<button class="chk ${sel.has(i) ? 'on' : ''}" data-i="${i}"><span class="box">${sel.has(i) ? icon('check', 'xs') : ''}</span>${s}</button>`).join('')}</div>
      <p class="count">${t(T.signs.count, { n: fa(sel.size) })}</p>
      ${sel.size >= 5 ? `<p class="warn card">${T.signs.many}</p>` : ''}
      <h3 class="sec">${T.signs.redTitle}</h3>
      <ul class="red">${T.signs.red.map((r) => `<li>${r}</li>`).join('')}</ul>
      <p class="hint">${T.signs.redFoot}</p>
      <h3 class="sec">${T.signs.help}</h3>
      <div class="helplines">${T.signs.lines.map((l) => `<a class="card help" href="tel:${l.tel}">${icon('phone', 'sm')}<b>${l.n}</b><span>${l.t}</span></a>`).join('')}</div>`;
  };
  body.onclick = (e) => {
    const c = e.target.closest('[data-i]');
    if (!c) return;
    const i = +c.dataset.i;
    sel.has(i) ? sel.delete(i) : sel.add(i);
    S.signs[mk] = [...sel]; save(); draw();
  };
  draw();
}

// ── انتخابِ جمله‌ی بالای «امروز» ──────────────────────────────
export function openLinePicker() {
  const body = openSheet('', { cls: 'tool-sheet', onClose: () => bus.refresh() });
  const seen = new Set();
  const draw = () => {
    const order = ['dhikr', 'ayat', ...Object.keys(C.lines).filter((k) => k !== 'dhikr' && k !== 'ayat')];
    const groups = order.map((g) => [g, C.lines[g]]).map(([g, arr]) => {
      const items = arr.filter((l) => !seen.has(l) && seen.add(l));
      return items.length ? `<div class="lbl">${C.pick.groups[g] || ''}</div>` + items.map((l) =>
        `<button class="opt ${S.line === l ? 'on' : ''}" data-l="${esc(l)}">${esc(l)}</button>`).join('') : '';
    }).join('');
    seen.clear();
    const own = S.line && S.line !== '*' && !Object.values(C.lines).flat().includes(S.line) ? S.line : '';
    body.innerHTML = `<h2 class="sheet-title">${C.pick.title}</h2><p class="hint">${C.pick.hint}</p>
      <button class="opt daily ${S.line === '*' ? 'on' : ''}" data-l="*">${icon('leaf', 'sm')} ${C.pick.daily}</button>
      <textarea class="note" rows="2" placeholder="${C.pick.own}">${esc(own)}</textarea>
      <div class="options">${groups}</div>`;
    const ta = $('.note', body);
    ta.oninput = () => { if (ta.value.trim()) { S.line = ta.value.trim(); save(); $$('.opt', body).forEach((o) => o.classList.remove('on')); } };
  };
  body.onclick = (e) => { const o = e.target.closest('[data-l]'); if (o) { S.line = o.dataset.l; save(); vibrate(8); queueReact('nod'); draw(); } };
  draw();
}
