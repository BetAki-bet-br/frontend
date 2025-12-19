import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AssetsService } from '@app/@shared/assets.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { Logger } from '@app/@shared/logger.service';
import { AccountResolved } from '@app/@shared/models';
import { TemplateService } from '@app/@shared/services/template.service';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { AuthenticationService } from '@app/auth';
import { AuthDialogService } from '@app/auth/auth-dialog.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { Loyalty, PlayerDetails } from '@icore/ngx-portalgateway-api-client-atl';
import { Subscription, finalize } from 'rxjs';
import { ActionIdEnum } from '@app/@shared/models/template.model';
import { MatIcon } from '@angular/material/icon';
import { ProfileInfoHeaderComponent } from './profile-info-header/profile-info-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { CdnizePipe } from '@app/@pipes/cdnize.pipe';
import { MatButton } from '@angular/material/button';

const log = new Logger('HeaderComponent');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatButton, ProfileInfoHeaderComponent, TranslateModule, CdnizePipe, RouterLink, RouterLinkActive],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private credentialsService = inject(CredentialsService);
  private authenticationService = inject(AuthenticationService);
  private globalSearchService = inject(GlobalSearchService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authDialog = inject(AuthDialogService);
  private destroyRef = inject(DestroyRef);
  assetsService = inject(AssetsService);
  private templateService = inject(TemplateService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);

  @Output() sidenavToggle = new EventEmitter<boolean>();
  @Input() isSignedIn = true;
  @Input() playerInfo: PlayerDetails | null = null;
  @Input() balance: AccountResolved | null = null;
  @Input() loyaltyPoints: Loyalty | null = null;
  @Input() isDemoPlay: boolean | null = false;

  isProfile: boolean = false;

  private subscriptions: Subscription[] = [];

  get username(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials && !credentials.faceAuthRequired ? credentials.username : null;
  }

  ngOnInit(): void {
    if (this.router.routerState.snapshot.url.includes('/profile')) {
      this.isProfile = true;
    } else {
      this.isProfile = false;
    }

    this.templateService.templateActionSub$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response?.actionId === ActionIdEnum.OpenRegisterDialog) {
        this.onRegister();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onSidenavToggle() {
    this.sidenavToggle.emit(true);
  }

  onLogout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  onRegister() {
    // Push GTM event tag - Sign-up button is clicked
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_sign_up' });

    this.router.navigate(['/register']);
    this.scrollToTop();
  }

  onEnableGlobalSearch() {
    this.globalSearchService.enableGlobalSearch();
    log.debug('Global Search enabled!');
  }

  onBackButton() {
    this.router.navigate(['/']);
  }

  onLanguageSelectorMenuClosed() {}

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  isHomePage() {
    return this.router.url === '/';
  }
}
