import { Injectable, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BRAND } from '@app/@core/brand';
import { Logger } from '@app/@shared/logger.service';
import { Subscription } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { GameTile } from './models';

/** Minimal shape `getGameCoverUrl` needs: a `GameMain`, a `Slot` adapter, or a winner row. */
export interface GameCover {
  externalId?: string | null;
  coverUrl?: string | null;
}

const log = new Logger('AssetsService');

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private iconService = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private translateService = inject(TranslateService);
  private readonly brand = inject(BRAND);

  gameTileImageFormat = 'jpg';
  gameBackgroundImageFormat = 'jpg';

  private langChangeSubscription!: Subscription;
  private langCode = '';

  private readonly providersLogoBasePath = 'assets/general/providers/';

  constructor() {
    // subscribe to language changes
    this.langChangeSubscription = this.translateService.onLangChange?.subscribe((event: LangChangeEvent) => {
      if (event.lang) {
        this.langCode = event.lang.substring(0, 2);
        log.debug('AssetsService(): language changed to ' + this.langCode);
      }
    });
  }

  destroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  /** Adds the icon to the registry so it can be used in <mat-icon> */
  addIconToRegistry(name: string, url: string): void {
    this.iconService.addSvgIcon(name, this.sanitizer.bypassSecurityTrustResourceUrl(this.cdnizeUrl(url)));
  }

  getGameImageUrl(externalGameId: string): string {
    //return this.cdnizeUrl(`assets/gametiles/${this.langCode}/${externalGameId}.${this.gameTileImageFormat}`);
    // games thumbnails are loaded from different location
    const url = `${this.brand.api.gamesThumbsBaseUrl}/${externalGameId}.webp` + this.brand.api.gamesThumbsUrlSuffix;
    return url;
  }

  /**
   * Thumbnail for a game, preferring the artwork the CMS ships with the game itself.
   *
   * The backoffice returns an absolute `coverUrl` on every game of `GET /api/v1/lobbies/*`,
   * `GET /api/v1/categories/{id}` and `POST /api/v1/slots/by-ids`. When it is missing (older
   * payloads, games with no artwork) we fall back to the brand thumbnail CDN keyed by external
   * game id, which is what the app used before the CMS carried covers.
   *
   * Both branches return an absolute url, so the result is safe to bind to `ngSrc`.
   */
  getGameCoverUrl(game: GameCover | null | undefined): string {
    const cover = game?.coverUrl;
    if (cover) {
      return cover;
    }
    return this.getGameImageUrl(game?.externalId ?? '');
  }

  getGameBackgroundImageUrl(externalGameId: string): string {
    return this.cdnizeUrl(
      `assets/gamebackgrounds/${this.langCode}/${externalGameId}.${this.gameBackgroundImageFormat}`,
    );
  }

  getCategoryImageUrl(category: string): string {
    return `assets/category-icons/${category}.svg`;
  }

  /**
   * Returns the url to the promotion image
   * @param fileName filename of the promotion image
   */
  getPromotionImageUrl(fileName: string): string {
    return this.cdnizeUrl(`assets/promotions/${this.langCode}/${fileName}`);
  }

  /**
   * Returns the url to the promotion icon
   * @param fileName filename of the promotion icon
   */
  getPromotionIconUrl(fileName: string): string {
    return this.cdnizeUrl(`assets/promotions/${this.langCode}/${fileName}`);
  }

  /**
   *
   * @param gamesList list of games
   * @returns list of games with correct tile and background image URL
   */
  getGamesImages(gamesList: GameTile[]): GameTile[] {
    return gamesList.map((game) => {
      game.gameDesktopAssetPath = this.getGameImageUrl(game.externalGameId || '');
      game.gameBackgroundAssetPath = this.getGameBackgroundImageUrl(game.externalGameId || '');
      return game;
    });
  }

  /**
   * Converts local asset path to cdn or other external storage url
   *
   * Note: You can provide a special language marker ${lang} to be replaced with
   * currenty selected application language (can be used for translatable assets).
   *
   * Example (current app language is de-DE):
   *
   * assets/banners/${lang}/banner1.png will be converted to
   *
   * <cdn_base_url>/assets/banners/de/banner1.png
   *
   * @param path path to local asset. Usually it starts with assets/...
   * @returns full url to external asset (if configured in deploy_config.json)
   */
  cdnizeUrl(path: string | undefined): string {
    if (!path) {
      return '';
    }

    // replace with current language
    const localizedPath = path.replace('${lang}', this.langCode);

    // add assets base url
    const assetsUrl = `${this.brand.api.assetsBaseUrl}/${this.brand.api.assetsPath}`;
    let fullPath = this.brand.api.assetsBaseUrl ? `${assetsUrl}/${localizedPath}` : localizedPath;

    // if we need to add query string, first check if we already have one
    if (this.brand.api.assetsQueryString) {
      fullPath =
        fullPath.indexOf('?') !== -1
          ? `${fullPath}&${this.brand.api.assetsQueryString}`
          : `${fullPath}?${this.brand.api.assetsQueryString}`;
    }
    fullPath = this.cleanUrl(fullPath);

    //log.debug(`cdnizeUrl(): ${path} -> ${fullPath}`);
    return fullPath;
  }

  /**
   * Removes multiple forward slashes in url path
   * @param url
   */
  cleanUrl(url: string) {
    return url.replace(/([^:])(\/\/+)/g, '$1/');
  }

  /**
   * Returns asset url by provider name, case sensitive (uppercase)
   * @param providerName
   * @returns string | undefined
   */
  getProviderAsset(providerName: string | null | undefined) {
    if (providerName?.length && providerName?.length > 0) {
      return `${this.providersLogoBasePath}${providerName?.toLowerCase()?.replace(/\s/g, '-')}.svg`;
    }
    return undefined;
  }
}
