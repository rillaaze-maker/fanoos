// صفحه‌ی «امروز»
import * as J from './jalali.js';
import { S, save, shiftOn, spanOf, typeOf, isWork, swapsOn, balances, personName } from './store.js';
import { C, t, $, $$, esc, fa, todayKey, dayTitle, durationText, shiftText, chip, pick, name, inkWords, relDay, nameIs } from './ui.js';
import { icon, weather, shiftGlyph, lantern, squiggle } from './glyphs.js';
import { openDay } from './calendar.js';
import { openTool, openLinePicker } from './care.js';
import { openSettings } from './settings.js';
import { bus } from './bus.js';
import { react, queueReact, playQueued } from './mascot.js';

const NIGHTISH = ['night', 'full'];
let editingMood = false;

// الان در کجای روزِ کاری هستیم؟
export function context(now = new Date()) {
  const tk = J.keyOf(now);
  const yk = J.addDays(tk, -1);
  const ys = spanOf(yk, shiftOn('me', yk));
  if (ys && now < ys.end) return { phase: 'during', key: yk, code: shiftOn('me', yk), span: ys };
  const code = shiftOn('me', tk);
  const ts = spanOf(tk, code);
  if (ts) {
    if (now < ts.start) return { phase: 'before', key: tk, code, span: ts };
    if (now < ts.end) return { phase: 'during', key: tk, code, span: ts };
    return { phase: 'after', key: tk, code, span: ts };
  }
  if (ys && NIGHTISH.includes(ys.type.kind) && now - ys.end < 10 * 3600e3) {
    return { phase: 'afterNight', key: yk, code: shiftOn('me', yk), span: ys, todayCode: code };
  }
  return { phase: code ? 'off' : 'empty', key: tk, code };
}

function greeting(now) {
  const h = now.getHours();
  const g = h < 5 ? C.greet.late : h < 7 ? C.greet.dawn : h < 12 ? C.greet.morning : h < 15 ? C.greet.noon : h < 19 ? C.greet.evening : C.greet.night;
  return t(g, { name: esc(name()) });
}

function lanternMood(ctx, now) {
  if (ctx.phase === 'afterNight') return 'sleepy';
  if (ctx.phase === 'during') return 'soft';
  const h = now.getHours();
  if (h >= 23 || h < 5) return 'sleepy';
  if (ctx.phase === 'after' || ctx.phase === 'off') return 'happy';
  return 'calm';
}

// جمله‌های مربوط به جابه‌جایی برای یک روز
export function swapNotes(key) {
  const out = [];
  for (const s of swapsOn(key)) {
    const mine = s.changes.find((c) => c.who === 'me' && c.key === key);
    const nm = esc(personName(s.with));
    if (isWork(mine.to) && !isWork(mine.from)) out.push(t(C.now.insteadOf, { name: nm }) + ' · ' + shiftText(mine.to, false));
    else if (!isWork(mine.to) && isWork(mine.from)) out.push(t(C.now.coveredBy, { name: nm }));
    else out.push(t(C.now.insteadOf, { name: nm }) + ' · ' + shiftText(mine.to, false));
  }
  return out;
}

