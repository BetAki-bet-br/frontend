/*
 * @Copyright (C) 2020 Comtrade d.o.o. all rights reserved.
 *
 * Possession of this software does not grant any rights to use, reproduce,
 * modify or distribute it or to use any concept it may contain.
 *
 * Licensed under Comtrade d.o.o. license ('the License'); you may not use
 * this software unless in compliance with the License. Any use of the software
 * without such license is a violation of copyright laws and may be subject to
 * legal actions (remedies and/or criminal prosecution).
 *
 * NOTE: If you receive this content in error, please let us know by contacting
 * Comtrade d.o.o. legal department (legal@comtradegroup.com) and destroy any copy
 * you may have.
 */

import { Injectable } from '@angular/core';
import { Logger } from '@app/@shared/logger.service';
import { Banner, LatestWinnersCache } from '@app/@shared/models';
import { GameMenuCategoryModel, GameProviderData, GameTile } from '@app/@shared/models/game.model';
import { Credentials } from '@app/auth';
import { I18nService } from '@app/i18n';
import { environment } from '@env/environment';
import {
  Country,
  Currency,
  GameCategory,
  PlayerDetails,
  PlayerStatusesResponse,
  TemplateData,
} from '@icore/ngx-portalgateway-api-client-atl';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Subject } from 'rxjs';
import { ExternalConfigsLoader } from './external-configs-loader';

const log = new Logger('DataStoreService');

const configurationCacheSessionKey = 'config';
const latestWinnersIndexKey = 'latestWinnersIndex';
const latestWinnersKey = 'latestWinners';

export interface PaymentGroupListElement {
  brandId: number;
  paymentGroupList: string[];
}

interface LobbyGameCachePortal {
  [portalId: number]: CacheItem<LobbyGameCache>;
}

interface LobbyGameCache {
  [levelId: string]: CacheItem<GameTile[]>;
}

interface GameMenuCategoriesPortal {
  [portalId: number]: CacheItem<GameMenuCategories>;
}

interface GameMenuCategories {
  [levelId: string]: CacheItem<GameMenuCategoriesData>;
}

interface GameMenuCategoriesData {
  menu: GameMenuCategoryModel[];
}

interface GameProvidersPortal {
  [portalId: number]: CacheItem<GameProvidersLevel>;
}

interface GameProvidersLevel {
  [levelId: string]: CacheItem<GameProviderData[]>;
}

interface MenuCategoryPortal {
  [portalId: number]: { data: GameCategory[]; timestamp: number };
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface GameCategoryId {
  [name: string]: number;
}

export interface GameCategoryIdsPortal {
  [portalId: number]: { data: GameCategoryId };
}

export interface CurrentBannersData {
  currentBannersLarge?: Banner[];
  currentBannersSmall?: Banner[];
}

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  public credentials: Credentials | null = null;

  readonly DECIMAL_SEPARATOR = '.';

  // default language
  defaultLanguage = environment.deployConfig.defaultLanguage;
  fallbackLanguage = environment.deployConfig.defaultLanguage;

  // default country
  defaultCountryCode = 'BR';

  // default currency
  defaultCurrency = 'BRL';

  // game lobby language: is en-US because is used in links
  gameLobbyLanguage = 'en-US';

  defaultPortalId = +environment.deployConfig.desktopPortalId;
  // desktop portal id
  desktopPortalId = +environment.deployConfig.desktopPortalId;
  // mobile portal id
  mobilePortalId = +environment.deployConfig.mobilePortalId;

  public latestWinners$ = new BehaviorSubject<LatestWinnersCache | null>(null);

  cacheLifeSpan = 1800000; // lifespan of the cached item in ms (1800000ms = 30min)

