import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromotionsRoutingModule } from './promotions-routing.module';
import { PromotionsComponent } from './promotions/promotions.component';
import { MaterialModule } from '@app/material.module';
import { I18nModule } from '@app/i18n';
import { SharedModule } from '@app/@shared';
import { TranslateModule } from '@ngx-translate/core';
import { PromotionActionDialogComponent } from './promotions/promotion-action-dialog/promotion-action-dialog.component';
import { PromotionConfirmationDialogComponent } from './promotions/promotion-confirmation-dialog/promotion-confirmation-dialog.component';
import { HelpModule } from '@app/help/help.module';
import { BannerPromotionsComponent } from './banner-promotions/banner-promotions.component';
import { PromotionsTermsAndConditionsComponent } from './promotions-terms-and-conditions/promotions-terms-and-conditions.component';

@NgModule({
  declarations: [
    PromotionsComponent,
    PromotionActionDialogComponent,
    PromotionConfirmationDialogComponent,
    BannerPromotionsComponent,
    PromotionsTermsAndConditionsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    MaterialModule,
    I18nModule,
    PromotionsRoutingModule,
    HelpModule,
    TranslateModule,
  ],
})
export class PromotionsModule {}
