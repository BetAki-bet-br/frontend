import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HelpService } from '@app/help/help.service';
import { CurrentTermsAndConditionsResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { switchMap } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { BasicPageContainerComponent } from '@app/@shared/components/basic-page-container/basic-page-container.component';
import { HelpPagesContainerComponent } from '../help-pages-container/help-pages-container.component';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatIconModule, BasicPageContainerComponent, HelpPagesContainerComponent],
})
export class TermsAndConditionsComponent implements OnInit {
  private helpService = inject(HelpService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  termsAndConditions: CurrentTermsAndConditionsResponse | undefined;
  safeContent: SafeHtml | undefined;

  ngOnInit(): void {
    this.helpService
      .getTermsAndConditions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((result) => {
          this.termsAndConditions = result;
          this.safeContent = result.termsAndConditionsContent
            ? this.sanitizer.bypassSecurityTrustHtml(result.termsAndConditionsContent)
            : undefined;

          return this.route.fragment;
        }),
      )
      .subscribe((fragment) => {
        if (fragment) {
          const observer = new MutationObserver(() => {
            const element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }

        this.cdr.markForCheck();
      });
  }
}
