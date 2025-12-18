import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/@shared';
import { I18nModule } from '@app/i18n';
import { MaterialModule } from '@app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileSettingsRoutingModule } from './profile-settings-routing.module';
import { EmailConfirmationComponent } from './email-confirmation/email-confirmation.component';

@NgModule({
  imports: [
    CommonModule,
    ProfileSettingsRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    MaterialModule,
    I18nModule,
    RouterModule,
  ],
  declarations: [],
})
export class ProfileSettingsModule {}
