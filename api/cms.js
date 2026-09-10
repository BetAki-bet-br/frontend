/**
 * Serves the recorded backoffice (CMS) snapshot to the published demo.
 *
 * The demo has no Laravel behind it. `scripts/record-cms.mjs` drives the real app against a live
 * CMS and writes down every response it asked for; this reads that recording back. It is the only
 * server-side code the demo has, and it is read-only by construction: there is nothing here that
 * writes, and nothing that reaches a database.
 *
 * Reached through the rewrite in `vercel.json`, which maps `/backoffice/api/v1/*` here, so the
 * brand's `backofficeApiUrl` needs no special case — it is `/backoffice`, the same value the real
 * production build uses.
 */
const fs = require('node:fs');
const path = require('node:path');

/**
 * Which recording to serve. The snapshot is per brand when there is one for that brand:
 * `DEMO_CMS_DIR` names a directory outright, `DEMO_BRAND_SLUG` asks for `demo/cms-<slug>`, and
 * whatever is not there falls back to `demo/cms`, the shared recording made against GirosBet.
 * A directory only counts if it actually holds an `index.json`, so a typo degrades to the
 * fallback instead of serving 404 for every path.
 */
function resolveRoot() {
  const candidates = [];
  const dir = (process.env.DEMO_CMS_DIR ?? '').trim();
  const slug = (process.env.DEMO_BRAND_SLUG ?? '').trim();
  if (dir) candidates.push(path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir));
  if (slug) candidates.push(path.join(process.cwd(), 'demo', `cms-${slug}`));
  const fallback = path.join(process.cwd(), 'demo', 'cms');
  candidates.push(fallback);
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.json'))) return candidate;
  }
  return fallback;
}

const ROOT = resolveRoot();

/**
 * The snapshot was recorded against the GirosBet CMS, so a few strings in it carry that brand's
 * name (the loyalty-club menu, for one). A demo of another brand sets DEMO_BRAND_NAME and gets the
 * recording with its own name in those places, which is what that brand's own CMS would hold.
 * Nothing else changes: same games, same lobbies, same banners. Unset, the recording is served as is.
 */
const RECORDED_BRAND_NAME = 'GirosBet';

function rebrand(text) {
  const name = (process.env.DEMO_BRAND_NAME ?? '').trim();
  if (!name || name === RECORDED_BRAND_NAME) return text;
  return text.split(RECORDED_BRAND_NAME).join(JSON.stringify(name).slice(1, -1));
}

const index = readJson(path.join(ROOT, 'index.json'), {});
const catalogue = readJson(path.join(ROOT, 'slots-catalogue.json'), {});

/** Path-only fallback: the first recording for a path, whatever query it was made with. */
const byPath = new Map();
for (const signature of Object.keys(index)) {
  const [method, rest] = splitSignature(signature);
  const key = `${method} ${rest.split('?')[0].split(':')[0]}`;
  if (!byPath.has(key)) byPath.set(key, index[signature]);
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function splitSignature(signature) {
  const at = signature.indexOf(' ');
  return [signature.slice(0, at), signature.slice(at + 1)];
}

/** Same shape the recorder writes, so a request made twice hashes the same way. */
function signature(method, pathname, query, body) {
  const sorted = [...query.entries()].sort(([a], [b]) => a.localeCompare(b));
  const qs = new URLSearchParams(sorted).toString();
  const bodyKey = body ? ':' + require('node:crypto').createHash('sha1').update(body).digest('hex').slice(0, 12) : '';
  return `${method} ${pathname}${qs ? '?' + qs : ''}${bodyKey}`;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  // The snapshot only changes when someone re-records it and redeploys.
  res.setHeader('cache-control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
  res.end(rebrand(typeof payload === 'string' ? payload : JSON.stringify(payload)));
}

function recorded(name) {
  try {
    return fs.readFileSync(path.join(ROOT, 'responses', name), 'utf8');
  } catch {
    return null;
  }
}

async function rawBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks).toString('utf8') : '';
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const query = url.searchParams;
  const suffix = query.get('path') ?? '';
  query.delete('path');

  const pathname = `/backoffice/api/v1/${suffix}`;
  const body = req.method === 'POST' ? await rawBody(req) : '';

  const exact = index[signature(req.method, pathname, query, body || null)];
  if (exact) {
    const hit = recorded(exact);
    if (hit !== null) return send(res, 200, hit);
  }

  // The two calls that cannot be recorded ahead of time, because the visitor decides them by
  // choosing which game to open. Both are answered from the catalogue the recorder harvested.
  if (req.method === 'POST' && suffix === 'slots/by-ids') {
    let ids = [];
    try {
      ids = JSON.parse(body || '{}').externalIds ?? [];
    } catch {
      // a malformed body gets an empty list, same as the real endpoint would give for no matches
    }
    return send(res, 200, ids.map((id) => catalogue[id]).filter(Boolean));
  }

  const external = suffix.match(/^slots\/by-external-id\/(.+)$/);
  if (req.method === 'GET' && external) {
    const slot = catalogue[decodeURIComponent(external[1])];
    return slot ? send(res, 200, slot) : send(res, 404, { message: 'Slot not in the demo snapshot' });
  }

  // A query combination nobody walked while recording still gets the right kind of answer.
  const loose = byPath.get(`${req.method} ${pathname}`);
  if (loose) {
    const hit = recorded(loose);
    if (hit !== null) return send(res, 200, hit);
  }

  return send(res, 404, { message: 'Not in the demo snapshot', path: pathname });
};
