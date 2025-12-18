import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export interface FooterNavItem {
  label: string;
  icon: string;
  link: string;
}
@UntilDestroy()
@Component({
  selector: 'app-footer-nav-bar',
  templateUrl: './footer-nav-bar.component.html',
  styleUrls: ['./footer-nav-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterNavBarComponent {
  @Input() isSportsbook: boolean = false;
  @Output() sidenavToggle = new EventEmitter();
  @Output() sidenavCloseIfOpened = new EventEmitter();

  navItemsGeneral: FooterNavItem[] = [
    {
      label: 'Home',
      icon: 'home',
      link: '/games/lobby',
    },
    {
      label: 'Casino',
      icon: 'casino',
      link: '/games',
    },
    {
      label: 'Live casino',
      icon: 'live-casino',
      link: '/games-live',
    },
  ];

  navItemsGeneralLive: FooterNavItem[] = [
    {
      label: 'Home',
      icon: 'home',
      link: '/games-live/lobby',
    },
    {
      label: 'Casino',
      icon: 'casino',
      link: '/games/lobby',
    },
    {
      label: 'Live casino',
      icon: 'live-casino',
      link: '/games-live',
    },
  ];

  navItemsSportsbook: FooterNavItem[] = [
    {
      label: 'Home',
      icon: 'home',
      link: '/',
    },
    {
      label: 'Live sportsbook',
      icon: 'sportsbook-live',
      link: '/sportsbook-live',
    },
    {
      label: 'Sports',
      icon: 'sportsbook',
      link: '/sportsbook',
    },
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private globalSearchService: GlobalSearchService
  ) {
    this.router.events.pipe(untilDestroyed(this)).subscribe((res) => {
      this.cdr.markForCheck();
    });
  }

  get itemList() {
    return this.isSportsbook
      ? this.navItemsSportsbook
      : this.isGamesLive
      ? this.navItemsGeneralLive
      : this.navItemsGeneral;
  }

  get isGamesLive() {
    return this.router.url?.includes('games-live');
  }

  isActive(link: string): boolean {
    if (this.isSportsbook) {
      return this.router.url.endsWith(link);
    }

    return this.router.url?.startsWith(link) ? true : false;
  }

  onItemClick() {
    this.sidenavCloseIfOpened.emit();
    // Scroll to top
    const htmlElement = document.documentElement;

    setTimeout(() => {
      htmlElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }, 0);
  }

  onSearch() {
    this.globalSearchService.enableGlobalSearch();
  }
}
