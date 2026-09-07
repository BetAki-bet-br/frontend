/**
 * The adapters a brand can pick from.
 *
 * Adding one means writing the adapter, listing it here, and registering it in
 * `provide-gateways.ts`. Nothing else in the application changes.
 *
 * - `comtrade`: Comtrade PortalGateway, through the generated OpenAPI client. What BetAki runs on.
 * - `house`: our own backend, over the REST contract documented in each `house-*.gateway.ts`.
 * - `demo`: no backend at all, state in `localStorage`. Development and demos only.
 */
export type GatewayId = 'comtrade' | 'house' | 'demo';

/** Which adapter answers each port. One entry per port, so a brand can mix providers. */
export interface GatewaySelection {
  auth: GatewayId;
  player: GatewayId;
  games: GatewayId;
  wallet: GatewayId;
  messages: GatewayId;
  content: GatewayId;
  bonus: GatewayId;
}
