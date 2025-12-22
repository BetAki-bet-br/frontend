import { Routes } from '@angular/router';
import { publicAuthGuard } from '@app/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@app/auth-v2/auth-layout-page').then((m) => m.AuthLayoutPage),
    children: [
      {
        path: 'login',
        loadComponent: () => import('@app/auth-v2/login-page/login-page').then((m) => m.LoginPage),
        canActivate: [publicAuthGuard],
        data: {
          title: '',
          robots: ['index', 'follow'],
        },
      },
      {
        path: 'register',
        loadComponent: () => import('@app/auth-v2/register-page/register-page').then((m) => m.RegisterPage),
        canActivate: [publicAuthGuard],
        data: {
          title: '',
          robots: ['index', 'follow'],
        },
      },
    ],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../users/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [publicAuthGuard],
    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'unlock-account',
    loadComponent: () =>
      import('../users/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'users/password/new',
    loadComponent: () =>
      import('../users/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'users/password/reset/:token',
    loadComponent: () =>
      import('@app/users/reset-pasword/reset-pasword.component').then((m) => m.ResetPaswordComponent),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/confirmation/new',
    loadComponent: () =>
      import('../users/resend-confirmation-instructions/resend-confirmation-instructions.component').then(
        (m) => m.ResendConfirmationInstructionsComponent,
      ),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/unlock/new',
    loadComponent: () =>
      import('../users/resend-unlock-instructions/resend-unlock-instructions.component').then(
        (m) => m.ResendUnlockInstructionsComponent,
      ),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/email-verified',
    loadComponent: () =>
      import('@app/users/email-verified-success/email-verified-success.component').then(
        (m) => m.EmailVerifiedSuccessComponent,
      ),
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
];
