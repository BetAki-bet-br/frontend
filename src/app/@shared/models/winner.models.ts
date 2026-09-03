export interface TopWinner {
  playerId: string;
  username: string;
  /**
   * Already-masked name to render as-is. Only the backoffice batch fallback sets it; the portal
   * gateway returns the real username, which the ticker replaces with a generated placeholder.
   */
  displayName?: string;
  gameExternalId: string;
  gameName: string;
  productName: string;
  amount: string;
  currencyId: string;
  currencyCode: string;
  winDate: string;
  betAmount: string;
}
