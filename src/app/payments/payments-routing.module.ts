import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './payments/payments.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { NgModule } from '@angular/core';

const routes: Routes = [
  /* removed for GLI version
  {
    path: '',
    component: PaymentsComponent,
    data: {
      title: '',
      robots: ['index', 'follow'],
    },
  },
  */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentsRoutingModule {}
