import { Routes } from '@angular/router';

export const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  {
    path: 'password/new',
    loadComponent: () =>
      import('@app/users/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    data: { title: '' },
  },
  {
    path: 'password/reset/:token',
    loadComponent: () => import('./reset-pasword/reset-pasword.component').then((m) => m.ResetPaswordComponent),
    data: { title: '' },
  },
  /* {
    path: 'unlock/new',
    component: ResendUnlockInstructionsComponent,
    data: { title: '' },
  },
  {
    path: 'confirmation/new',
    component: ResendConfirmationInstructionsComponent,
    data: { title: '' },
  }, */
];
