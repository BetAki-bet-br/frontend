import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared';
import { MaterialModule } from '@app/material.module';
import { RouterModule } from '@angular/router';
import { SupportComponent } from './support/support.component';
import { HelpRoutingModule } from './help-routing.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { HelpPagesLoaderComponent } from './help-pages/help-pages-loader/help-pages-loader.component';
import { HelpPagesContainerComponent } from './help-pages/help-pages-container/help-pages-container.component';
import { TermsAndConditionsComponent } from './help-pages/terms-and-conditions/terms-and-conditions.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    MaterialModule,
    RouterModule,
    HelpRoutingModule,
    MatExpansionModule,
  ],
  declarations: [SupportComponent, HelpPagesLoaderComponent, HelpPagesContainerComponent, TermsAndConditionsComponent],
})
export class HelpModule {}
