/**
 * Puts the whole demo behind a password.
 *
 * Vercel's own Password Protection is a Pro feature and this project is on Hobby, so the gate is
 * here instead. It runs at the edge, before anything is served — the static bundle and the CMS
 * snapshot function are both behind it — so it is a real gate and not a screen the page draws
 * after it has already handed over its code.
 *
 * The password lives in the `DEMO_PASSWORD` environment variable of the Vercel project, never in
 * the repository. With none set the demo stays shut rather than falling open.
 */
export const config = {
  // Everything. There is nothing in this deployment that should be readable without the password.
  matcher: '/((?!_vercel/).*)',
};

const USER = 'girosbet';

export default function middleware(request) {
  const expected = process.env.DEMO_PASSWORD;

  if (!expected) {
    return new Response('This demo has no DEMO_PASSWORD set, so it is closed.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      // a malformed header is simply not a match
    }
    const at = decoded.indexOf(':');
    const user = decoded.slice(0, at);
    const password = decoded.slice(at + 1);
    if (user === USER && timingSafeEqual(password, expected)) {
      return undefined; // through to the static output or the snapshot function
    }
  }

  return new Response('Demonstração GirosBet — informe a senha.', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="Demonstracao GirosBet", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

/** Compares without leaking the answer through how long the comparison took. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
