// نقاشی‌های دست‌کشیده — همه با currentColor و فیلترِ لرزش (#wob در index.html)

const P = {
  sun: '<path d="M20 13.2c4 .1 7.1 3.2 6.9 7.2-.2 3.9-3.3 6.8-7.1 6.7-4-.1-6.9-3.2-6.8-7.1.1-3.8 3.1-6.9 7-6.8z"/><path d="M20 4.6v4.2M20.2 31.6v3.9M4.7 20.1h4.1M31.4 19.8h4M9.3 9.1l2.8 2.9M28.1 28.3l2.7 2.6M30.9 9.3l-2.8 2.7M11.9 28.1l-2.8 3"/>',
  sunset: '<path d="M6.5 27.4c9-.6 18-.5 27 .1"/><path d="M12.2 27.2c-.2-4.6 3.4-8.5 8-8.6 4.5-.1 8 3.6 8 8.4"/><path d="M20 9.4v4.3M10.3 14.2l2.8 2.6M29.8 14.1l-2.7 2.8M12.8 32.4c4.8-.4 9.7-.3 14.5.1"/>',
  moon: '<path d="M25.4 7.2c-6.6.7-11.5 6.6-10.8 13.2.6 6.1 6.1 10.7 12.3 10.1 2.1-.2 4-.9 5.6-2.1-7.3.3-12.8-6.4-11.1-13.6.6-2.9 2-5.5 4-7.6z"/><path d="M10.2 9.1l.9 2.2 2.1.8-2.1.8-.9 2.2-.8-2.2-2.1-.8 2.1-.8z"/>',
  cup: '<path d="M9.3 17.2h19.2l-.2 5.3c-.2 5.1-4.2 8.9-9.5 8.9s-9.3-3.9-9.4-9z"/><path d="M28.4 19.1h2.4c2 0 3.5 1.6 3.4 3.5-.1 1.9-1.7 3.3-3.6 3.2h-3.3"/><path d="M14.3 12.4c-1.1-1.5 1-2.6 0-4.2M19 12.2c-1.1-1.5 1-2.6 0-4.2M23.7 12.4c-1.1-1.5 1-2.6 0-4.2M7.6 34.4c7.2-.5 14.6-.5 21.9.1"/>',
  heart: '<path d="M20.1 32.3c-6.2-4-12.3-8.6-12.2-14.3.1-3.5 2.7-6.1 5.9-6 2.6.1 4.6 1.8 6.2 4.1 1.6-2.4 3.7-4.2 6.3-4.1 3.2.1 5.7 2.7 5.6 6.1-.2 5.6-6 10.2-11.8 14.2z"/>',
  bell: '<path d="M12.2 27.3v-8c0-4.7 3.5-8.6 7.9-8.6 4.5 0 8 3.9 8 8.5v8.1"/><path d="M8.9 27.6c7.4-.4 14.8-.4 22.2.1M17.5 31c.6 1.5 1.5 2.3 2.6 2.3s2-.8 2.6-2.3M20 6.8v3.6"/>',
  swap: '<path d="M9.6 14.2c6.4-.3 12.8-.2 19.3.1M24.2 9.1l5 5.1-5.1 4.9"/><path d="M30.4 26.1c-6.4.2-12.9.1-19.3-.2M15.8 21l-5 5 5.1 5"/>',
  cal: '<path d="M8.2 11.1c8-.5 16-.4 23.9.1.4 7 .3 14 0 21-8 .4-16 .4-23.9 0-.4-7-.4-14 0-21.1z"/><path d="M8.4 17.2c7.8-.3 15.6-.3 23.4.1M14.2 7.1l.1 6.2M25.8 7l-.1 6.3"/>',
  gear: '<path d="M7.6 13.2c8.3-.4 16.6-.3 24.9.1M7.4 26.9c8.4-.3 16.8-.2 25.1.1"/><path fill="var(--paper-2)" d="M15.3 9.4c2.1 0 3.8 1.7 3.8 3.8s-1.7 3.9-3.8 3.9-3.9-1.8-3.9-3.9 1.8-3.8 3.9-3.8zM25.1 23.1c2.1 0 3.8 1.7 3.8 3.8s-1.7 3.9-3.8 3.9-3.9-1.8-3.9-3.9 1.8-3.8 3.9-3.8z"/>',
  square: '<path d="M10.4 10.6c6.4-.4 12.8-.4 19.2.1.4 6.3.4 12.6 0 18.9-6.4.4-12.8.4-19.2 0-.4-6.3-.4-12.6 0-19z"/><circle cx="29.6" cy="10.6" r="2.2" fill="currentColor"/>',
  plus: '<path d="M20.2 9.3c-.3 7.2-.2 14.3.1 21.4M9.4 20.1c7.1-.3 14.2-.2 21.3.1"/>',
  x: '<path d="M11.1 11.3c6 5.8 11.9 11.7 17.7 17.6M28.8 11c-5.9 6-11.8 12-17.7 17.9"/>',
  chevR: '<path d="M16.2 10.1c3.4 3.4 6.8 6.7 10 10.1-3.3 3.3-6.6 6.7-9.9 9.9"/>',
  chevL: '<path d="M23.8 10.1c-3.4 3.4-6.8 6.7-10 10.1 3.3 3.3 6.6 6.7 9.9 9.9"/>',
  check: '<path d="M9.4 21.2c2.7 2.6 5.3 5.2 7.9 7.9 4.6-6 9.3-11.9 14.1-17.6"/>',
  pen: '<path d="M10.2 29.8l1.5-6.1 15-15c1.3-1.3 3.2-1.3 4.4 0 1.2 1.2 1.2 3.1 0 4.4l-15 15z"/><path d="M24.2 11.2l4.4 4.4M8.6 33.4c7.6-.4 15.3-.3 22.9.1"/>',
  phone: '<path d="M12.4 7.6l4.3-.4 2.4 6.2-3 2.3c1.6 3.6 4.2 6.3 7.9 8.1l2.4-2.9 6.2 2.6-.5 4.4c-.3 2-2.1 3.3-4.1 3.1C16.3 29.9 10 23.4 9.1 11.6c-.1-2 1.3-3.8 3.3-4z"/>',
  share: '<path d="M20 24.8c-.2-5.6-.1-11.1.1-16.6M14.4 13.4c1.9-1.9 3.8-3.7 5.7-5.6 1.9 1.9 3.8 3.7 5.6 5.6"/><path d="M12.8 18.2h-3.4c-.3 5.1-.2 10.3.1 15.4 7 .4 14 .3 21 0 .3-5.1.3-10.3 0-15.4h-3.3"/>',
  leaf: '<path d="M9 31.2c.3-11.4 7.6-20.3 22.6-22.4.6 13.8-7 22.5-19.2 22.6"/><path d="M9.3 31c4.6-6.6 9.6-11.5 15.3-15.4"/>',
  cloud: '<path d="M11.2 29.2h17.4c3.3 0 5.8-2.4 5.8-5.4 0-2.9-2.3-5.3-5.3-5.4-.9-3.8-4.2-6.5-8.1-6.5-4.4 0-8 3.3-8.3 7.6-3 .3-5.2 2.6-5.2 5.3 0 2.5 1.6 4.4 3.7 4.4z"/>',
};

