// Added CommonModule
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-caf-onboarding',
  templateUrl: './caf-onboarding.component.html',
  styleUrls: ['./caf-onboarding.component.scss'],
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CafOnboardingComponent implements OnInit, OnDestroy {
  protected sanitizer = inject(DomSanitizer);

  @Input() onboardingUrl: string | undefined;
  @Output() onboardingFinished = new EventEmitter<string>();

  safeUrl: SafeResourceUrl | undefined;

  ngOnInit(): void {
    if (this.onboardingUrl) {
      const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.onboardingUrl);
      this.safeUrl = sanitizedUrl;
    }

    window.addEventListener(
      'message',
      (e) => {
        if (e?.data?.code === 'ONBOARDING_FINISHED') {
          this.onboardingFinished.emit(e?.data?.detail?.executionId ?? '');
        }
      },
      false
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', (e) => {}, false);
  }
}
