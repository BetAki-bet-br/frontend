import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { SportsbookRoutingModule } from './sportsbook-routing.module';
import { SportsbookComponent } from './sportsbook.component';

@NgModule({
  imports: [CommonModule, TranslateModule, SharedModule, MaterialModule, SportsbookRoutingModule],
  declarations: [SportsbookComponent],
})
export class SportsbookModule {}
