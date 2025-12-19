import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VipRoutingModule } from './vip-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@app/@shared';
import { MaterialModule } from '@app/material.module';
import { RouterModule } from '@angular/router';
import { VipComponent } from './vip.component';
import { VipProgramCardComponent } from './vip-program-card/vip-program-card.component';

@NgModule({
  declarations: [VipComponent, VipProgramCardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    MaterialModule,
    RouterModule,
    VipRoutingModule,
  ],
})
export class VipModule {}
