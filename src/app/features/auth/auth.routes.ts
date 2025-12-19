import { Routes } from '@angular/router';
import { publicAuthGuard, privateAuthGuard } from '../../core/guards/auth.guard';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';
import { LoginPage } from './login-page/login-page';
import { RegisterPage } from './register-page/register-page';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPage,
    title: 'Login - Bet Aki',
    canActivate: [publicAuthGuard],
  },
  {
    path: 'register',
    component: RegisterPage,
    title: 'Registrar - Bet Aki',
    canActivate: [publicAuthGuard],
  },
  {
    path: 'email/verification',
    component: EmailConfirmationComponent,
    title: 'Verificação de E-mail - Bet Aki',
    canActivate: [privateAuthGuard],
  },
];
