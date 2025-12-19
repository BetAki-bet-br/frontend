import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from '../users/forgot-password/forgot-password.component';
import { ResendUnlockInstructionsComponent } from '../users/resend-unlock-instructions/resend-unlock-instructions.component';
import { ResendConfirmationInstructionsComponent } from '../users/resend-confirmation-instructions/resend-confirmation-instructions.component';
import { ResetPaswordComponent } from '@app/users/reset-pasword/reset-pasword.component';
import { EmailVerifiedSuccessComponent } from '@app/users/email-verified-success/email-verified-success.component';
import { LoginPage } from '@app/auth-v2/login-page/login-page';
import { RegisterPage } from '@app/auth-v2/register-page/register-page';
import { publicAuthGuard } from '@app/auth.guard';
import { AuthLayoutPage } from '@app/auth-v2/auth-layout-page';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutPage,
    children: [
      {
        path: 'login',
        component: LoginPage,
        canActivate: [publicAuthGuard],
        data: {
          title: '',
          robots: ['index', 'follow'],
        },
      },
      {
        path: 'register',
        component: RegisterPage,
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
    component: ForgotPasswordComponent,
    canActivate: [publicAuthGuard],
    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'unlock-account',
    component: ForgotPasswordComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'users/password/new',
    component: ForgotPasswordComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  {
    path: 'users/password/reset/:token',
    component: ResetPaswordComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/confirmation/new',
    component: ResendConfirmationInstructionsComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/unlock/new',
    component: ResendUnlockInstructionsComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
  {
    path: 'users/email-verified',
    component: EmailVerifiedSuccessComponent,
    canActivate: [publicAuthGuard],

    data: {
      title: '',
    },
  },
];