export function renderToday(el) {
  const now = new Date();
  const tk = todayKey();
  const ctx = context(now);
  const ty = typeOf(ctx.code);
  const pool = [...(C.lines[ctx.phase === 'empty' ? 'off' : ctx.phase] || []), ...C.lines.any, ...C.lines.ayat];
  const line = S.line === '*' ? pick(pool, tk + ctx.phase) : S.line;
  const kind = ty ? ty.kind : 'none';

  // وضعیتِ شیفت
  let status = '', progress = '';
  if (ctx.phase === 'before') {
    const left = ctx.span.start - now;
    status = left < 14 * 3600e3 ? t(C.now.before, { left: durationText(left) }) : t(C.now.beforeFar, { shift: ty.label });
  } else if (ctx.phase === 'during') {
    const p = (now - ctx.span.start) / (ctx.span.end - ctx.span.start);
    status = t(C.now.during, { left: durationText(ctx.span.end - now) });
    progress = `<div class="progress" style="--p:${Math.min(1, Math.max(0, p))}"><span></span><i style="inset-inline-start:calc(var(--p)*100% - 9px)"></i></div>`;
  } else if (ctx.phase === 'after') status = C.now.after;
  else if (ctx.phase === 'afterNight') status = C.now.afterNight;
  else if (ctx.phase === 'off') status = C.now.off;
  else status = C.now.empty;

  const heads = [];
  for (const k of [tk, J.addDays(tk, 1)]) {
    for (const n of swapNotes(k)) heads.push(`<li>${icon('swap', 'sm')}<span><b>${relDay(k)}:</b> ${n}</span></li>`);
  }
  const bal = balances();
  for (const [id, n] of Object.entries(bal)) {
    if (!n) continue;
    const s = n > 0 ? t(C.swap.owesMe, { name: esc(personName(id)), n: fa(n) }) : t(C.swap.iOwe, { name: esc(personName(id)), n: fa(-n) });
    heads.push(`<li class="soft">${icon('leaf', 'sm')}<span>${s}</span></li>`);
  }

  el.innerHTML = `
  <header class="top">
    <div>
      <h1 class="greet">${greeting(now)}</h1>
      <p class="date">${dayTitle(tk)}</p>
    </div>
    <button class="icon-btn" data-act="settings" aria-label="${C.settings.title}">${icon('gear')}</button>
  </header>

  <section class="hero">
    <div class="lantern-wrap" data-act="flame" role="img">${lantern(lanternMood(ctx, now))}</div>
    <div class="line-card paper">
      ${line ? `<p class="ink" data-act="pickline">${inkWords(line, 250)}</p>`
        : `<button class="ink empty-line" data-act="pickline">${C.pick.empty}</button>`}
      <canvas class="doodle"></canvas>
      <div class="doodle-tools">
        <button class="mini" data-act="draw" aria-label="${C.draw.hint}">${icon('pen', 'sm')}</button>
      </div>
    </div>
  </section>

  <section class="card shift-card k-${kind}" data-act="day" data-key="${ctx.key}" style="--c:${ty ? ty.color : 'var(--line)'}">
    <div class="glyph-big">${ty ? shiftGlyph(kind) : icon('cal')}</div>
    <div class="shift-info">
      <div class="lbl">${ctx.key === tk ? C.ui.today : relDay(ctx.key)} ${ctx.code ? chip(ctx.code) : ''}</div>
      <div class="big">${ty ? esc(ty.label) : '—'}</div>
      ${ty && ty.start ? `<div class="time">${shiftText(ctx.code).split(' · ')[1]}</div>` : ''}
    </div>
    <div class="status">${status}</div>
    ${progress}
    ${swapNotes(ctx.key).map((n) => `<div class="swap-badge">${icon('swap', 'sm')} ${n}</div>`).join('')}
  </section>

  ${actionsFor(ctx)}
  ${moodBlock(ctx, now)}
  ${heads.length ? `<ul class="heads card">${heads.join('')}</ul>` : ''}

  <section class="week">
    <h2 class="sec">${C.ui.tomorrow} و بعد ${squiggle}</h2>
    <div class="ribbon">${ribbon(tk)}</div>
  </section>
  `;

  bindToday(el, ctx, tk);
  playQueued(el);
}

// فقط وقتی معنا دارد: آیینِ راهِ خونه بعد از شیفت، و یادداشتِ خواب بعد از شب
function actionsFor(ctx) {
  const T = C.tools;
  if (ctx.phase === 'before' && S.anchor) return `<p class="anchor-line" data-tool="mine">«${esc(S.anchor)}»</p>`;
  if (ctx.phase === 'after') {
    const r = t(T.home.options[S.homeRitual] || T.home.options[0], { name: esc(name()), nameIs: esc(nameIs(name())) });
    return `<section class="card ritual" data-tool="home"><div class="lbl">${T.home.t}</div><p>${r}</p></section>`;
  }
  if (ctx.phase === 'afterNight') {
    const tips = C.sleep.tips;
    const i = new Date().getDate() % tips.length;
    return `<section class="card sleep"><div class="lbl">${icon('moon', 'sm')} ${C.sleep.title}</div>
      <ul><li>${tips[i]}</li><li>${tips[(i + 1) % tips.length]}</li></ul></section>`;
  }
  return '';
}

function moodBlock(ctx, now) {
  const tk = todayKey();
  const m = S.moods[tk];
  const show = m || ['after', 'afterNight'].includes(ctx.phase) || now.getHours() >= 17;
  if (!show) return '';
  const opts = Object.entries(C.mood.weathers).map(([k, label]) =>
    `<button class="wx ${m && m.w === k ? 'on' : ''}" data-mood="${k}" aria-label="${label}">${weather(k)}<span>${label}</span></button>`).join('');
  return `<section class="card mood">
    <div class="lbl">${C.mood.ask}</div>
    <div class="wx-row">${opts}</div>
    ${m ? `<p class="mood-thanks">${C.mood.thanks[m.w]}</p>
      ${m.line && !editingMood ? `<div class="mood-saved"><p>«${esc(m.line)}»</p><button class="link" data-act="moodedit">${C.mood.edit}</button></div>`
        : `<div class="add-row"><input class="line-in" data-moodline placeholder="${C.mood.linePlaceholder}" value="${esc(m.line || '')}">
          <button class="btn solid mini-btn" data-act="moodsave">${C.mood.save}</button></div>`}` : ''}
  </section>`;
}

