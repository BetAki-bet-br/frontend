/**
 * Puts the whole demo behind a password.
 *
 * Vercel's own Password Protection is a Pro feature and this project is on Hobby, so the gate is
 * here instead. It runs at the edge, before anything is served — the static bundle, the CMS
 * snapshot and the portal stub are all behind it — so it is a real gate and not a screen the page
 * draws after it has already handed over its code.
 *
 * The password lives in the `DEMO_PASSWORD` environment variable of the Vercel project, never in
 * the repository. With none set the demo stays shut rather than falling open.
 *
 * ## Why a cookie and not only Basic Auth
 *
 * The app's own `authInterceptor` puts the player's session key in `Authorization: Bearer …` on
 * every XHR, which overwrites the Basic credentials the browser would otherwise send. Those
 * requests would then be 401s — and the same interceptor signs the player out on any 401, so a
 * pure Basic gate logs the visitor out the moment the app makes its first authenticated call.
 *
 * So Basic Auth is only the front door: passing it plants a cookie, and the cookie is what every
 * later request is judged on. Cookies travel on XHRs regardless of what the Authorization header
 * is being used for.
 */
export const config = {
  // Everything. There is nothing in this deployment that should be readable without the password.
  matcher: '/((?!_vercel/).*)',
};

const USER = 'girosbet';
const COOKIE = 'demo_gate';
/** A month: long enough that whoever was sent the link is not asked again mid-demo. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
/** Marks the one redirect that plants the cookie, so a browser refusing it cannot loop. */
const PLANTED = '_gate';

export default async function middleware(request) {
  const expected = process.env.DEMO_PASSWORD;

  if (!expected) {
    return text(503, 'This demo has no DEMO_PASSWORD set, so it is closed.');
  }

  const token = await gateToken(expected);
  const url = new URL(request.url);

  if (readCookie(request, COOKIE) === token) {
    return undefined; // through to the static output, the snapshot, or the stub
  }

  if (!basicAuthMatches(request, expected)) {
    return new Response('Demonstração GirosBet — informe a senha.', {
      status: 401,
      headers: {
        'www-authenticate': `Basic realm="Demonstracao GirosBet", charset="UTF-8"`,
        'content-type': 'text/plain; charset=utf-8',
        'x-robots-tag': 'noindex, nofollow',
      },
    });
  }

  // The password is right but the cookie is not planted yet. One redirect does it — and if the
  // browser comes back still without the cookie, say so instead of bouncing forever.
  if (url.searchParams.has(PLANTED)) {
    return text(400, 'This demo needs cookies enabled for this site.');
  }

  const target = new URL(url);
  target.searchParams.set(PLANTED, '1');

  return new Response(null, {
    status: 302,
    headers: {
      location: target.pathname + target.search,
      'set-cookie': `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function text(status, body) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'noindex, nofollow' },
  });
}

/** The cookie carries a hash, so the password itself is never written to the visitor's disk. */
async function gateToken(password) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`girosbet-demo:${password}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const jar = request.headers.get('cookie') ?? '';
  for (const part of jar.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

function basicAuthMatches(request, expected) {
  const [scheme, encoded] = (request.headers.get('authorization') ?? '').split(' ');
  if (scheme !== 'Basic' || !encoded) return false;

  let decoded = '';
  try {
    decoded = atob(encoded);
  } catch {
    return false; // a malformed header is simply not a match
  }
  const at = decoded.indexOf(':');
  return decoded.slice(0, at) === USER && timingSafeEqual(decoded.slice(at + 1), expected);
}

/** Compares without leaking the answer through how long the comparison took. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
