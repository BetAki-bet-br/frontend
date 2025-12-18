import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, merge, Observable, of, Subscription, switchMap } from 'rxjs';

import { MatBottomSheet, MatBottomSheetConfig, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ConfigurationService } from '@app/@core/configuration.service';
import { GameCategoryLobbyEnum } from '@app/@core/game-categories.service';
import { GlobalSearchService } from '@app/@shared/global-search.service';
import { GameProviderData } from '@app/@shared/models';
import {
  GameFiltersProvidersDrawerComponent,
  GameFiltersProvidersDrawerComponentData,
  GameFiltersProvidersDrawerComponentResult,
} from '../game-filters-providers/game-filters-providers.component';

@Component({
  selector: 'app-game-filters',
  templateUrl: './game-filters.component.html',
  styleUrls: ['./game-filters.component.scss'],
})
export class GameFiltersComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() providers: GameProviderData[] = [];
  @Input() providersIsLoading = false;
  @Output() selectedProviderListChange = new EventEmitter<GameProviderData[]>();
  @ViewChild('arrowElement', { static: true, read: ElementRef }) arrowElement!: ElementRef<HTMLElement>;
  @ViewChild('arrowElement2', { static: true, read: ElementRef }) arrowElement2!: ElementRef<HTMLElement>;
  // @ViewChild('providersMenuContainer', { static: true }) providerMenuElement!: ElementRef<HTMLDivElement>;

  private _isProviderMenuOpen = false;
  private isInsideContainer = false;
  private subscriptions: Subscription[] = [];
  private _selectedProviderList: GameProviderData[] = [];

  /** List of game categories to add as links */
  menuGameCategories$ = this.configurationService.getMenuGameCategoriesList(
    this.router.url.includes('/games-live') ? GameCategoryLobbyEnum['Lobby live'] : GameCategoryLobbyEnum.Lobby
  );

  /** List of URLs that will have multiselect enabled in the provider filter */
  menuGameCategoriesUrl$ = this.menuGameCategories$.pipe(
    map((val) => {
      // Use only the urls that match `gameCategoryUrlRegex`
      const urls = val.map((t) => t.path).filter((t) => this.gameCategoryUrlRegex.test(t));
      // Manually add the All Games url
      urls.push(this.allGamesUrl);
      return urls;
    })
  );

  isMultiple$: Observable<boolean>;

  private allGamesUrl = '/games/all';

  private gameCategoryUrlRegex = /^\/games\/[a-z]+/;
  private gameCategoryWithProviderUrlRegex = /^\/games\/[a-z]+\/.+/;

  providersDrawerState: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public globalSearchService: GlobalSearchService,
    private configurationService: ConfigurationService,
    private _bottomDrawer: MatBottomSheet
  ) {
    const navigationEndUrl$ = this.router.events.pipe(
      filter((navEvent) => navEvent instanceof NavigationEnd),
      map((navEvent) => {
        return (navEvent as NavigationEnd).urlAfterRedirects;
      })
    );

    this.isMultiple$ = merge(of(this.router.routerState.snapshot.url), navigationEndUrl$).pipe(
      switchMap((currentUrl) => {
        return this.menuGameCategoriesUrl$.pipe(
          map((menuGameCategoriesUrl) => ({ menuGameCategoriesUrl, currentUrl }))
        );
      }),
      map((data) => {
        return data.menuGameCategoriesUrl.some((route) => data.currentUrl.includes(route));
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.params.subscribe((params) => {
        const routeProviderParam = params['provider'];

        if (routeProviderParam) {
          const providerNameList = this.providers.map((t) => t.name);
          if (!providerNameList.includes(routeProviderParam)) {
            // If the provider in the URL does not exist, then navigate to the "parent" url ('games/slots/xxx' => 'games/slots').
            this.router.navigate([this.route.snapshot.url[0].path], { relativeTo: this.route.parent });
          } else if (!this.selectedProviderList.map((t) => t.name).includes(routeProviderParam)) {
            // If the provider in the URL exists and is not already saved, then filter by that provider.
            this.filterProvider(routeProviderParam);
          }
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // this.updateClasses(true);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
  }

  get isProviderMenuOpen(): boolean {
    return this._isProviderMenuOpen;
  }

  // set isProviderMenuOpen(value: boolean) {
  //   if (this._isProviderMenuOpen !== value) {
  //     this._isProviderMenuOpen = value;
  //     this.updateClasses(true);
  //   }
  // }

  // private updateClasses(isMenu: boolean): void {
  //   if (isMenu) {
  //     const arrowElement = this.arrowElement.nativeElement;
  //     const providerMenuElement = this.providerMenuElement.nativeElement;
  //     arrowElement.classList.toggle('open', this._isProviderMenuOpen);
  //     providerMenuElement.classList.toggle('open', this._isProviderMenuOpen);
  //   } else {
  //     const arrowElement2 = this.arrowElement2.nativeElement;
  //     arrowElement2.classList.toggle('open', this.providersDrawerState);
  //   }
  // }

  // @HostListener('document:click', ['$event.target'])
  // onClickOutside(target: any): void {
  //   const containerElement = this.providerMenuElement.nativeElement;
  //   const isTargetInsideContainer = containerElement.contains(target);

  //   if (!this.isInsideContainer && containerElement !== target && !isTargetInsideContainer) {
  //     this.isProviderMenuOpen = false;
  //   }

  //   this.isInsideContainer = false;

  //   // reset providers drawer state, so it can be opened again with a single action
  //   if (!this.providersDrawerState) {
  //     this.updateClasses(false);
  //   }
  //   this.providersDrawerState = false;
  // }

  // toggleProviderMenu(): void {
  //   this.isInsideContainer = true;
  //   this.isProviderMenuOpen = !this.isProviderMenuOpen;
  // }

  // toggleProvidersDrawer(): void {
  //   // toggle providers drawer state
  //   this.providersDrawerState = this.providersDrawerState ? false : true;
  //   this.updateClasses(false);
  //   this.providersDrawerState ? this.openProvidersDrawer(this._selectedProviderList) : this.dismissProvidersDrawer();
  // }

  private openProvidersDrawer(preselectedList: GameProviderData[]): void {
    const config: MatBottomSheetConfig<GameFiltersProvidersDrawerComponentData> = {
      data: {
        providersList: this.providers,
        selectedOptions: preselectedList,
        isMultiple$: this.isMultiple$,
        isLoading: this.providersIsLoading,
      },
    };
    const sheetRef: MatBottomSheetRef<GameFiltersProvidersDrawerComponent, GameFiltersProvidersDrawerComponentResult> =
      this._bottomDrawer.open(GameFiltersProvidersDrawerComponent, config);
    sheetRef.afterDismissed().subscribe((data) => {
      this.onGameProvidersFilterClose(data);
    });
  }

  private dismissProvidersDrawer(): void {
    this._bottomDrawer.dismiss();
  }

  onMouseWheel(event: WheelEvent): void {
    const outerContainer = event.currentTarget as HTMLElement;
    outerContainer.scrollLeft += event.deltaY;
    event.preventDefault();
  }

  private get selectedProviderList(): GameProviderData[] {
    return this._selectedProviderList;
  }

  private set selectedProviderList(value: GameProviderData[]) {
    this._selectedProviderList = value;
    this.handleSelectedProviderListChanges();
    this.selectedProviderListChange.emit(this._selectedProviderList);
  }

  private handleSelectedProviderListChanges(): void {
    const currentPath = this.router.url;
    if (this.selectedProviderList.length !== 1) {
      if (this.gameCategoryUrlRegex.test(currentPath)) {
        const path = currentPath.split('/');
        const mainPath = path.slice(0, 3);
        this.router.navigate([mainPath.join('/')]);
      } else {
        this.router.navigate([this.allGamesUrl]);
      }
    } else {
      // Test if provider is already in the url
      if (!this.gameCategoryWithProviderUrlRegex.test(currentPath)) {
        // Add the provider to the url and navigate
        if (this.gameCategoryUrlRegex.test(currentPath)) {
          this.router.navigate([`${currentPath}/${this.selectedProviderList[0].name}`]);
        } else {
          this.router.navigate([`${this.allGamesUrl}/${this.selectedProviderList[0].name}`]);
        }
      }
    }
  }

  filterProvider(providerName: string): void {
    if (this.selectedProviderList.map((t) => t.name).includes(providerName)) {
      const updatedList = this.selectedProviderList.filter((p) => p.name !== providerName);
      this.selectedProviderList = updatedList;
    } else {
      const providerToAdd = this.providers.find((p) => p.name === providerName);
      if (providerToAdd) {
        this.selectedProviderList = [...this.selectedProviderList, providerToAdd];
      }
    }
  }

  onProviderClick(providerName: string): void {
    if (this.providersIsLoading) return;

    this.filterProvider(providerName);
  }

  checkContainsProvider(provider: string): boolean {
    return this.selectedProviderList.map((t) => t.name).includes(provider);
  }

  navigateTo(route: string): void {
    this.selectedProviderList = [];
    this.router.navigate([route]);
  }

  onGameProvidersFilterClose(event?: GameFiltersProvidersDrawerComponentResult) {
    if (this.providersIsLoading) return;

    if (event && event.selected !== null && event.multiselect !== null) {
      // if multiselect, filter by list
      if (event.multiselect === true) {
        this.selectedProviderList = event.selected;
      }
      // if not multiselect, filter individual
      else if (event.multiselect === false) {
        this.filterProvider(event.selected[0].name);
      }
    }
  }

  scrollCategoryLinkIntoView(changed: boolean, categoryLink: HTMLSpanElement) {
    if (changed) {
      categoryLink?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}