const W = {
  sun: P.sun,
  partly: '<g transform="translate(6 -4) scale(.72)">' + P.sun + '</g><path fill="var(--paper-2)" d="M9.7 32.4h16.8c3.2 0 5.6-2.3 5.6-5.2 0-2.8-2.2-5.1-5.1-5.2-.9-3.7-4-6.3-7.8-6.3-4.2 0-7.7 3.2-8 7.3-2.9.3-5 2.5-5 5.1 0 2.4 1.5 4.3 3.5 4.3z"/>',
  rain: '<g transform="translate(0 -5)">' + P.cloud + '</g><path d="M14.2 29.6l-1.8 4.6M20.6 29.7l-1.8 4.6M27 29.6l-1.8 4.6"/>',
  storm: '<g transform="translate(0 -6)">' + P.cloud + '</g><path d="M21.6 25.8l-3.9 5.6h5.1l-3.6 5.8"/>',
};

const wrap = (inner, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g filter="url(#wob)">${inner}</g></svg>`;

export const icon = (name, cls) => wrap(P[name] || '', cls);
export const weather = (name, cls) => wrap(W[name] || '', cls);

// شکلِ هر نوع شیفت
export function shiftGlyph(kind, cls) {
  switch (kind) {
    case 'morning': return wrap(P.sun, cls);
    case 'evening': return wrap(P.sunset, cls);
    case 'night': return wrap(P.moon, cls);
    case 'long': return wrap('<g transform="translate(-2 -3) scale(.78)">' + P.sun + '</g><g transform="translate(13 15) scale(.55)">' + P.sunset + '</g>', cls);
    case 'full': return wrap('<g transform="translate(-1 -2) scale(.68)">' + P.sun + '</g><g transform="translate(12 12) scale(.66)">' + P.moon + '</g>', cls);
    case 'off': return wrap(P.cup, cls);
    case 'leave': return wrap(P.heart, cls);
    default: return wrap(P.bell, cls);
  }
}

// حلقه‌ی دورِ امروز
export const ring = '<svg class="ring" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M21.5 4.6C11.2 3.4 3.9 11 4.3 20.6c.4 9.4 7.8 15.8 16.8 15.3 9-.5 15.3-7.8 14.8-16.4C35.4 10.8 28.6 4.6 18.9 5.3c-3.9.3-7 1.8-9 4.1"/></svg>';

export const squiggle = '<svg class="squiggle" viewBox="0 0 120 10" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 6.2c9-4.4 15 3.8 24-.2s15 4 24-.1 15 4.1 24 0 15 4 24 0 15 3.9 16-.4"/></svg>';

// فانوس — شخصیتِ برنامه. حالت‌ها: calm · sleepy · happy · soft
export function lantern(mood = 'calm', cls = '') {
  const eyes = {
    calm: '<circle cx="55.6" cy="80" r="1.9"/><circle cx="64.6" cy="80" r="1.9"/><path class="mouth" d="M57.5 85.6c1.7 1.3 3.6 1.3 5.3 0"/>',
    sleepy: '<path class="lid" d="M53.4 80.6c1.4.8 2.9.8 4.3 0M62.4 80.6c1.4.8 2.9.8 4.3 0"/><path class="mouth" d="M58.6 86h3.2"/><text class="zz" x="76" y="58">z</text><text class="zz z2" x="84" y="48">z</text>',
    happy: '<path class="lid" d="M53.3 81.2c1.2-2 3.3-2 4.5 0M62.3 81.2c1.2-2 3.3-2 4.5 0"/><path class="mouth" d="M56.8 85c2.1 2.3 4.6 2.3 6.7 0"/>',
    soft: '<circle cx="55.6" cy="80" r="1.9"/><circle cx="64.6" cy="80" r="1.9"/><path class="mouth" d="M58 86h4.4"/><ellipse class="blush" cx="51.6" cy="84.6" rx="2.6" ry="1.4"/><ellipse class="blush" cx="68.6" cy="84.6" rx="2.6" ry="1.4"/>',
  }[mood] || '';
  return `<svg class="lantern ${cls} m-${mood}" viewBox="0 0 120 150" aria-hidden="true">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--amber)" stop-opacity=".55"/><stop offset="1" stop-color="var(--amber)" stop-opacity="0"/></radialGradient>
    <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E8732F"/><stop offset=".55" stop-color="#F2A93B"/><stop offset="1" stop-color="#FFD36B"/></linearGradient>
  </defs>
  <circle class="halo" cx="60" cy="78" r="58" fill="url(#glow)"/>
  <g fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#wob)">
    <path d="M47.6 25.5c-.4-8.3 5.4-13.7 12.3-13.6 6.9.1 12.4 5.4 12 13.8"/>
    <path fill="var(--ink)" d="M40.2 31.6c6.8-5.6 33-5.8 39.8-.1l-2.1 6.2c-11.9-1.2-23.8-1.2-35.6.1z"/>
    <path class="glass" fill="var(--glass)" d="M38.4 38.5c14.4-1.7 29.1-1.6 43.4.1 2.9 18.4 3 53.7-.2 74.6-14.2 1.8-28.8 1.8-43.2 0-3.1-21.5-3-55.7 0-74.7z"/>
    <g class="flame-g">
      <path class="flame" fill="url(#flame)" stroke="none" d="M60.2 50.5c9.2 11.2 13.4 19.3 13.3 28.1-.1 8.1-5.9 13.6-13.4 13.5-7.4-.1-13.1-5.5-13.1-13.4 0-9 4.4-16.5 13.2-28.2z"/>
      <g class="face" fill="var(--face)" stroke="var(--face)" stroke-width="1.6">${eyes}</g>
    </g>
    <path stroke-width="1.6" opacity=".45" d="M49.4 40.2c-1.1 24.4-1 48.5.2 72.2M70.8 40.1c1.1 24.4 1 48.6-.2 72.3"/>
    <path fill="var(--ink)" d="M36.3 114.3c16-2.9 32.1-2.9 48.1.1l-2.9 9.6c-14.1 1.9-28.2 1.9-42.2-.1z"/>
  </g>
</svg>`;
}
