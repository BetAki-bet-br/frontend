import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from '@app/users/forgot-password/forgot-password.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ResetPaswordComponent } from './reset-pasword/reset-pasword.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: 'password/new', component: ForgotPasswordComponent, data: { title: '' } },
  { path: 'password/reset/:token', component: ResetPaswordComponent, data: { title: '' } },
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class TestRoutingModule {}
