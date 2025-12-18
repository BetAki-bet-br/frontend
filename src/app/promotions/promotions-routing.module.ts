import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BannerPromotionsComponent } from './banner-promotions/banner-promotions.component';
import { PromotionsTermsAndConditionsComponent } from './promotions-terms-and-conditions/promotions-terms-and-conditions.component';
import { PromotionsGuard } from './promotions.guard';

const routes: Routes = [
  {
    path: '',
    component: BannerPromotionsComponent,
    canActivate: [PromotionsGuard],
    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: ':name',
    component: PromotionsTermsAndConditionsComponent,
    data: {
      title: '',
      robots: ['index', 'follow'],
      customClassName: 'promotions-terms',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PromotionsRoutingModule {}
