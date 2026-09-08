/*
 * Generates a brand's `assets/icons/*.svg` from another brand's copies by swapping hex colours.
 *
 *   node scripts/recolor-brand-icons.js <source-slug> <target-slug> [--force]
 *
 * Reads every SVG in `brands/<source>/assets/icons/`, applies the map in
 * `brands/<target>/icon-colors.json` ({ "#source": "#target", ... }, case-insensitive, 6-digit hex)
 * and writes the result to `brands/<target>/assets/icons/`. Files that already exist in the target
 * are left alone unless `--force` is given, so hand-tuned icons survive a re-run.
 *
 * Afterwards it lists any colour left in the output that is still in the source brand's lime/olive
 * family — those are the ones the map forgot.
 */
const fs = require('fs');
const path = require('path');

const [source, target, ...flags] = process.argv.slice(2);
if (!source || !target) {
  console.error('usage: node scripts/recolor-brand-icons.js <source-slug> <target-slug> [--force]');
  process.exit(1);
}
const force = flags.includes('--force');
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'brands', source, 'assets', 'icons');
const dstDir = path.join(root, 'brands', target, 'assets', 'icons');
const mapFile = path.join(root, 'brands', target, 'icon-colors.json');

if (!fs.existsSync(mapFile)) {
  console.error(`missing ${path.relative(root, mapFile)}`);
  process.exit(1);
}
const rawMap = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const map = Object.entries(rawMap).map(([from, to]) => [from.toLowerCase(), to.toLowerCase()]);
fs.mkdirSync(dstDir, { recursive: true });

// Lime/olive family of the betaki palette (#c6d42d, #bcd200, #869502, #202400 ...): hue 50-95.
function isLimeFamily(hex) {
  const h = hex.slice(1);
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return false;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / d + 2) * 60;
  else hue = ((r - g) / d + 4) * 60;
  return hue >= 50 && hue <= 95 && s >= 0.25 && l >= 0.03 && l <= 0.85;
}

// The template ships every icon in this placeholder magenta; a kept file that still carries it was
// copied from `brands/_template` and never regenerated.
const PLACEHOLDER = /#(a21caf|831693|5c0f68)\b/i;

let written = 0;
let skipped = 0;
const leftovers = new Map();
const stale = [];
for (const name of fs
  .readdirSync(srcDir)
  .filter((f) => f.endsWith('.svg'))
  .sort()) {
  const out = path.join(dstDir, name);
  if (fs.existsSync(out) && !force) {
    if (PLACEHOLDER.test(fs.readFileSync(out, 'utf8'))) stale.push(name);
    skipped++;
    continue;
  }
  let svg = fs.readFileSync(path.join(srcDir, name), 'utf8');
  for (const [from, to] of map) {
    svg = svg.replace(new RegExp(from.replace('#', '#'), 'gi'), to);
  }
  // Editor ids that name the source brand ("[BETAKI] Card", "betaki-logo") do not belong in
  // another brand's bundle.
  svg = svg.replace(
    /id="([^"]*)"/g,
    (m, id) => `id="${id.replace(new RegExp(`\\[?${source}\\]?\\s*`, 'gi'), '').trim() || 'icon'}"`,
  );
  fs.writeFileSync(out, svg);
  written++;
  for (const hex of svg.match(/#[0-9a-f]{6}\b/gi) || []) {
    if (isLimeFamily(hex.toLowerCase()))
      leftovers.set(name, [...new Set([...(leftovers.get(name) || []), hex.toLowerCase()])]);
  }
}

console.log(`${target}: ${written} icon(s) written, ${skipped} kept (use --force to regenerate)`);
if (leftovers.size) {
  console.log('colours still in the source family — add them to icon-colors.json:');
  for (const [name, hexes] of leftovers) console.log(`  ${name}: ${hexes.join(' ')}`);
  process.exitCode = 2;
}
if (stale.length) {
  console.log(
    `${stale.length} kept file(s) still carry the template placeholder magenta — delete them or run with --force:`,
  );
  for (const name of stale) console.log(`  ${name}`);
  process.exitCode = 2;
}
