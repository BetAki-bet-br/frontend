import { SafeHtml } from '@angular/platform-browser';

export interface PromotionBonusMock {
  title: string;
  bonus: string;
  description: string;
  imageUrl: string;
}

export interface PromotionBonus {
  title: string | undefined;
  templateHtml: SafeHtml | null;
}
