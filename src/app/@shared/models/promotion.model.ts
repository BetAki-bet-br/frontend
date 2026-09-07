import { SafeHtml } from '@angular/platform-browser';
import { PlayerBonus } from '@app/@core/gateway';
import { CategoryKeyEnum } from './template.model';

export interface Promotion {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  coloredText: string;
  color: string;
}

/** A bonus with the strings and the percentages the tiles and the table render. */
export interface PlayerBonusResolved extends PlayerBonus {
  resolvedAmount: string;
  resolvedWagerMultiplier: string;
  currentWagered: number;
  statusResolved: string;
  currency: string;
  percentageCompleted: number;
  currencyCode: string;
  bonusCurrentExpiryConditionDate?: string;
  categoryEnum?: CategoryKeyEnum;
  // template data
  templateOffersHtml: SafeHtml | null;
  templateOngoingHtml: SafeHtml | null;
  templateActiveHtml: SafeHtml | null;
}
