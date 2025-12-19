import { NgModule } from '@angular/core';
import { SharedModule } from '@app/@shared';
import { AgeConfirmationDialogComponent } from './age-confirmation-dialog/age-confirmation-dialog.component';
import { MaterialModule } from '@app/material.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, SharedModule, MaterialModule],
})
export class UsersModule {}
