import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Shell } from '@app/shell/shell.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ForgotPasswordComponent } from '../users/forgot-password/forgot-password.component';
import { ResendUnlockInstructionsComponent } from '../users/resend-unlock-instructions/resend-unlock-instructions.component';
import { ResendConfirmationInstructionsComponent } from '../users/resend-confirmation-instructions/resend-confirmation-instructions.component';
import { ResetPaswordComponent } from '@app/users/reset-pasword/reset-pasword.component';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { RegisterPageComponent } from './register/register-page/register-page.component';
import { RegisterPageFormComponent } from './register/register-page/register-page-form/register-page-form.component';
import { RegisterPageInitComponent } from './register/register-page/register-page-init/register-page-init.component';
import { EmailVerifiedSuccessComponent } from '@app/users/email-verified-success/email-verified-success.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'sign-in',
      component: LoginPageComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
      },
    },
    {
      path: 'register',
      component: RegisterPageComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
      },
    },
    {
      path: 'forgot-password',
      component: ForgotPasswordComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
      },
    },
    {
      path: 'unlock-account',
      component: ForgotPasswordComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
      },
    },
    {
      path: 'users/password/new',
      component: ForgotPasswordComponent,
      data: {
        title: '',
        robots: ['index', 'follow'],
      },
    },
    {
      path: 'users/password/reset/:token',
      component: ResetPaswordComponent,
      data: {
        title: '',
      },
    },
    {
      path: 'users/confirmation/new',
      component: ResendConfirmationInstructionsComponent,
      data: {
        title: '',
      },
    },
    {
      path: 'users/unlock/new',
      component: ResendUnlockInstructionsComponent,
      data: {
        title: '',
      },
    },
    {
      path: 'users/email-verified',
      component: EmailVerifiedSuccessComponent,
      data: {
        title: '',
      },
    },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class AuthRoutingModule {}