function ribbon(tk) {
  let out = '';
  for (let i = 1; i <= 7; i++) {
    const k = J.addDays(tk, i);
    const code = shiftOn('me', k);
    const ty = typeOf(code);
    const d = J.dateOfKey(k);
    const swapped = swapsOn(k).length > 0;
    out += `<button class="rday ${swapped ? 'swapped' : ''}" data-act="day" data-key="${k}" style="--c:${ty ? ty.color : 'transparent'}">
      <span class="wd">${J.weekdayShort[J.weekdayOf(d)]}</span>
      <span class="g">${ty ? shiftGlyph(ty.kind) : '<i class="dot"></i>'}</span>
      <span class="dn">${fa(J.parseKey(k).jd)}</span>
      ${swapped ? `<span class="sw">${icon('swap')}</span>` : ''}
    </button>`;
  }
  return out;
}

function bindToday(el, ctx, tk) {
  el.onclick = (e) => {
    const a = e.target.closest('[data-act],[data-tool],[data-mood]');
    if (!a) return;
    if (a.dataset.tool) return openTool(a.dataset.tool);
    if (a.dataset.mood) {
      const prev = S.moods[tk] || {};
      S.moods[tk] = { ...prev, w: a.dataset.mood };
      save();
      queueReact({ sun: 'hop', partly: 'nod', rain: 'droop', storm: 'droop' }[a.dataset.mood]);
      return bus.refresh();
    }
    const act = a.dataset.act;
    if (act === 'settings') openSettings();
    else if (act === 'day') openDay(a.dataset.key);
    else if (act === 'draw') toggleDraw(el, tk, a);
    else if (act === 'flame') react('giggle', el);
    else if (act === 'pickline' && !$('.line-card', el).classList.contains('drawing')) openLinePicker();
    else if (act === 'moodedit') { editingMood = true; bus.refresh(); $('[data-moodline]', el).focus(); }
    else if (act === 'moodsave') {
      const v = $('[data-moodline]', el).value.trim();
      S.moods[tk].line = v;
      save();
      editingMood = false;
      if (v) queueReact('nod');
      bus.refresh();
    }
  };
  const li = $('[data-moodline]', el);
  if (li) li.onkeydown = (e) => { if (e.key === 'Enter') $('[data-act="moodsave"]', el).click(); };
  setupDoodle(el, tk);
}

// ── نقاشی روی جمله‌ی امروز ───────────────────────────────────
function setupDoodle(el, tk) {
  const cv = $('.doodle', el);
  const card = $('.line-card', el);
  const ctx2 = cv.getContext('2d');
  const draw = () => {
    const r = card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx2.lineCap = ctx2.lineJoin = 'round';
    ctx2.lineWidth = 3;
    ctx2.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--amber-ink').trim() || '#C9781F';
    for (const s of S.doodles[tk] || []) {
      ctx2.beginPath();
      for (let i = 0; i < s.length; i += 2) {
        const x = s[i] / 1000 * r.width, y = s[i + 1] / 1000 * r.height;
        i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y);
      }
      ctx2.stroke();
    }
  };
  card._redraw = draw;
  requestAnimationFrame(draw);

  let cur = null;
  const pt = (e) => { const r = card.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * 1000), Math.round((e.clientY - r.top) / r.height * 1000)]; };
  cv.onpointerdown = (e) => { if (!card.classList.contains('drawing')) return; cv.setPointerCapture(e.pointerId); cur = pt(e); };
  cv.onpointermove = (e) => {
    if (!cur) return;
    const p = pt(e);
    const r = card.getBoundingClientRect();
    ctx2.beginPath();
    ctx2.moveTo(cur[cur.length - 2] / 1000 * r.width, cur[cur.length - 1] / 1000 * r.height);
    ctx2.lineTo(p[0] / 1000 * r.width, p[1] / 1000 * r.height);
    ctx2.stroke();
    cur.push(...p);
  };
  cv.onpointerup = cv.onpointercancel = () => {
    if (!cur) return;
    (S.doodles[tk] = S.doodles[tk] || []).push(cur);
    // فقط نقاشیِ سی روزِ اخیر نگه داشته می‌شود
    const keys = Object.keys(S.doodles).sort();
    while (keys.length > 30) delete S.doodles[keys.shift()];
    cur = null;
    save();
  };
}

function toggleDraw(el, tk, btn) {
  const card = $('.line-card', el);
  const on = card.classList.toggle('drawing');
  const tools = $('.doodle-tools', el);
  if (on) {
    tools.innerHTML = `<button class="mini txt" data-act="clear-doodle">${C.draw.clear}</button><button class="mini txt solid" data-act="draw">${C.draw.done}</button>`;
    $('[data-act="clear-doodle"]', tools).onclick = (e) => { e.stopPropagation(); delete S.doodles[tk]; save(); card._redraw(); };
  } else {
    tools.innerHTML = `<button class="mini" data-act="draw" aria-label="${C.draw.hint}">${icon('pen', 'sm')}</button>`;
  }
}
