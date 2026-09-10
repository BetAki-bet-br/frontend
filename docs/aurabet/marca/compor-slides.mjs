// Aura Bet: compoe titulo, subtitulo e CTA sobre os slides crus do carrossel do lobby.
//
// Como rodar (o script nao vive num pacote npm; ele precisa de `opentype.js` e `sharp` e das
// quatro fontes OFL ao lado dele):
//
//   mkdir compor && cd compor
//   npm init -y && npm i opentype.js@1.3.4 sharp
//   B=https://raw.githubusercontent.com/google/fonts/main/ofl
//   curl -sSLO $B/barlowcondensed/BarlowCondensed-BlackItalic.ttf
//   for f in Barlow-Medium Barlow-SemiBold Barlow-Bold; do curl -sSLO $B/barlow/$f.ttf; done
//   cp <repo>/docs/aurabet/marca/compor-slides.mjs .
//   node compor-slides.mjs [<dir dos crus>] [<dir de saida>]
//
// Padrao: le `docs/aurabet/midias/lote-1/prontos` e escreve `.../prontos/com-texto` mais a folha
// de contato `_folha-de-contato.jpg` (cada slide a 800 px e a 390 px, para conferir o mobile).
// O texto vira caminho SVG com opentype.js: nada depende de fonte instalada no librsvg do sharp.
import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ORANGE = '#ff4d00';
const WHITE = '#f5f3f0';
const W = 1600;
const H = 500;
const MARGIN = 80;
const COL = 600; // largura util do bloco de texto (fica no terco esquerdo)

const SRC = process.argv[2] || 'D:/code/betaki/frontend/docs/aurabet/midias/lote-1/prontos';
const OUT = process.argv[3] || 'D:/code/betaki/frontend/docs/aurabet/midias/lote-1/prontos/com-texto';

const display = opentype.loadSync('BarlowCondensed-BlackItalic.ttf');
const body600 = opentype.loadSync('Barlow-SemiBold.ttf');
const body700 = opentype.loadSync('Barlow-Bold.ttf');

const capRatio = (f) => (f.tables.os2.sCapHeight || 0.7 * f.unitsPerEm) / f.unitsPerEm;
const widthOf = (f, text, size) => f.getAdvanceWidth(text, size);

// Toda string entra em forma composta. Em NFD o acento vira um combining mark de avanco zero, que
// o opentype.js posiciona pela caneta e nao pela letra; em fonte sem esse mark, cai no `.notdef`.
const nfc = (s) => s.normalize('NFC');

// Falha alto se algum caractere nao existir na fonte (`.notdef`, indice 0) ou vier sem avanco.
function conferirGlifos(f, text, onde) {
  const nome = f.names.fullName?.en ?? 'fonte';
  f.stringToGlyphs(text).forEach((g, i) => {
    const c = [...text][i] ?? '?';
    const cp = 'U+' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');
    if (g.index === 0) throw new Error(`${onde}: ${nome} nao tem glifo para ${JSON.stringify(c)} (${cp})`);
    if (!g.advanceWidth) throw new Error(`${onde}: ${JSON.stringify(c)} (${cp}) tem avanco zero em ${nome}`);
  });
}

// Caixa de tinta de uma linha, em relacao a linha de base (y1 negativo sobe, y2 positivo desce).
const tinta = (f, text, size) => f.getPath(text, 0, 0, size).getBoundingBox();

// Entrelinha unica, larga o bastante para a tinta de uma linha nunca encostar na de cima: acento
// de maiuscula (o Á de CLÁSSICO sobe 22 px acima da altura de capitular) e descida de minuscula.
function entrelinha(f, lines, size, base, folga) {
  let step = base;
  for (let i = 0; i + 1 < lines.length; i++) {
    step = Math.max(step, tinta(f, lines[i], size).y2 - tinta(f, lines[i + 1], size).y1 + folga);
  }
  return step;
}