  private _configurationCache: { [name: string]: CacheItem<any> } = {
    profileLanguage: {
      data: this.fallbackLanguage,
      timestamp: Date.now(),
    },
    currencyAbbreviation: {
      data: this.defaultCurrency,
      timestamp: Date.now(),
    },
    currencyDecimals: {
      data: 2,
      timestamp: Date.now(),
    },
    countriesList: {
      data: null as Country[] | null,
      timestamp: Date.now(),
    },
    languagesList: {
      data: null as any[] | null, // NativeApiLanguageData[],
      timestamp: Date.now(),
    },
    currenciesList: {
      data: null as Currency[] | null,
      timestamp: Date.now(),
    },
    menuGameTypes: {
      data: {
        [this.desktopPortalId]: {
          data: null as GameCategory[] | null,
          timestamp: Date.now(),
        },
        [this.mobilePortalId]: {
          data: null as GameCategory[] | null,
          timestamp: Date.now(),
        },
      } as MenuCategoryPortal,
      timestamp: Date.now(),
    },
    lobbyGames: {
      data: {
        [this.desktopPortalId]: {
          data: {} as LobbyGameCache,
          timestamp: Date.now(),
        },
        [this.mobilePortalId]: {
          data: {} as LobbyGameCache,
          timestamp: Date.now(),
        },
      } as LobbyGameCachePortal,
      timestamp: Date.now(),
    },
    gamesMenuCategories: {
      data: {
        [this.desktopPortalId]: {
          data: {} as GameMenuCategories,
          timestamp: Date.now(),
        },
        [this.mobilePortalId]: {
          data: {} as GameMenuCategories,
          timestamp: Date.now(),
        },
      } as GameMenuCategoriesPortal,
      timestamp: Date.now(),
    },
    gameProviders: {
      data: {
        [this.desktopPortalId]: {
          data: {} as GameProvidersLevel,
          timestamp: Date.now(),
        },
        [this.mobilePortalId]: {
          data: {} as GameProvidersLevel,
          timestamp: Date.now(),
        },
      } as GameProvidersPortal,
      timestamp: Date.now(),
    },
    templatesList: {
      data: null as TemplateData[] | null,
      timestamp: Date.now(),
    },
    currentBanners: {
      data: null as CurrentBannersData | null,
      timestamp: Date.now(),
    },
    currentPromotionBanners: {
      data: null as Banner[] | null,
      timestamp: Date.now(),
    },
    playerVerificationStatus: {
      data: null as PlayerStatusesResponse | null,
      timestamp: Date.now(),
    },
  };

  /*
   * PlayerInfo pending flag is used to reduce redundant API calls when retrieving the same
   * source from multiple observables/components at the same time
   */
  // TODO THIS SOLUTION SHOULD BE UNIFIED WITH THE ONE FROM GamesService AS IT APPLIES THE SAME STRATEGY
  public playerInfoInMemoryPending$ = new BehaviorSubject<boolean>(false);

  private _inMemoryConfigurationCache: { [name: string]: CacheItem<any> } = {
    playerInfo: {
      data: null as PlayerDetails | null,
      timestamp: Date.now(),
    },
  };

  private _latestWinnersIndex = null as number | null;

  balanceVisibilityChange = new Subject();
  private _balanceVisible = true;
  public get balanceVisible() {
    return this._balanceVisible;
  }
  public set balanceVisible(value) {
    this._balanceVisible = value;
    this.balanceVisibilityChange.next(this.balanceVisible);
  }

  constructor(
    private deviceService: DeviceDetectorService,
    private i18nService: I18nService,
    private externalConfigsLoader: ExternalConfigsLoader
  ) {
    this.setDevicePortalID();
    externalConfigsLoader.configsLoaded$.subscribe((loaded) => {
      if (loaded) {
        // set default language
        this.defaultLanguage = environment.deployConfig.defaultLanguage;
        // set default portal id
        this.defaultPortalId = +environment.deployConfig.desktopPortalId;
        // set default dektop portal id
        this.desktopPortalId = +environment.deployConfig.desktopPortalId;
        // set default mobile portal id
        this.mobilePortalId = +environment.deployConfig.mobilePortalId;
        // set configuration cache

        this.setDevicePortalID();

        // restore configuration cache from storage
        this.restoreConfigurationCache();
      }
    });
  }

  /**
   * Formats amount to currency provided in parameter. If currency is not provided, default currency
   * from configuration will be used.
   * @param amount Value to format
   * @param [currency] Currency to format with or omitted to use default currency
   */
  formatWithCurrency(amount: number, currency: string = '', displayOption: string = 'code'): string {
    amount = amount || 0;

    const amountFmtd = this.toFixedTrunc(amount, this._configurationCache['currencyDecimals'].data);

    // special case - we also use % as a currency, but Intl.NumberFormat would return error
    if (currency === '%') {
      return `${amountFmtd} %`;
    }
    // otherwise, try to format currency in user's locale
    const curr = currency ? currency : this._configurationCache['currencyAbbreviation'].data;
    let amountCurFmtd = '<FMT_ERR>';
    try {
      amountCurFmtd =
        new Intl.NumberFormat(this._configurationCache['profileLanguage'].data, {
          style: 'decimal',
        }).format(parseFloat(amountFmtd)) + ` ${curr}`;
    } catch (ex) {
      if (ex instanceof RangeError) {
        // currency error
        amountCurFmtd = amountFmtd + ' ' + '!ERR';
      } else {
        // unknown error
        log.warn(`formatWithCurrency() failed for amount: ${amount} and currency: ${currency}`, ex);
      }
    }
    return amountCurFmtd;
  }

