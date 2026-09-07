import { TopWinner as GatewayTopWinner } from '@app/@core/gateway';

/** A row of the winner ticker, whichever source produced it. */
export interface TopWinner extends GatewayTopWinner {
  /**
   * Already-masked name to render as-is. Only the backoffice batch fallback sets it; the games
   * gateway does not hand out names at all, and the ticker generates a placeholder instead.
   */
  displayName?: string;
}
