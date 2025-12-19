import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { VipComponent } from './vip.component';

const routes: Routes = [
  /* removed for GLI version
  {
    path: '',
    component: VipComponent,
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
export class VipRoutingModule {}