  getCurrencySymbol = (locale: string, currency: string) =>
    (0)
      .toLocaleString(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, '')
      .trim();

  /**
   * Convert number to locale format (decimal point and fraction digit amount)
   * @param number Number to be transformed
   */
  getNumberInLocalFormat(number: number, numDigits?: number): string {
    const digits = !(numDigits === null || numDigits === undefined) ? numDigits : 2;

    return number.toLocaleString(this.defaultLanguage, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  //#region CONFIGURATION CACHE

  clearConfigurationCache() {
    this._configurationCache = {
      profileLanguage: {
        data: this.fallbackLanguage,
        timestamp: Date.now(),
      },
      currencyAbbreviation: {
        data: 'NZD',
        timestamp: Date.now(),
      },
      currencyDecimals: {
        data: 2,
        timestamp: Date.now(),
      },
      countriesList: {
        data: null as Country[] | null,
        timestamp: Date.now(),
      },
      languagesList: {
        data: null as any[] | null, // NativeApiLanguageData[],
        timestamp: Date.now(),
      },
      currenciesList: {
        data: null as Currency[] | null,
        timestamp: Date.now(),
      },
      menuGameTypes: {
        data: {
          [this.desktopPortalId]: {
            data: null as GameCategory[] | null,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: null as GameCategory[] | null,
            timestamp: Date.now(),
          },
        } as MenuCategoryPortal,
        timestamp: Date.now(),
      },
      lobbyGames: {
        data: {
          [this.desktopPortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
        } as LobbyGameCachePortal,
        timestamp: Date.now(),
      },
      gamesMenuCategories: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
        } as GameMenuCategoriesPortal,
        timestamp: Date.now(),
      },
      gameProviders: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
        } as GameProvidersPortal,
        timestamp: Date.now(),
      },
      templatesList: {
        data: null as TemplateData[] | null,
        timestamp: Date.now(),
      },
      currentBanners: {
        data: null as CurrentBannersData | null,
        timestamp: Date.now(),
      },
      currentPromotionBanners: {
        data: null as Banner[] | null,
        timestamp: Date.now(),
      },
      playerVerificationStatus: {
        data: null as PlayerStatusesResponse | null,
        timestamp: Date.now(),
      },
    };
    this.saveConfigToStorage();

