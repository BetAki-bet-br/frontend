import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, finalize } from 'rxjs';
import { ActionIdEnum } from '@app/@shared/models/template.model';

const log = new Logger('HeaderComponent');

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() sidenavToggle = new EventEmitter<boolean>();
  @Input() isSignedIn = true;
  @Input() playerInfo: PlayerDetails | null = null;
  @Input() balance: AccountResolved | null = null;
  @Input() loyaltyPoints: Loyalty | null = null;
  @Input() isDemoPlay: boolean | null = false;

  isProfile: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private credentialsService: CredentialsService,
    private authenticationService: AuthenticationService,
    private globalSearchService: GlobalSearchService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authDialog: AuthDialogService,
    public assetsService: AssetsService,
    private templateService: TemplateService,
    private googleTagManagerServiceImpl: GoogleTagManagerImplementationService
  ) {}

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

    this.templateService.templateActionSub$?.pipe(untilDestroyed(this)).subscribe((response) => {
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