function wrap(f, text, size, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && widthOf(f, test, size) > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Maior corpo cujo texto cabe em `maxWidth` quebrado em ate `maxLines` linhas.
function fit(f, text, maxWidth, hi, lo, maxLines) {
  for (let size = hi; size >= lo; size -= 1) {
    const lines = wrap(f, text, size, maxWidth);
    if (lines.length <= maxLines && lines.every((l) => widthOf(f, l, size) <= maxWidth)) {
      return { size, lines };
    }
  }
  const lines = wrap(f, text, lo, maxWidth);
  return { size: lo, lines };
}

// Subtitulo: prefere uma linha so, do maior corpo (40) ao menor aceitavel (34); se nao couber,
// quebra em duas linhas equilibradas no corpo cheio, em vez de deixar uma orfa.
function fitSub(text) {
  for (let size = 40; size >= 34; size -= 1) {
    if (widthOf(body600, text, size) <= COL) return { size, lines: [text] };
  }
  const size = 40;
  const words = text.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const wa = widthOf(body600, a, size);
    const wb = widthOf(body600, b, size);
    if (wa > COL || wb > COL) continue;
    const score = Math.abs(wa - wb);
    if (!best || score < best.score) best = { score, lines: [a, b] };
  }
  return best ? { size, lines: best.lines } : { size, lines: wrap(body600, text, size, COL) };
}

const pathOf = (f, text, x, y, size) => f.getPath(text, x, y, size).toPathData(2);

