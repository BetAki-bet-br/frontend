// Aura Bet wordmark + monogram, vector from the OFL font (no webfont in the SVG).
import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'node:fs';

const ORANGE = '#ff4d00';
const BLACK = '#0c0b0a';
const WHITE = '#ffffff';
const font = opentype.loadSync('BarlowCondensed-BlackItalic.ttf');
const SIZE = 100; // font size in px for a 1000 upm font -> ascent ~ 700
const TRACK = -0.01 * SIZE; // -1% tracking

function word(text, x0, y) {
  const paths = [];
  let x = x0;
  const glyphs = font.stringToGlyphs(text);
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, y, SIZE);
    paths.push(p.toPathData(2));
    x += (g.advanceWidth / font.unitsPerEm) * SIZE + TRACK;
    if (i < glyphs.length - 1) x += (font.getKerningValue(g, glyphs[i + 1]) / font.unitsPerEm) * SIZE;
  });
  return { d: paths.join(' '), end: x };
}

// Cap height of Barlow Condensed Black ~ 700/1000 -> 70px; italic overhang handled by bbox below.
const y = 72;
const aura = word('AURA', 4, y);
const bet = word('BET', aura.end - TRACK, y);
const W = Math.ceil(bet.end + 6);
const H = 80;

function wordmark(colorAura, colorBet) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Aura Bet">
  <path fill="${colorAura}" d="${aura.d}"/>
  <path fill="${colorBet}" d="${bet.d}"/>
</svg>`;
}

// Monogram: italic A filling the tile, crossbar cut out along the 12deg italic angle and replaced
// by an orange streak that starts inside the A and flies out to the right.
const A = font.charToGlyph('A');
const ASIZE = 168;
const BASE = 174;
const CAP = 0.7 * ASIZE;
const probe = A.getPath(0, BASE, ASIZE).getBoundingBox();
const AX = 22 - probe.x1;
const apath = A.getPath(AX, BASE, ASIZE).toPathData(2);
const y1 = BASE - 0.44 * CAP, y2 = BASE - 0.25 * CAP; // crossbar band
const t = Math.tan(12 * Math.PI / 180);
const cx = AX + (probe.x2 - probe.x1) * 0.48; // streak starts inside the A
const band = (x0, x1) => `M ${x0 + (BASE - y1) * t * 0} ${y1} L ${x1} ${y1} L ${x1 - (y2 - y1) * t} ${y2} L ${x0 - (y2 - y1) * t} ${y2} Z`;
const monogram = (bg, fgA, fgBar) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="Aura Bet">
  ${bg ? `<rect width="200" height="200" rx="32" fill="${bg}"/>` : ''}
  <defs><mask id="cut"><rect width="200" height="200" fill="#fff"/><path d="${band(-20, 220)}" fill="#000"/></mask></defs>
  <path fill="${fgA}" d="${apath}" mask="url(#cut)"/>
  <path fill="${fgBar}" d="${band(cx, 186)}"/>
</svg>`;

const out = 'out';
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/logo-white.svg`, wordmark(WHITE, ORANGE));
fs.writeFileSync(`${out}/logo-color.svg`, wordmark(BLACK, ORANGE));
fs.writeFileSync(`${out}/logo-mono-white.svg`, wordmark(WHITE, WHITE));
fs.writeFileSync(`${out}/icon.svg`, monogram(BLACK, WHITE, ORANGE));
fs.writeFileSync(`${out}/icon-orange.svg`, monogram(ORANGE, BLACK, WHITE));
fs.writeFileSync(`${out}/icon-alpha.svg`, monogram(null, WHITE, ORANGE));

await sharp(Buffer.from(wordmark(BLACK, ORANGE))).resize(606).png().toFile(`${out}/logo.png`);
await sharp(Buffer.from(wordmark(WHITE, ORANGE))).resize(320).webp({ quality: 80 }).toFile(`${out}/logo-mobile.webp`);
await sharp(Buffer.from(monogram(BLACK, WHITE, ORANGE))).resize(64).png().toFile(`${out}/favicon.png`);
await sharp(Buffer.from(monogram(BLACK, WHITE, ORANGE))).resize(180).flatten({ background: BLACK }).png().toFile(`${out}/apple-touch-icon.png`);

// Contact sheet for review
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" width="1200" height="640">
  <rect width="1200" height="640" fill="${BLACK}"/>
  <rect x="0" y="0" width="1200" height="120" fill="#4f1800" opacity=".55" transform="skewX(-12) translate(60 0)"/>
  <g transform="translate(80 60) scale(1.6)">${wordmark(WHITE, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  <rect x="80" y="230" width="${W * 1.6 + 60}" height="170" rx="4" fill="#f6f4f1"/>
  <g transform="translate(110 275) scale(1.6)">${wordmark(BLACK, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '')}</g>
  <g transform="translate(80 440) scale(0.8)">${monogram(BLACK, WHITE, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '').replace('id="cut"', 'id="cut1"').replace('url(#cut)', 'url(#cut1)')}</g>
  <rect x="270" y="440" width="160" height="160" rx="4" fill="#1f1e1b"/>
  <g transform="translate(270 440) scale(0.8)">${monogram(ORANGE, BLACK, WHITE).replace(/<svg[^>]*>|<\/svg>/g, '').replace('id="cut"', 'id="cut2"').replace('url(#cut)', 'url(#cut2)')}</g>
  <g transform="translate(460 440) scale(0.8)">${monogram(null, WHITE, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '').replace('id="cut"', 'id="cut3"').replace('url(#cut)', 'url(#cut3)')}</g>
  <g transform="translate(680 470) scale(0.32)">${monogram(BLACK, WHITE, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '').replace('id="cut"', 'id="cut4"').replace('url(#cut)', 'url(#cut4)')}</g>
  <g transform="translate(760 470) scale(0.16)">${monogram(BLACK, WHITE, ORANGE).replace(/<svg[^>]*>|<\/svg>/g, '').replace('id="cut"', 'id="cut5"').replace('url(#cut)', 'url(#cut5)')}</g>
  <rect x="820" y="470" width="360" height="56" rx="4" fill="${ORANGE}"/>
  <rect x="820" y="540" width="360" height="56" rx="4" fill="${WHITE}"/>
</svg>`;
await sharp(Buffer.from(sheet)).png().toFile(`${out}/contact-sheet.png`);
console.log('wordmark', W, 'x', H);
