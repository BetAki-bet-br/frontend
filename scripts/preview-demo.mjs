/**
 * The published demo, served locally: the built static output plus the one function, wired with
 * the same rewrites `vercel.json` declares.
 *
 * What it does not do is the password — `middleware.js` is the edge's job. This is here so the
 * artifact that is about to be published can be walked through before it is.
 *
 *   npm run build:girosbet-demo && node scripts/preview-demo.mjs
 *   node scripts/preview-demo.mjs dist/superbet-demo/browser 8091 Superbet   # another brand: its dist, port and name
 *   node scripts/preview-demo.mjs dist/aurabet-demo/browser 8092 "Aura Bet" aurabet   # with its own snapshot
 *
 * The third argument becomes DEMO_BRAND_NAME for `api/cms.js`, which swaps the recorded brand name
 * for it; leave it out for the brand the snapshot was recorded with. The fourth is the brand slug:
 * with it the function serves `demo/cms-<slug>` when that recording exists, and the shared
 * `demo/cms` when it does not. `DEMO_CMS_DIR` names a directory outright and wins over the slug.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(process.argv[2] ?? 'dist/girosbet-demo/browser');
const PORT = Number(process.argv[3] ?? 8090);
if (process.argv[4]) process.env.DEMO_BRAND_NAME = process.argv[4];
if (process.argv[5]) process.env.DEMO_BRAND_SLUG = process.argv[5];
// Loaded only after the environment is set: the function picks its snapshot root at load time.
const handler = require('../api/cms.js');
const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, 'http://localhost');
    const cms = u.pathname.match(/^\/backoffice\/api\/v1\/(.*)$/);
    if (cms) {
      u.searchParams.set('path', cms[1]);
      req.url = '/api/cms?' + u.searchParams.toString();
      return handler(req, res);
    }
    let file = path.join(ROOT, decodeURIComponent(u.pathname));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(ROOT, 'index.html');
    res.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, '127.0.0.1', () => console.log(`preview on http://127.0.0.1:${PORT}`));