// Botao com o motivo da marca: raio 4 px e um corte diagonal de 12 graus na ponta direita.
function cutButton(x, y, w, h, r = 4) {
  const s = h * Math.tan((12 * Math.PI) / 180);
  return [
    `M ${x + r} ${y}`,
    `L ${x + w} ${y}`,
    `L ${x + w - s} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ');
}

const SLIDES = [
  { key: 'boas-vindas', titulo: 'ENTRA EM CAMPO.', sub: 'Dobro no primeiro depósito, até R$ 500', cta: 'Criar conta' },
  {
    key: 'esportes',
    titulo: 'ODDS TURBINADAS NO CLÁSSICO.',
    sub: 'Aposte nos jogos do fim de semana',
    cta: 'Apostar agora',
  },
  { key: 'crash', titulo: 'DECOLAGEM', sub: 'O crash da casa, verificável a cada rodada', cta: 'Jogar' },
  { key: 'originais', titulo: 'ORIGINAIS DA CASA', sub: 'Tigre de Jade, Dragão de Fogo e Decolagem', cta: 'Ver todos' },
  { key: 'ao-vivo', titulo: 'MESA ABERTA.', sub: 'Roleta e blackjack ao vivo, 24 horas', cta: 'Jogar agora' },
  { key: 'torneio', titulo: 'TORNEIO SEMANAL', sub: 'R$ 10.000 em prêmios toda semana', cta: 'Participar' },
].map((s) => ({ ...s, titulo: nfc(s.titulo), sub: nfc(s.sub), cta: nfc(s.cta) }));

function compose(slide) {
  conferirGlifos(display, slide.titulo, `${slide.key}/titulo`);
  conferirGlifos(body600, slide.sub, `${slide.key}/subtitulo`);
  conferirGlifos(body700, slide.cta, `${slide.key}/cta`);

  const title = fit(display, slide.titulo, COL, 160, 120, 3);
  // A primeira linha manda na altura do bloco pela tinta, nao pela capitular: se ela levar acento
  // de maiuscula, o acento e que encosta no topo.
  const titleCap = Math.max(title.size * capRatio(display), -tinta(display, title.lines[0], title.size).y1);
  const lineStep = entrelinha(display, title.lines, title.size, title.size * 0.86, 6);

  const sub = fitSub(slide.sub);
  const subStep = entrelinha(body600, sub.lines, sub.size, sub.size * 1.22, 4);

  const CTA_SIZE = 30;
  const ctaW = widthOf(body700, slide.cta, CTA_SIZE) + 2 * 30 + 14; // padding + folga do corte
  const ctaH = 64;

  const gapTitleSub = 30;
  const gapSubCta = 30;
  const blockH =
    titleCap +
    (title.lines.length - 1) * lineStep +
    gapTitleSub +
    (sub.lines.length - 1) * subStep +
    sub.size * capRatio(body600) +
    gapSubCta +
    ctaH;

  let y = Math.round((H - blockH) / 2);
  const titleBase = [];
  let cursor = y + titleCap;
  for (const line of title.lines) {
    titleBase.push({ line, y: cursor });
    cursor += lineStep;
  }
  const subTop = y + titleCap + (title.lines.length - 1) * lineStep + gapTitleSub;
  const subBase = [];
  let sc = subTop + sub.size * capRatio(body600);
  for (const line of sub.lines) {
    subBase.push({ line, y: sc });
    sc += subStep;
  }
  const ctaY = subTop + (sub.lines.length - 1) * subStep + sub.size * capRatio(body600) + gapSubCta;

  const veilTo = Math.round(MARGIN + COL + 380);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="veu" x1="0" y1="0" x2="${veilTo}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0c0b0a" stop-opacity="0.7"/>
      <stop offset="0.35" stop-color="#0c0b0a" stop-opacity="0.62"/>
      <stop offset="0.55" stop-color="#0c0b0a" stop-opacity="0.46"/>
      <stop offset="0.72" stop-color="#0c0b0a" stop-opacity="0.26"/>
      <stop offset="0.86" stop-color="#0c0b0a" stop-opacity="0.1"/>
      <stop offset="1" stop-color="#0c0b0a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${veilTo}" height="${H}" fill="url(#veu)"/>
  ${titleBase.map((l) => `<path fill="${WHITE}" d="${pathOf(display, l.line, MARGIN, l.y, title.size)}"/>`).join('\n  ')}
  ${subBase.map((l) => `<path fill="${WHITE}" fill-opacity="0.85" d="${pathOf(body600, l.line, MARGIN, l.y, sub.size)}"/>`).join('\n  ')}
  <path fill="${ORANGE}" d="${cutButton(MARGIN, ctaY, ctaW, ctaH)}"/>
  <path fill="#ffffff" d="${pathOf(body700, slide.cta, MARGIN + 30, ctaY + ctaH / 2 + (CTA_SIZE * capRatio(body700)) / 2, CTA_SIZE)}"/>
</svg>`;

  return { svg, title, sub, titleCap, ctaW };
}

fs.mkdirSync(OUT, { recursive: true });
const report = [];
for (const slide of SLIDES) {
  const { svg, title, sub, titleCap } = compose(slide);
  const file = path.join(OUT, `slide-${slide.key}.png`);
  await sharp(path.join(SRC, `slide-${slide.key}.png`))
    .resize(W, H, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(file);
  report.push(
    `${slide.key.padEnd(12)} titulo ${String(title.size).padStart(3)}px (cap ${titleCap.toFixed(0)}px, ${title.lines.length} linha(s))  subtitulo ${sub.size}px (${sub.lines.length} linha(s))`,
  );
}
console.log(report.join('\n'));

// Folha de contato: os seis a 800 px e a 390 px de largura, para conferir o mobile.
const wide = 800;
const small = 390;
const rowH = Math.round((wide * H) / W);
const smallH = Math.round((small * H) / W);
const pad = 16;
const sheetW = wide + small + pad * 3;
const sheetH = SLIDES.length * (rowH + pad) + pad;
const layers = [];
for (let i = 0; i < SLIDES.length; i++) {
  const src = path.join(OUT, `slide-${SLIDES[i].key}.png`);
  const top = pad + i * (rowH + pad);
  layers.push({ input: await sharp(src).resize(wide).png().toBuffer(), top, left: pad });
  layers.push({
    input: await sharp(src).resize(small).png().toBuffer(),
    top: top + Math.round((rowH - smallH) / 2),
    left: pad * 2 + wide,
  });
}
await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#141210' } })
  .composite(layers)
  .jpeg({ quality: 86 })
  .toFile(path.join(OUT, '_folha-de-contato.jpg'));
console.log('folha de contato', sheetW, 'x', sheetH);
