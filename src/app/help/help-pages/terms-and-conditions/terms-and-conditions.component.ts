import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HelpService } from '@app/help/help.service';
import { CurrentTermsAndConditionsResponse } from '@icore/ngx-portalgateway-api-client-atl';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsAndConditionsComponent implements OnInit {
  termsAndConditions: CurrentTermsAndConditionsResponse | undefined;
  safeContent: SafeHtml | undefined;

  constructor(
    private helpService: HelpService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.helpService
      .getTermsAndConditions()
      .pipe(
        untilDestroyed(this),
        switchMap((result) => {
          this.termsAndConditions = result;
          this.safeContent = result.termsAndConditionsContent
            ? this.sanitizer.bypassSecurityTrustHtml(result.termsAndConditionsContent)
            : undefined;

          return this.route.fragment;
        })
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
