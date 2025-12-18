import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { I18nModule } from '@app/i18n';
import { AuthRoutingModule } from './auth-routing.module';
import { RouterModule } from '@angular/router';
import { LoginDialogComponent } from './login/login-dialog/login-dialog.component';
import { RegisterDialogComponent } from './register/register-dialog/register-dialog.component';
import { SwiperModule } from 'swiper/angular';
import { ForgotPasswordComponent } from '../users/forgot-password/forgot-password.component';
import { ResendConfirmationInstructionsComponent } from '../users/resend-confirmation-instructions/resend-confirmation-instructions.component';
import { ResendUnlockInstructionsComponent } from '../users/resend-unlock-instructions/resend-unlock-instructions.component';
import { ResetPaswordComponent } from '@app/users/reset-pasword/reset-pasword.component';
import { SetUsernameDialogComponent } from './login/set-username-dialog/set-username-dialog.component';
import { PersonalDataComponent } from './register/register-dialog/personal-data/personal-data.component';
import { CafOnboardingComponent } from './register/register-dialog/caf-onboarding/caf-onboarding.component';
import { CafOnboardingCompletedComponent } from './register/register-dialog/caf-onboarding-completed/caf-onboarding-completed.component';
import { TermsAndConditionsUpdatedDialogComponent } from './login/terms-and-conditions-updated-dialog/terms-and-conditions-updated-dialog.component';
import { AccountReverificationDialogComponent } from './login/account-reverification-dialog/account-reverification-dialog.component';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { MigrationLoginCompletedComponent } from './login/login-dialog/migration-login-completed/migration-login-completed.component';
import { LastSessionDialogComponent } from './login/last-session-dialog/last-session-dialog.component';
import { LoginPageComponent } from './login/login-page/login-page.component';
import { RegisterPageComponent } from './register/register-page/register-page.component';
import { RegisterPageFormComponent } from './register/register-page/register-page-form/register-page-form.component';
import { RegisterPageInitComponent } from './register/register-page/register-page-init/register-page-init.component';
import { RegisterPageSuccessComponent } from './register/register-page/register-page-success/register-page-success.component';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { EmailVerifiedSuccessComponent } from '@app/users/email-verified-success/email-verified-success.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    MaterialModule,
    I18nModule,
    AuthRoutingModule,
    RouterModule,
    SwiperModule,
    MatMomentDateModule,
  ],
  declarations: [
    LoginDialogComponent,
    RegisterDialogComponent,
    ForgotPasswordComponent,
    ResetPaswordComponent,
    ResendConfirmationInstructionsComponent,
    ResendUnlockInstructionsComponent,
    SetUsernameDialogComponent,
    PersonalDataComponent,
    CafOnboardingComponent,
    CafOnboardingCompletedComponent,
    TermsAndConditionsUpdatedDialogComponent,
    AccountReverificationDialogComponent,
    ForgotPasswordDialogComponent,
    MigrationLoginCompletedComponent,
    LastSessionDialogComponent,
    LoginPageComponent,
    RegisterPageComponent,
    RegisterPageFormComponent,
    RegisterPageInitComponent,
    RegisterPageSuccessComponent,
    EmailVerifiedSuccessComponent,
  ],
  exports: [LoginDialogComponent],
})
export class AuthModule {}
