/**
 * Answers the provider calls the demo has no port for yet.
 *
 * `MessageService`, `TemplateService` and the legacy CMS banners still talk to the Comtrade portal
 * gateway directly, because `MessagesGateway` and `ContentGateway` are not written (see
 * `docs/white-label/03-gateways.md`). In the demo there is nothing at `/api/portal/v1/*`, and the
 * shape of the answer matters more than it looks: `authInterceptor` logs the player out on **any**
 * 401 while a session exists, so an unhandled path here would sign the visitor out mid-demo.
 *
 * So this exists to be a 404 and never a 401. The callers already degrade on a failure — that is
 * how they survive the portal gateway being unreachable in development — and the visitor keeps
 * their session.
 *
 * It goes away the day those two ports do.
 */
module.exports = (req, res) => {
  res.statusCode = 404;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'public, max-age=0, s-maxage=3600');
  res.end(
    JSON.stringify({
      message: 'This call has no gateway port yet, so the demo does not answer it.',
      port: 'MessagesGateway / ContentGateway',
    }),
  );
};
