import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/@shared';
import { MaterialModule } from '@app/material.module';
import { RouterModule } from '@angular/router';
import { PaymentsComponent } from './payments/payments.component';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsTableComponent } from './payments/payments-table/payments-table.component';

@NgModule({
  declarations: [PaymentsComponent, PaymentsTableComponent],
  imports: [CommonModule, TranslateModule, SharedModule, MaterialModule, RouterModule, PaymentsRoutingModule],
})
export class PaymentsModule {}
