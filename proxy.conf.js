/*
 * Dev-server proxy. The brands' development urls are the same relative paths production uses
 * (`/backoffice` for the CMS, `/gateway` for the house backend), so in dev everything is same-origin
 * and no CORS list on either backend has to know which port the app is being served on. Where each
 * path actually goes is decided here, per machine, through two environment variables:
 *
 *   CMS_URL            the Laravel backoffice        (default http://127.0.0.1:8082)
 *   HOUSE_GATEWAY_URL  the house backend (.NET)      (default http://127.0.0.1:5080)
 *
 * The CMS default is not the container's own port on purpose: on the machine this was written on,
 * `localhost:8080` is answered by another program, and the CMS is reached through a loopback proxy
 * on 8082 (see `docs/white-label/02-como-criar-marca.md`, "Rodando com o CMS local").
 *
 * `changeOrigin` matters for the gateway: it builds the game launch url from the request's Host,
 * so the iframe has to be told the backend's real address, not the dev-server's.
 */
const CMS_URL = process.env.CMS_URL || 'http://127.0.0.1:8082';
const HOUSE_GATEWAY_URL = process.env.HOUSE_GATEWAY_URL || 'http://127.0.0.1:5080';

module.exports = [
  {
    context: ['/backoffice'],
    target: CMS_URL,
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/backoffice': '' },
  },
  {
    context: ['/gateway'],
    target: HOUSE_GATEWAY_URL,
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/gateway': '' },
  },
  // The Comtrade portal gateway, for the ports a brand still points at `comtrade`. The host is
  // dead; the entry stays so those calls fail as a proxy error rather than as a CORS one.
  {
    context: ['/api'],
    target: 'https://betaki.bet.br/api',
    changeOrigin: true,
    secure: false,
    pathRewrite: { '^/api': '' },
  },
];
