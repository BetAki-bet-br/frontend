import { BreakpointObserver } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Logger } from '@app/@shared';
import { AccountResolved } from '@app/@shared/models';
import { GoogleTagManagerImplementationService } from '@app/@shared/services/google-tag-manager-implementation.service';
import { TawkToScriptService } from '@app/@shared/services/tawkto-script.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import { LoyaltyStatus, PlayerProfile } from '@app/@core/gateway';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SideNavMenuMockCasino, SideNavMenuMockSportsbook } from './sidenav-menu.mock';
import { SidenavMenuService } from './sidenav-menu.service';
import { ProfileMenuComponent } from '../shell-player-profile/profile-menu/profile-menu.component';
import { MatIcon } from '@angular/material/icon';

const log = new Logger('SidenavMenuComponent');

export interface SideMenuItem {
  label: string;
  link: string;
  categories: SideMenuItem[] | null;
  collapsedLabel?: string;
  fragment?: string;
}

export interface SidenavState {
  opened: boolean;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav-menu',
  templateUrl: './sidenav-menu.component.html',
  styleUrls: ['./sidenav-menu.component.scss'],
  imports: [MatSidenavContainer, MatSidenav, ProfileMenuComponent, MatSidenavContent, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavMenuComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private authenticationService = inject(AuthenticationService);
  private credentialsService = inject(CredentialsService);
  private googleTagManagerServiceImpl = inject(GoogleTagManagerImplementationService);
  private observer = inject(BreakpointObserver);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private tawkToScriptService = inject(TawkToScriptService);
  private sidenavMenuService = inject(SidenavMenuService);

  readonly hideSidenav = input(false);
  readonly isSignedIn = input(false);
  readonly playerInfo = input<PlayerProfile | null>(null);
  readonly loyaltyPoints = input<LoyaltyStatus | null>(null);
  readonly balance = input<AccountResolved | null>(null);
  readonly sidenavStateChangeEvent = output<SidenavState>();
  readonly sidenav = viewChild.required(MatSidenav);

  isSportsCollapsed = false;
  isCasinoCollapsed = false;

  sideMenuItemsCasino: SideMenuItem[] = SideNavMenuMockCasino;
  sideMenuItemsSports: SideMenuItem[] = SideNavMenuMockSportsbook;
  isSmallScreen: Observable<boolean> = of(false);
  readonly isMobile = signal(true);
  private sidenavStateSubject = new BehaviorSubject<SidenavState>({
    opened: this.isMobile() ? false : true,
    collapsed: false,
  });

  telegramLink = '';

  isAuth$ = this.credentialsService.isAuthenticated$;

  ngOnInit(): void {
    // this.isSmallScreen = this.breakpointObserver.observe(AppBreakpoints.GtSmall1).pipe(map((result) => result.matches));

    // this.isSmallScreen.subscribe(async (result) => {
    //   if (result && this.sidenav) {
    //     // BUG NOT CLOSING EVERY TIME ON SCREEN RESIZE
    //     this.toggleSidenavMenu();
    //   }
    // });

    this.sidenavStateSubject.subscribe((state) => {
      this.sidenavStateChangeEvent.emit(this.sidenavState);
      log.debug('Sidenav state changed ', this.sidenavState);
    });

    // toggle isMobile variable to determine sidenav mode (expandable or slide-out)
    this.observer.observe(['(max-width: 960px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile.set(true);
      } else {
        this.isMobile.set(false);
      }
    });

    this.sidenavMenuService.openMenu$.subscribe(() => {
      this.toggleSidenavMenu();
    });
  }

  get sidenavState(): SidenavState {
    return this.sidenavStateSubject.value;
  }

  onOpenedChange(opened: boolean) {
    this.sidenavStateSubject.next({
      ...this.sidenavStateSubject.getValue(),
      opened: opened,
    });
  }

  onLogin() {
    this.sidenav().toggle();
    // this.authDialog
    //   .loginDialog()
    //   .pipe(untilDestroyed(this))
    //   .subscribe({
    //     next: (result) => {
    //       log.debug('login closed', result);
    //     },
    //     error: (err) => {
    //       log.error('login error', err);
    //     },
    //   });
  }

  onSignOut() {
    this.authenticationService.logout().subscribe(async () => {
      log.debug('logout');
      await this.sidenav().close();
    });
  }

  onSignUp() {
    // Push GTM event tag - Sign-up button is clicked
    this.googleTagManagerServiceImpl.pushGtmTag({ event: 'click_sign_up' });

    // this.sidenav.toggle();
    // this.authDialog
    //   .signUpDialog()
    //   .pipe(untilDestroyed(this))
    //   .subscribe({
    //     next: (result) => {
    //       log.debug('signUpDialog closed', result);
    //     },
    //     error: (err) => {
    //       log.error('signUpDialog error', err);
    //     },
    //   });
  }

  onSidenavMenuLinkClick() {
    if (this.isMobile()) {
      this.sidenav().close();
    }
    // Scroll to top
    const htmlElement = document.documentElement;
    htmlElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  toggleSidenavMenu() {
    if (this.isMobile()) {
      this.sidenav().toggle();
      // On mobile, the menu can never be collapsed
      this.sidenavStateSubject.next({
        ...this.sidenavState,
        opened: this.sidenav().opened,
        collapsed: false,
      });
    }
  }

  closeSidenavIfOpened() {
    if (this.sidenavState && this.sidenavState.opened) {
      this.sidenav()?.close();
    }
  }

  isActive(link: string): boolean {
    return this.router.url?.endsWith(link) ? true : false;
  }

  isMainNavActive(link: string): boolean {
    return this.router.url?.startsWith(link) ? true : false;
  }
}
