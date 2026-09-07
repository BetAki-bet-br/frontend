import { PlayerBalance } from '@app/@core/gateway';

/**
 * The balance from the gateway, plus what the screens need to print it: the currency is always
 * known here (the app falls back to the brand's default) and the symbol comes from the locale.
 */
export interface AccountResolved extends PlayerBalance {
  currency: string;
  currencySymbol: string;
}
