// نقاشی‌ها — جوهرِ سیاه، خطِ قلم، کمی لرزان؛ به سبکِ کتاب‌های شل سیلوراستاین
// هر خط دو بار کشیده می‌شود (یک بار کم‌رنگ و کمی جابه‌جا) تا حسِ طراحیِ دستی بدهد.

const P = {
  sun: '<path d="M20.1 14.6c3-.1 5.5 2.4 5.4 5.5-.1 3-2.5 5.3-5.5 5.3-3.1 0-5.4-2.5-5.3-5.5.1-2.9 2.5-5.3 5.4-5.3z"/><path d="M20 6.8v3.6M20.2 29.8v3.5M6.9 20.1h3.5M29.7 19.9h3.4M10.6 10.7l2.4 2.4M27.2 27.3l2.3 2.2M29.4 10.8l-2.3 2.3M12.9 27.1l-2.2 2.4"/>',
  sunset: '<path d="M6.8 27.6c8.9-.5 17.6-.4 26.4.2"/><path d="M13.4 27.4c-.1-3.9 2.9-7 6.7-7 3.7 0 6.6 3 6.6 6.9"/><path d="M20 11.6v3.4M11.4 15.6l2.3 2.1M28.7 15.5l-2.2 2.3"/>',
  moon: '<path d="M24.8 8.4c-6.1.9-10.4 6.5-9.6 12.6.8 5.9 6.2 10.1 12.1 9.4 1.6-.2 3.2-.8 4.5-1.6-6.5-.2-11.4-6.1-10.1-12.6.5-3 1.6-5.6 3.1-7.8z"/>',
  cup: '<path d="M10.2 16.6h17.4l-.3 6.2c-.3 4.6-3.8 8-8.4 8s-8.2-3.5-8.4-8.1z"/><path d="M27.5 18.8h2.1c1.8.1 3 1.5 2.9 3.2-.1 1.6-1.5 2.8-3.2 2.8h-2.6"/><path d="M18.8 12.1c-1.1-1.6 1.1-2.7 0-4.4"/>',
  heart: '<path d="M20 31.4c-5.6-3.6-11.2-7.9-11.1-13.1.1-3.2 2.4-5.5 5.4-5.4 2.4.1 4.3 1.7 5.7 3.8 1.5-2.2 3.4-3.9 5.8-3.8 2.9.1 5.2 2.5 5.1 5.6-.2 5.1-5.5 9.3-10.9 12.9z"/>',
  bell: '<path d="M13 26.4v-7.1c0-4.2 3.1-7.7 7-7.7s7.1 3.5 7.1 7.6v7.2"/><path d="M10.2 26.7c6.6-.4 13.2-.3 19.7.1M17.9 30.4c.6 1.3 1.3 2 2.2 2s1.7-.7 2.2-2"/>',
  swap: '<path d="M10.4 14.6c6-.3 12-.2 18 .1M24.4 10.3l4.4 4.4-4.5 4.3"/><path d="M29.6 25.6c-6 .2-12.1.1-18.1-.2M15.6 21.3l-4.3 4.3 4.4 4.3"/>',
  cal: '<path d="M9.2 11.8c7.2-.4 14.4-.3 21.6.1.4 6.4.3 12.8 0 19.1-7.2.4-14.4.4-21.6 0-.4-6.3-.4-12.7 0-19.2z"/><path d="M9.4 17.6c7-.3 14-.2 21.1.1"/>',
  gear: '<path d="M8.2 14c8-.4 15.9-.3 23.8.1M8 26.3c8-.3 16-.2 24 .1"/><path fill="var(--paper)" d="M15.5 11c1.7 0 3 1.4 3 3.1s-1.4 3-3.1 3-3-1.4-3-3.1 1.4-3 3.1-3zM24.6 23.2c1.7 0 3 1.4 3 3.1s-1.4 3-3.1 3-3-1.4-3-3.1 1.4-3 3.1-3z"/>',
  square: '<path d="M11.2 11.4c5.9-.4 11.8-.4 17.6.1.4 5.8.4 11.6 0 17.3-5.9.4-11.8.4-17.6 0-.4-5.8-.4-11.6 0-17.4z"/>',
  quote: '<path d="M11.4 23.6c-.2-4.6 1.7-8 5.4-9.8M11.4 23.6c0 1.9 1.3 3.2 2.9 3.2s2.8-1.3 2.8-3-1.2-3-2.8-3c-1.4 0-2.6.9-2.9 2.8zM22.4 23.6c-.2-4.6 1.7-8 5.4-9.8M22.4 23.6c0 1.9 1.3 3.2 2.9 3.2s2.8-1.3 2.8-3-1.2-3-2.8-3c-1.4 0-2.6.9-2.9 2.8z"/>',
  plus: '<path d="M20.2 10.4c-.3 6.5-.2 13 .1 19.4M10.4 20.1c6.5-.3 12.9-.2 19.4.1"/>',
  x: '<path d="M12 12.2c5.4 5.2 10.7 10.5 15.9 15.8M27.9 11.9c-5.3 5.4-10.6 10.8-15.9 16.1"/>',
  chevR: '<path d="M16.6 11c3.1 3.1 6.1 6.1 9 9.2-3 3-6 6.1-8.9 9"/>',
  chevL: '<path d="M23.4 11c-3.1 3.1-6.1 6.1-9 9.2 3 3 6 6.1 8.9 9"/>',
  check: '<path d="M10.2 20.9c2.4 2.4 4.8 4.8 7.2 7.2 4.2-5.4 8.5-10.8 12.8-16"/>',
  pen: '<path d="M11.2 28.8l1.3-5.3 13.4-13.4c1.1-1.1 2.8-1.1 3.9 0s1.1 2.8 0 3.9L16.4 27.4z"/>',
  phone: '<path d="M13.1 8.8l3.8-.4 2.1 5.5-2.6 2c1.4 3.2 3.7 5.6 7 7.2l2.1-2.6 5.5 2.3-.4 3.9c-.3 1.8-1.9 2.9-3.7 2.8-10.1-1-15.7-6.8-16.5-17.3-.1-1.8 1.1-3.3 2.7-3.4z"/>',
  share: '<path d="M20 24.2c-.2-5-.1-9.9.1-14.8M15.1 14.1c1.7-1.7 3.3-3.3 5-5 1.7 1.7 3.3 3.3 5 5"/><path d="M13.6 18.6h-3.1c-.3 4.6-.2 9.2.1 13.7 6.3.4 12.6.3 18.9 0 .3-4.6.3-9.2 0-13.7h-3"/>',
  leaf: '<path d="M10.2 29.9c.3-10.2 6.8-18.1 20.2-20 .5 12.3-6.3 20.1-17.2 20.2"/><path d="M10.5 29.7c4.1-5.9 8.6-10.3 13.7-13.8"/>',
  cloud: '<path d="M12 28.4h15.6c2.9 0 5.2-2.1 5.2-4.8 0-2.6-2.1-4.7-4.7-4.8-.8-3.4-3.8-5.8-7.2-5.8-3.9 0-7.1 2.9-7.4 6.8-2.7.3-4.6 2.3-4.6 4.7 0 2.2 1.4 3.9 3.1 3.9z"/>',
};