    this.clearInMemoryConfigurationCache();
  }

  clearInMemoryConfigurationCache() {
    this._inMemoryConfigurationCache = {
      playerInfo: {
        data: null as PlayerDetails | null,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Clear player info and games data
   */
  clearPlayerInfoConfigurationCache() {
    this._configurationCache = {
      ...this._configurationCache,
      profileLanguage: {
        data: this.fallbackLanguage,
        timestamp: Date.now(),
      },
      lobbyGames: {
        data: {
          [this.desktopPortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
        } as LobbyGameCachePortal,
        timestamp: Date.now(),
      },
      gamesMenuCategories: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
        } as GameMenuCategoriesPortal,
        timestamp: Date.now(),
      },
      gameProviders: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
        } as GameProvidersPortal,
        timestamp: Date.now(),
      },
      currentBanners: {
        data: null as CurrentBannersData | null,
        timestamp: Date.now(),
      },
      currentPromotionBanners: {
        data: null as Banner[] | null,
        timestamp: Date.now(),
      },
      playerVerificationStatus: {
        data: null as PlayerStatusesResponse | null,
        timestamp: Date.now(),
      },
    };
    this.saveConfigToStorage();

    this.clearInMemoryConfigurationCache();
  }

  /**
   * Clear games data
   */
  clearGamesAndLobbyInfoConfigurationCache() {
    this._configurationCache = {
      ...this._configurationCache,
      lobbyGames: {
        data: {
          [this.desktopPortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as LobbyGameCache,
            timestamp: Date.now(),
          },
        } as LobbyGameCachePortal,
        timestamp: Date.now(),
      },
      gamesMenuCategories: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameMenuCategories,
            timestamp: Date.now(),
          },
        } as GameMenuCategoriesPortal,
        timestamp: Date.now(),
      },
      gameProviders: {
        data: {
          [this.desktopPortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
          [this.mobilePortalId]: {
            data: {} as GameProvidersLevel,
            timestamp: Date.now(),
          },
        } as GameProvidersPortal,
        timestamp: Date.now(),
      },
      currentBanners: {
        data: null as CurrentBannersData | null,
        timestamp: Date.now(),
      },
      currentPromotionBanners: {
        data: null as Banner[] | null,
        timestamp: Date.now(),
      },
      playerVerificationStatus: {
        data: null as PlayerStatusesResponse | null,
        timestamp: Date.now(),
      },
    };
    this.saveConfigToStorage();
  }

  //#endregion CONFIGURATION CACHE

  /**
   * Get/Set Countries list configuration cache
   */
  set profileLanguage(language: string) {
    log.debug('set profileLanguage invoked with language: ', language);
    this.setCachedItem('profileLanguage', language);
    // change ui langugage to match profile langugae
    if (language) {
      this.i18nService.language = language;
    }
  }
  get profileLanguage() {
    // return a copy
    return this.getCachedItem('profileLanguage');
  }

  /**
   * Get/Set Countries list configuration cache
   */
  set countriesList(countriesList: any /*Array<NativeApiCountryData>*/) {
    this.setCachedItem('countriesList', countriesList);
  }
  get countriesList() {
    // return a copy
    return this.getCachedItem('countriesList');
  }

  isCountriesListCached() {
    return (
      !!this._configurationCache['countriesList']?.data &&
      this._configurationCache['countriesList']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Countries list configuration cache
   */
  set currenciesList(currenciesList: any /*Array<NativeApiCountryData>*/) {
    this.setCachedItem('currenciesList', currenciesList);
  }
  get currenciesList() {
    // return a copy
    return this.getCachedItem('currenciesList');
  }

  isCurrenciesListCached() {
    return (
      !!this._configurationCache['currenciesList']?.data &&
      this._configurationCache['currenciesList']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Languages list configuration cache
   */
  set languagesList(languagesList: any /*Array<NativeApiLanguageData>*/) {
    this.setCachedItem('languagesList', languagesList);
  }
  get languagesList() {
    // return a copy
    return this.getCachedItem('languagesList');
  }

  isLanguagesListCached() {
    return (
      !!this._configurationCache['languagesList']?.data &&
      this._configurationCache['languagesList']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set PlayerInfo inMemory cache
   */
  set playerInfoInMemory(profileInfo: PlayerDetails) {
    this.setInMemoryCachedItem('playerInfo', profileInfo);
  }

  get playerInfoInMemory() {
    return this.getInMemoryCachedItem('playerInfo');
  }

  isPlayerInfoInMemoryCached() {
    return (
      !!this._inMemoryConfigurationCache['playerInfo']?.data &&
      this._inMemoryConfigurationCache['playerInfo']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Set pending flag for playerInfo data retrieval
   */
  public setPlayerInfoInMemoryPending(isPending: boolean): void {
    this.playerInfoInMemoryPending$.next(isPending);
  }

  /**
   * Get/Set Lobby cache
   */

  setLobbyGames(games: GameTile[], levelId: string) {
    const gamesCopy = JSON.parse(JSON.stringify(games)) as GameTile[];

    let lobbyGames = this._configurationCache['lobbyGames']?.data as LobbyGameCachePortal;
    if (!lobbyGames) {
      lobbyGames = {
        [this.mobilePortalId]: {
          data: {},
          timestamp: Date.now(),
        },
        [this.desktopPortalId]: {
          data: {},
          timestamp: Date.now(),
        },
      };

      this._configurationCache['lobbyGames'] = {
        data: lobbyGames,
        timestamp: Date.now(),
      } as CacheItem<LobbyGameCachePortal>;
    }

    if (lobbyGames[this.defaultPortalId]) {
      lobbyGames[this.defaultPortalId].data[levelId] = { data: gamesCopy, timestamp: Date.now() };
    }

    this.saveConfigToStorage();
  }

  getLobbyGames(levelId: string): GameTile[] {
    // return a copy
    const lobbyGames = this._configurationCache['lobbyGames']?.data as LobbyGameCachePortal;
    const games = lobbyGames[this.defaultPortalId]?.data[levelId]?.data;
    return JSON.parse(JSON.stringify(games ?? null));
  }

  isLobbyGamesCached(levelId: string) {
    const lobbyGamesCachePortal = this._configurationCache['lobbyGames']?.data as LobbyGameCachePortal;
    const lobbyGames = lobbyGamesCachePortal[this.defaultPortalId]?.data;
    if (lobbyGames) {
      const gamesForlevelId = lobbyGames[levelId];
      return gamesForlevelId && gamesForlevelId?.data && gamesForlevelId?.timestamp + this.cacheLifeSpan > Date.now();
    }

    return false;
  }

  /**
   * Get/Set game menu category
   */

  setGameMenuCategory(games: GameMenuCategoryModel[], levelId: string) {
    const gamesCopy = JSON.parse(JSON.stringify(games)) as GameMenuCategoryModel[];

    let menuCategoryPortal = this._configurationCache['gamesMenuCategories']?.data as GameMenuCategoriesPortal;
    if (!menuCategoryPortal) {
      menuCategoryPortal = {
        [this.mobilePortalId]: {
          data: {},
          timestamp: Date.now(),
        },
        [this.desktopPortalId]: {
          data: {},
          timestamp: Date.now(),
        },
      };

      this._configurationCache['gamesMenuCategories'] = {
        data: menuCategoryPortal,
        timestamp: Date.now(),
      } as CacheItem<GameMenuCategoriesPortal>;
    }

    if (menuCategoryPortal[this.defaultPortalId]) {
      menuCategoryPortal[this.defaultPortalId].data[levelId] = {
        data: {
          menu: gamesCopy,
        },
        timestamp: Date.now(),
      };
    }

    this.saveConfigToStorage();
  }

  getGameMenuCategory(levelId: string): GameMenuCategoriesData {
    // return a copy
    const menuCatPortal = this._configurationCache['gamesMenuCategories']?.data as GameMenuCategoriesPortal;
    const menuCat = menuCatPortal[this.defaultPortalId]?.data[levelId]?.data;
    return JSON.parse(JSON.stringify(menuCat ?? null));
  }

  isGameMenuCategoryCached(levelId: string) {
    const menuCatPortal = this._configurationCache['gamesMenuCategories']?.data as GameMenuCategoriesPortal;
    const menuCateg = menuCatPortal[this.defaultPortalId]?.data;
    if (menuCateg) {
      const menuForLvlId = menuCateg[levelId];
      return menuForLvlId && menuForLvlId?.data && menuForLvlId?.timestamp + this.cacheLifeSpan > Date.now();
    }

    return false;
  }

  /**
   * Get/Set game providers
   */

  setGameProvider(providers: GameProviderData[], levelId: string) {
    const providersCopy = JSON.parse(JSON.stringify(providers)) as GameProviderData[];

    let gameProvidersPortal = this._configurationCache['gameProviders']?.data as GameProvidersPortal;
    if (!gameProvidersPortal) {
      gameProvidersPortal = {
        [this.mobilePortalId]: {
          data: {},
          timestamp: Date.now(),
        },
        [this.desktopPortalId]: {
          data: {},
          timestamp: Date.now(),
        },
      };

      this._configurationCache['gameProviders'] = {
        data: gameProvidersPortal,
        timestamp: Date.now(),
      } as CacheItem<GameProvidersPortal>;
    }

    if (gameProvidersPortal[this.defaultPortalId]) {
      gameProvidersPortal[this.defaultPortalId].data[levelId] = {
        data: providersCopy,
        timestamp: Date.now(),
      };
    }

    this.saveConfigToStorage();
  }

  getGameProviders(levelId: string): GameProviderData[] {
    // return a copy
    const providersPortal = this._configurationCache['gameProviders']?.data as GameProvidersPortal;
    const providers = providersPortal[this.defaultPortalId]?.data[levelId]?.data;
    return JSON.parse(JSON.stringify(providers ?? null));
  }

  isGameProvidersCached(levelId: string) {
    const providersPortal = this._configurationCache['gameProviders']?.data as GameProvidersPortal;
    const providersLevel = providersPortal[this.defaultPortalId]?.data;
    if (providersLevel) {
      const providersForLevel = providersLevel[levelId];
      return (
        providersForLevel && providersForLevel?.data && providersForLevel?.timestamp + this.cacheLifeSpan > Date.now()
      );
    }

    return false;
  }

  /**
   * Get/Set MenuGameTypes cache
   */

  set menuGameTypes(menuGameTypes: GameCategory[]) {
    let menuGameTypeCache = this._configurationCache['menuGameTypes']?.data;
    if (!menuGameTypeCache) {
      const menuGameTypePortalObj: MenuCategoryPortal = {
        [this.mobilePortalId]: {
          data: [],
          timestamp: Date.now(),
        },
        [this.desktopPortalId]: {
          data: [],
          timestamp: Date.now(),
        },
      };

      this._configurationCache['menuGameTypes'] = {
        data: menuGameTypePortalObj,
        timestamp: Date.now(),
      } as CacheItem<any>;
    }

    menuGameTypeCache[this.defaultPortalId] = {
      data: JSON.parse(JSON.stringify(menuGameTypes)),
      timestamp: Date.now(),
    };

    this.saveConfigToStorage();
  }

  get menuGameTypes() {
    //returns a copy
    const menuGameTypeCache = this._configurationCache['menuGameTypes'].data[this.defaultPortalId].data;
    return JSON.parse(JSON.stringify(menuGameTypeCache ?? null));
  }

  isMenuGameTypesCached() {
    return (
      !!this._configurationCache['menuGameTypes']?.data[this.defaultPortalId].data &&
      this._configurationCache['menuGameTypes']?.data[this.defaultPortalId].timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Templates list configuration cache
   */
  set templatesList(templatesList: Array<TemplateData>) {
    this.setCachedItem('templatesList', templatesList);
  }
  get templatesList() {
    // return a copy
    return this.getCachedItem('templatesList');
  }

  isTemplatesListCached() {
    return (
      !!this._configurationCache['templatesList']?.data &&
      this._configurationCache['templatesList']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Current banners data configuration cache
   */
  set currentBanners(currentBanners: CurrentBannersData) {
    this.setCachedItem('currentBanners', currentBanners);
  }
  get currentBanners() {
    // return a copy
    return this.getCachedItem('currentBanners');
  }

  isBannerSmallListCached() {
    return (
      !!(this._configurationCache['currentBanners']?.data as CurrentBannersData)?.currentBannersSmall &&
      this._configurationCache['currentBanners']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  isBannerLargeListCached() {
    return (
      !!(this._configurationCache['currentBanners']?.data as CurrentBannersData)?.currentBannersLarge &&
      this._configurationCache['currentBanners']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Current promotion banners data configuration cache
   */
  set currentPromotionBanners(value: Banner[]) {
    this.setCachedItem('currentPromotionBanners', value);
  }
  get currentPromotionBanners(): Banner[] {
    // return a copy
    return this.getCachedItem('currentPromotionBanners');
  }

  isCurrentPromotionBannersCached() {
    return (
      !!this._configurationCache['currentPromotionBanners']?.data &&
      this._configurationCache['currentPromotionBanners']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  /**
   * Get/Set Player verification status data configuration cache
   */
  set playerVerificationStatus(value: PlayerStatusesResponse) {
    this.setCachedItem('playerVerificationStatus', value);
  }
  get playerVerificationStatus(): PlayerStatusesResponse {
    // return a copy
    return this.getCachedItem('playerVerificationStatus');
  }

  isPlayerVerificationStatusCached() {
    return (
      !!this._configurationCache['playerVerificationStatus']?.data &&
      this._configurationCache['playerVerificationStatus']?.timestamp + this.cacheLifeSpan > Date.now()
    );
  }

  get latestWinners(): LatestWinnersCache | null {
    return this.latestWinners$.value;
  }

  set latestWinners(data: LatestWinnersCache | null) {
    this.latestWinners$.next(data);
    this.saveConfigToStorage();
  }

  get latestWinnersIndex() {
    return this._latestWinnersIndex;
  }

  set latestWinnersIndex(index: number | null) {
    this._latestWinnersIndex = index;
    try {
      sessionStorage.setItem(latestWinnersIndexKey, JSON.stringify(index));
    } catch (error) {
      log.error('Error saving to session storage', error);
    }
  }

  /**
   * Returns profile for logged in user
   */
  getCredentials(): Credentials | null {
    return this.credentials;
  }

  /**
   * Stores logged in user profile object
   * @param userProfile User profile object
   */
  setCredentials(credentials: Credentials | null) {
    this.credentials = credentials;
  }

  areCredentialsLoaded(): boolean {
    return !!(this.credentials && this.credentials.jwt);
  }

  isDeviceMobile(): boolean {
    return this.deviceService.isMobile() || this.deviceService.isTablet();
  }

  /**
   * Truncates amount (number or string) to n decimal places without rounding.
   * Regular Math.Floor and parseInt have problems, because js floats are not very accurate
   * (i.e. Math.floor(8.20*100)/100 -> 8.19).
   * Solution based on solution (and problem discussion) posted on:
   * https://stackoverflow.com/questions/4187146/truncate-number-to-two-decimal-places-without-rounding
   *
   * @param amount Amount to be truncated
   * @param n Number of decimal places to be truncated to
   * @returns Truncated amount as string
   */
  private toFixedTrunc(amount: any, n: number): string {
    const v = (typeof amount === 'string' ? amount : amount.toString()).split(this.DECIMAL_SEPARATOR);
    if (n <= 0) {
      return v[0];
    }
    let f = v[1] || '';
    if (f.length > n) {
      return this.fixNegativeZeroAmount(`${v[0]}.${f.substr(0, n)}`);
    }
    while (f.length < n) {
      f += '0';
    }
    return this.fixNegativeZeroAmount(`${v[0]}.${f}`);
  }

  /**
   * Checks amount in string and removes negative sign if the value is 0
   * @param amount Amount to check as string
   */
  private fixNegativeZeroAmount(amount: string): string {
    if (amount[0] === '-' && parseFloat(amount) === 0) {
      amount = amount.slice(1);
    }
    return amount;
  }

  private restoreConfigurationCache() {
    let restored = false;

    const savedConfig =
      sessionStorage.getItem(configurationCacheSessionKey) || localStorage.getItem(configurationCacheSessionKey);
    const savedLatestWinnersIndex = sessionStorage.getItem(latestWinnersIndexKey);
    const savedLatestWinners = sessionStorage.getItem(latestWinnersKey);

    if (savedConfig) {
      try {
        this._configurationCache = JSON.parse(savedConfig);
        restored = true;
        log.debug('Configuration cache restored from session: ', this._configurationCache);
      } catch (err) {
        log.warn('Failed to restore configuration cache, removing stored data ...');
      }
    }

    if (savedLatestWinnersIndex) {
      this._latestWinnersIndex = JSON.parse(savedLatestWinnersIndex);
    }

    if (savedLatestWinners) {
      this.latestWinners = JSON.parse(savedLatestWinners);
    }

    if (!restored) {
      log.debug('Starting with clean configuration cache.');
      this.clearConfigurationCache();
    }
  }

  private saveConfigToStorage() {
    try {
      sessionStorage.setItem(configurationCacheSessionKey, JSON.stringify(this._configurationCache));
      sessionStorage.setItem(latestWinnersKey, JSON.stringify(this.latestWinners));
    } catch (error) {
      log.error('Error saving to session storage', error);
    }
  }

  private clearConfigStorage() {
    sessionStorage.removeItem(configurationCacheSessionKey);
  }

  private setCachedItem(itemName: string, value: any) {
    this._configurationCache[itemName].data = JSON.parse(JSON.stringify(value));
    this._configurationCache[itemName].timestamp = Date.now();
    this.saveConfigToStorage();
  }

  private getCachedItem(itemName: string) {
    return JSON.parse(JSON.stringify(this._configurationCache[itemName]?.data ?? null));
  }

  private setInMemoryCachedItem(itemName: string, value: any) {
    this._inMemoryConfigurationCache[itemName].data = JSON.parse(JSON.stringify(value));
    this._inMemoryConfigurationCache[itemName].timestamp = Date.now();
  }

  private getInMemoryCachedItem(itemName: string) {
    return JSON.parse(JSON.stringify(this._inMemoryConfigurationCache[itemName]?.data ?? null));
  }

  private setDevicePortalID() {
    if (this.isDeviceMobile()) {
      this.defaultPortalId = this.mobilePortalId;
    } else {
      this.defaultPortalId = this.desktopPortalId;
    }
  }
}
