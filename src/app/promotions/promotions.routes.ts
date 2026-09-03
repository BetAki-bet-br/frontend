import { Routes } from '@angular/router';
import { promotionsGuard } from './promotions.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./banner-promotions/banner-promotions.component').then((m) => m.BannerPromotionsComponent),
    canActivate: [promotionsGuard],
    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: ':name',
    loadComponent: () =>
      import('./promotions-terms-and-conditions/promotions-terms-and-conditions.component').then(
        (m) => m.PromotionsTermsAndConditionsComponent,
      ),
    data: {
      title: '',
      robots: ['index', 'follow'],
      customClassName: 'promotions-terms',
    },
  },
];