const W = {
  sun: P.sun,
  partly: '<g transform="translate(7 -5) scale(.7)">' + P.sun + '</g><path fill="var(--paper)" d="M10.4 32h15.2c2.8 0 5.1-2.1 5.1-4.7 0-2.5-2-4.6-4.6-4.7-.8-3.3-3.6-5.7-7-5.7-3.8 0-6.9 2.9-7.2 6.6-2.6.3-4.5 2.3-4.5 4.6 0 2.2 1.3 3.9 3 3.9z"/>',
  rain: '<g transform="translate(0 -5)">' + P.cloud + '</g><path d="M14.8 28.8l-1.4 3.8M20.6 28.9l-1.4 3.8M26.4 28.8l-1.4 3.8"/>',
  storm: '<g transform="translate(0 -6)">' + P.cloud + '</g><path d="M21.4 25.4l-3.4 5h4.4l-3.1 5.1"/>',
};

// دو بار کشیدن: خطِ اصلی، و یک ردِ کم‌رنگِ کمی جابه‌جا
const sketch = (inner) => `<g filter="url(#wob)">${inner}</g><g class="ghost" filter="url(#wob2)">${inner}</g>`;

const wrap = (inner, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${sketch(inner)}</svg>`;

export const icon = (name, cls) => wrap(P[name] || '', cls);
export const weather = (name, cls) => wrap(W[name] || '', cls);

// شکلِ هر نوع شیفت
export function shiftGlyph(kind, cls) {
  switch (kind) {
    case 'morning': return wrap(P.sun, cls);
    case 'evening': return wrap(P.sunset, cls);
    case 'night': return wrap(P.moon, cls);
    case 'long': return wrap('<g transform="translate(0 -4)">' + P.sun + '</g><path d="M6.6 33.4c8.9-.4 17.9-.3 26.8.2"/>', cls);
    case 'full': return wrap('<g transform="translate(-4 -4) scale(.75)">' + P.sun + '</g><g transform="translate(13 13) scale(.6)">' + P.moon + '</g>', cls);
    case 'off': return wrap(P.cup, cls);
    case 'leave': return wrap(P.heart, cls);
    default: return wrap(P.bell, cls);
  }
}

// حلقه‌ی دورِ امروز
export const ring = '<svg class="ring" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M21.5 4.6C11.2 3.4 3.9 11 4.3 20.6c.4 9.4 7.8 15.8 16.8 15.3 9-.5 15.3-7.8 14.8-16.4C35.4 10.8 28.6 4.6 18.9 5.3c-3.9.3-7 1.8-9 4.1"/></svg>';

export const squiggle = '<svg class="squiggle" viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 6.2c9-4.4 15 3.8 24-.2s15 4 24-.1 15 4.1 24 0 15 4 24 0 15 3.9 16-.4"/></svg>';

// شعله — شخصیتِ برنامه. حالت‌ها: calm · sleepy · happy · soft
// (اسمِ تابع «lantern» مانده تا بقیه‌ی کد عوض نشود)
const FLAME = 'M40.3 12.6c3.6 9.4 16.4 20.7 16.6 38.1.2 13.5-7.4 23.7-16.8 23.8-9.6.1-17.3-9.6-17.2-22.6.1-9.4 4.4-15.8 8.3-21.3.4 4.6 1.6 8.2 4 10.4-.9-10.6 2.2-19.8 5.1-28.4z';

// همه‌ی چهره‌ها کشیده می‌شوند و CSS یکی را نشان می‌دهد؛ این‌طوری واکنش‌ها فقط کلاس عوض می‌کنند
const EYES = '<g class="eyes"><circle cx="34.6" cy="60" r="1.7"/><circle cx="45.4" cy="60" r="1.7"/></g>';
const FACES = {
  calm: EYES + '<path fill="none" d="M37.6 65.6c1.6 1.2 3.3 1.2 4.9 0"/>',
  soft: EYES + '<path fill="none" d="M38 66h4"/>',
  sleepy: '<path fill="none" d="M32.6 60.4c1.3.8 2.7.8 4 0M43.4 60.4c1.3.8 2.7.8 4 0M38.4 66h3.2"/><text class="zz" x="58" y="30">z</text><text class="zz z2" x="65" y="20">z</text>',
  happy: '<path fill="none" d="M32.4 61c1.1-1.9 3.1-1.9 4.2 0M43.3 61c1.1-1.9 3.1-1.9 4.2 0M36.9 64.8c1.9 2.2 4.3 2.2 6.2 0"/>',
  // مهربان و دلداری‌دهنده: چشم‌های رو به پایین، لبخندِ کوچک
  tender: '<path fill="none" d="M32.6 59.8c1.3 1.1 2.8 1.1 4 0M43.4 59.8c1.3 1.1 2.8 1.1 4 0M38.2 65.4c1.2.8 2.4.8 3.6 0"/>',
};

export function lantern(mood = 'calm', cls = '') {
  const faces = Object.entries(FACES).map(([k, f]) => `<g class="face f-${k}">${f}</g>`).join('');
  const blink = (2 + Math.random() * 4).toFixed(2);
  return `<svg class="lantern ${cls} m-${mood}" viewBox="0 0 80 90" aria-hidden="true" style="--blink-delay:${blink}s">
  <g class="body">
  <g class="flame-g" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <g filter="url(#wob)">
      <path class="flame" fill="var(--flame)" stroke="none" d="${FLAME}"/>
      <path d="${FLAME}"/>
    </g>
    <g class="ghost" filter="url(#wob2)"><path d="${FLAME}"/></g>
    <g class="faces" fill="var(--face)" stroke="var(--face)" stroke-width="1.5">${faces}</g>
  </g>
  </g>
  <path fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round" filter="url(#wob)" d="M28.6 83.4c7.6-.9 15.3-.9 22.9.1"/>
</svg>`;
}
