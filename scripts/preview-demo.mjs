/**
 * The published demo, served locally: the built static output plus the one function, wired with
 * the same rewrites `vercel.json` declares.
 *
 * What it does not do is the password — `middleware.js` is the edge's job. This is here so the
 * artifact that is about to be published can be walked through before it is.
 *
 *   npm run build:girosbet-demo && node scripts/preview-demo.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const handler = createRequire(import.meta.url)('../api/cms.js');
const ROOT = path.resolve(process.argv[2] ?? 'dist/girosbet-demo/browser');
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
  .listen(8090, '127.0.0.1', () => console.log('preview on http://127.0.0.1:8090'));
