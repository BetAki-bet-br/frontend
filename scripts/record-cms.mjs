/**
 * Records every backoffice (CMS) response the app asks for, into a snapshot the demo deploy
 * serves instead of a live Laravel.
 *
 * Guessing the request shapes by reading the services does not work: several of them take an
 * optional `params` object, so the query string is decided at the call site. Driving the real app
 * and recording what actually goes over the wire cannot drift from what the app asks for.
 *
 *   node scripts/record-cms.mjs http://localhost:4323 demo/cms
 *
 * The dev server it points at must be serving a brand whose `backofficeApiUrl` reaches a live CMS.
 */
import puppeteer from 'puppeteer';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const APP = process.argv[2] ?? 'http://localhost:4323';
const OUT = process.argv[3] ?? 'demo/cms';

/** Routes to walk. Between them they touch every CMS endpoint the player-facing app has. */
const ROUTES = [
  '/games',
  '/games/live',
  '/games/search',
  '/games/live/search',
  '/games/category/providers',
  '/games/live/category/providers',
  '/games/category/softswiss',
  '/promotions',
  '/profile/general',
  '/profile/promo',
];

/** A request is one recording. Query order is normalised so the lookup is stable. */
function signature(method, url, body) {
  const u = new URL(url);
  const query = [...u.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  const qs = new URLSearchParams(query).toString();
  const bodyKey = body ? ':' + createHash('sha1').update(body).digest('hex').slice(0, 12) : '';
  return `${method} ${u.pathname}${qs ? '?' + qs : ''}${bodyKey}`;
}

const recorded = new Map();

const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1440, height: 1000 } });
const page = await browser.newPage();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

page.on('response', async (res) => {
  const req = res.request();
  const url = res.url();
  if (!url.includes('/backoffice/api/v1/')) return;
  if (!res.ok()) return;
  let text;
  try {
    text = await res.text();
  } catch {
    return; // body already gone (redirect, aborted); the next visit records it
  }
  const sig = signature(req.method(), url, req.postData());
  if (!recorded.has(sig)) recorded.set(sig, text);
});

await page.goto(APP, { waitUntil: 'networkidle2', timeout: 60000 });
await page.evaluate(() => {
  localStorage.setItem('age-verified', 'true');
  localStorage.setItem('cookie-consent', 'true');
});

// Signed in, because some rows only render for a player.
await page.goto(`${APP}/auth/login`, { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(1500);
await (await page.locator('#username').setTimeout(15000)).fill('12345678909');
await (await page.locator('#password').setTimeout(15000)).fill('demo');
// The form has to see both values before the submit button leaves its disabled state.
await page.waitForFunction(
  () => {
    const f = document.querySelector('form');
    const b = f && f.querySelector('button[type="submit"]');
    return !!b && !b.disabled;
  },
  { timeout: 15000 },
);
await page.evaluate(() => {
  const form = document.querySelector('form');
  const b =
    form &&
    (form.querySelector('button[type="submit"]') ||
      [...form.querySelectorAll('button')].find((x) => /entrar/i.test(x.textContent || '')));
  if (b) b.click();
});
await page.waitForFunction(() => !!localStorage.getItem('credentials'), { timeout: 20000 });
console.log('signed in as the demo player');

for (const route of ROUTES) {
  try {
    await page.goto(APP + route, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(3500);
    console.log(`walked ${route} (${recorded.size} recordings so far)`);
  } catch (err) {
    console.log(`walked ${route} FAILED: ${String(err).slice(0, 120)}`);
  }
}

// Every category and provider the two lobbies link to, so a deep link works in the demo.
const links = [];
for (const lobby of ['/games', '/games/live']) {
  await page.goto(APP + lobby, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  links.push(
    ...(await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))),
  );
}
const deep = [...new Set(links.filter((h) => h && /^\/games\/(live\/)?(category|provider)\//.test(h)))].slice(0, 60);
for (const href of deep) {
  try {
    await page.goto(APP + href, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(2000);
  } catch {
    // a route that will not open live will not open in the demo either
  }
}
console.log(`deep links walked: ${deep.length} (${recorded.size} recordings)`);

// The in-game page, which is what pulls a slot by its external id, and then the
// recently-played row, which only has anything in it once a game has been launched.
const external = await page.evaluate(async () => {
  const res = await fetch('/backoffice/api/v1/slots');
  const body = await res.json();
  const rows = Array.isArray(body) ? body : (body.data ?? []);
  return rows
    .map((s) => s.provider_game_id)
    .filter(Boolean)
    .slice(0, 6);
});
console.log('slot ids to walk in-game: ' + external.join(', '));
for (const ext of external) {
  try {
    await page.goto(`${APP}/game/${ext}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
  } catch {
    // a game that will not open live will not open in the demo either
  }
}
for (const recent of ['/games/category/recent', '/games/live/category/recent']) {
  try {
    await page.goto(APP + recent, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(4000);
  } catch {
    // same
  }
}
console.log(`in-game and recently-played walked (${recorded.size} recordings)`);

await browser.close();

// Merged with whatever is already on disk, not written over it. One crawl is not deterministic —
// which rows the lobby renders decides which deep links exist — so running the recorder again
// adds coverage instead of trading one gap for another.
const index = {};
try {
  Object.assign(index, JSON.parse(await fs.readFile(path.join(OUT, 'index.json'), 'utf8')));
} catch {
  // first run
}
await fs.mkdir(path.join(OUT, 'responses'), { recursive: true });

let added = 0;
for (const [sig, body] of recorded) {
  const name = createHash('sha1').update(sig).digest('hex').slice(0, 16) + '.json';
  if (!index[sig]) added++;
  await fs.writeFile(path.join(OUT, 'responses', name), body);
  index[sig] = name;
}
await fs.writeFile(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));

/**
 * Every slot seen anywhere in the snapshot, keyed by external id.
 *
 * The demo player can open any game the lobby shows, and what they open decides which
 * `by-ids` and `by-external-id` calls the recently-played row then makes — so those calls cannot
 * all be recorded ahead of time. The snapshot server answers them from this catalogue instead of
 * a recorded body, which is why a visitor's own path through the demo still works.
 */
const catalogue = {};
const collect = (node) => {
  if (Array.isArray(node)) return node.forEach(collect);
  if (!node || typeof node !== 'object') return;
  if (typeof node.provider_game_id === 'string' && node.provider_game_id) {
    catalogue[node.provider_game_id] ??= node;
  }
  for (const value of Object.values(node)) collect(value);
};
for (const name of new Set(Object.values(index))) {
  try {
    collect(JSON.parse(await fs.readFile(path.join(OUT, 'responses', name), 'utf8')));
  } catch {
    // not JSON, or a file from an older run that no longer exists
  }
}
await fs.writeFile(path.join(OUT, 'slots-catalogue.json'), JSON.stringify(catalogue));

const total = (
  await Promise.all(
    [...new Set(Object.values(index))].map(async (n) => (await fs.stat(path.join(OUT, 'responses', n))).size),
  )
).reduce((a, b) => a + b, 0);

console.log(
  `
${Object.keys(index).length} recordings (${added} new this run), ` +
    `${(total / 1024).toFixed(1)} kB of JSON -> ${OUT}`,
);
console.log(`${Object.keys(catalogue).length} slots in the catalogue`);
for (const sig of Object.keys(index).sort()) console.log('  ' + sig);
