import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { AppBreakpoints } from '@app/@shared/app-breakpoints';

const SPIN_THE_WHEEL_VERSION = '0.1.24';
const SPIN_THE_WHEEL_BASE = `https://webcreg.icshdacc.com/registry/ct/cs/spin-the-wheel-general/bki/betaki/${SPIN_THE_WHEEL_VERSION}`;
const SPIN_THE_WHEEL_SCRIPT = `${SPIN_THE_WHEEL_BASE}/spin-the-wheel-webc.js`;

@Component({
  selector: 'app-spin-the-wheel-dialog',
  templateUrl: './spin-the-wheel-dialog.component.html',
  styleUrl: './spin-the-wheel-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [],
})
export class SpinTheWheelDialogComponent implements OnInit {
  private dialogRef = inject(DialogRef);
  private breakpointObserver = inject(BreakpointObserver);

  scriptLoaded = signal(false);

  isMobile = toSignal(
    this.breakpointObserver
      .observe([AppBreakpoints.LtSmall2])
      .pipe(map((state) => state.matches)),
    { initialValue: false }
  );

  readonly config = {
    apiKey: environment.deployConfig.apiKey,
    portalId: environment.desktopPortalId,
    languageCode: environment.defaultLanguage,
    assetsBasePath: `${SPIN_THE_WHEEL_BASE}/assets/`,
    mediaLibraryUrl: 'https://pp-assets.icbkiassets.com',
    mediaLibraryBrand: 'betaki',
    languagesBasePath: `${SPIN_THE_WHEEL_BASE}/assets/i18n/`,
    countdownTimezone: 'America/Sao_Paulo',
    isAuthenticated: true,
    skipLogin: true,
    openWheel: 'daily',
    summarizeWinnings: true,
    bonusSpinMultiplication: 1,
    hideMenu: false,
  };

  async ngOnInit(): Promise<void> {
    await this.loadScript();
    this.scriptLoaded.set(true);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private async loadScript(): Promise<void> {
    if (customElements.get('spin-the-wheel')) return;

    const script = document.createElement('script');
    script.src = SPIN_THE_WHEEL_SCRIPT;
    document.head.appendChild(script);

    await customElements.whenDefined('spin-the-wheel');
  }
}
