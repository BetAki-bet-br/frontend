import { SafeHtml } from '@angular/platform-browser';
import { GetBonusResponse, PlayerBonusHistory, PromotionDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { CategoryKeyEnum } from './template.model';

export interface Promotion {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  coloredText: string;
  color: string;
}

export interface PromotionDetailsResolved extends PromotionDetails {
  templateHtml: SafeHtml | null;
  templateActivateRaw: string;
  templateActivateData: { [key: string]: any };
}

export interface PlayerBonusResolved extends PlayerBonusHistory {
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

export interface PlayerBonusDataResolved extends GetBonusResponse {
  playerBonusHistoryResolved: PlayerBonusResolved[];
}
