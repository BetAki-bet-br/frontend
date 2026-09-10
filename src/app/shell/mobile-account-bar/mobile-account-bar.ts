import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '@app/@shared/components/button/button.component';

/**
 * Sticky account bar of `BrandConfig.layout.mobileAccountBar`: the two account calls to action,
 * pinned just above the mobile bottom navigation while the player is logged out.
 *
 * Whether it is mounted at all is the shell's decision (brand option, session and game mode), which
 * is also what pads the content underneath, so this component only paints the bar. It sits on the
 * bottom navigation's height, read from `--mobile-menu-height` with the `tabs` height as the
 * fallback, takes its own height from `--mobile-account-bar-height` (the same value the shell pads
 * the content with and the bottom sheets reserve, declared in `src/theme/theme.scss`), and fades from transparent into the page background so the content scrolling behind it
 * dissolves instead of being cut.
 */
@Component({
  selector: 'app-mobile-account-bar',
  imports: [ButtonComponent],
  templateUrl: './mobile-account-bar.html',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileAccountBar {
  private readonly router = inject(Router);

  /** `<app-button>` renders its own `<button>`, so the CTAs navigate from a click handler. */
  navigateTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
