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

import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { Logger } from '@app/@shared/logger.service';
import { Banner } from '@app/@shared/models';
import { GameMenuCategoryModel, GameProviderData, GameTile } from '@app/@shared/models/game.model';
import { Credentials } from '@app/auth';
import { I18nService } from '@app/i18n';
// Deep, type-only: the gateway index pulls in every adapter, and the adapters depend on this file.
import type { PlayerProfile, PlayerVerificationStatuses } from '@app/@core/gateway/player/player.models';
import type { CmsTemplate, Country } from '@app/@core/gateway/content/content.models';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Subject } from 'rxjs';

const log = new Logger('DataStoreService');

const configurationCacheSessionKey = 'config';

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

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface CurrentBannersData {
  currentBannersLarge?: Banner[];
  currentBannersSmall?: Banner[];
}

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private deviceService = inject(DeviceDetectorService);
  private i18nService = inject(I18nService);
  private readonly brand = inject(BRAND);

  public credentials: Credentials | null = null;

  readonly DECIMAL_SEPARATOR = '.';

  // default language
  defaultLanguage = this.brand.i18n.defaultLanguage;
  fallbackLanguage = this.brand.i18n.defaultLanguage;

  // default country
  defaultCountryCode = 'BR';

  // default currency
  defaultCurrency = 'BRL';

  // game lobby language: is en-US because is used in links
  gameLobbyLanguage = 'en-US';

  defaultPortalId = this.brand.ids.desktopPortalId;
  // desktop portal id
  desktopPortalId = this.brand.ids.desktopPortalId;
  // mobile portal id
  mobilePortalId = this.brand.ids.mobilePortalId;

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
    templatesList: {
      data: null as CmsTemplate[] | null,
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
      data: null as PlayerVerificationStatuses | null,
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
      data: null as PlayerProfile | null,
      timestamp: Date.now(),
    },
  };

  private _latestWinnersIndex = null as number | null;

  balanceVisibilityChange = new Subject<boolean>();
  private _balanceVisible = true;
  public get balanceVisible() {
    return this._balanceVisible;
  }
  public set balanceVisible(value) {
    this._balanceVisible = value;
    this.balanceVisibilityChange.next(this.balanceVisible);
  }

  constructor() {
    this.setDevicePortalID();
    this.restoreConfigurationCache();
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
      templatesList: {
        data: null as CmsTemplate[] | null,
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
        data: null as PlayerVerificationStatuses | null,
        timestamp: Date.now(),
      },
    };
    this.saveConfigToStorage();

    this.clearInMemoryConfigurationCache();
  }

  clearInMemoryConfigurationCache() {
    this._inMemoryConfigurationCache = {
      playerInfo: {
        data: null as PlayerProfile | null,
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

      currentBanners: {
        data: null as CurrentBannersData | null,
        timestamp: Date.now(),
      },
      currentPromotionBanners: {
        data: null as Banner[] | null,
        timestamp: Date.now(),
      },
      playerVerificationStatus: {
        data: null as PlayerVerificationStatuses | null,
        timestamp: Date.now(),
      },
    };
    this.saveConfigToStorage();

    this.clearInMemoryConfigurationCache();
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
  set countriesList(countriesList: Array<Country>) {
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
  set playerInfoInMemory(profileInfo: PlayerProfile) {
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
   * Get/Set Templates list configuration cache
   */
  set templatesList(templatesList: Array<CmsTemplate>) {
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
  set playerVerificationStatus(value: PlayerVerificationStatuses) {
    this.setCachedItem('playerVerificationStatus', value);
  }
  get playerVerificationStatus(): PlayerVerificationStatuses {
    // return a copy
    return this.getCachedItem('playerVerificationStatus');
  }

  isPlayerVerificationStatusCached() {
    return (
      !!this._configurationCache['playerVerificationStatus']?.data &&
      this._configurationCache['playerVerificationStatus']?.timestamp + this.cacheLifeSpan > Date.now()
    );
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

    if (savedConfig) {
      try {
        this._configurationCache = JSON.parse(savedConfig);
        restored = true;
        log.debug('Configuration cache restored from session: ', this._configurationCache);
      } catch (err) {
        log.warn('Failed to restore configuration cache, removing stored data ...');
      }
    }

    if (!restored) {
      log.debug('Starting with clean configuration cache.');
      this.clearConfigurationCache();
    }
  }

  private saveConfigToStorage() {
    try {
      sessionStorage.setItem(configurationCacheSessionKey, JSON.stringify(this._configurationCache));
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
