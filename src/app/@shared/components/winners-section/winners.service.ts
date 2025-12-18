import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { GameCategoriesService } from '@app/@core/game-categories.service';
import { AssetsService } from '@app/@shared/assets.service';
import { Logger } from '@app/@shared/logger.service';
import { LatestWinnersCache, WinnersItem, WinnersItemResolved } from '@app/@shared/models';
import { GamesService } from '@app/@shared/services/games/games.service';
import { environment } from '@env/environment';
import { ProdGameService, TopWinnersATL } from '@icore/ngx-portalgateway-api-client-atl';
import { BehaviorSubject, combineLatest, map, Observable, of, repeat, switchMap, take, tap, timer } from 'rxjs';

const log = new Logger('WinnersService');

const LatestWinnersApiUpdateInterval = 300000;
const LatestWinnersApiUpdateIntervalOnEmpty = 10000;
const LatestWinnersUpdateAmount = 300;
const LatestWinnersTakeAmount = 7;
const LatestWinnersDaysBefore = 30;
const TopWinnersDaysBefore = 150;
const TopWinnersUpdateAmount = 7;

const TMPGameIds = [
  '1MillionFortunesMegaways94',
  'ArcticFruits',
  'AsgardWarriors',
  'AztecSecrets',
  'AztecWildsMegaways94',
];

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private gameApi = inject(ProdGameService);
  private dataStoreService = inject(DataStoreService);
  assetsService = inject(AssetsService);
  private gameCategoryService = inject(GameCategoriesService);
  private gamesService = inject(GamesService);

  private emptyLatestWinnersSubject = new BehaviorSubject(true);
  private emptyTopWinnersSubject = new BehaviorSubject(true);

  /** Emits `true` if the last api call to latest and top winners returned an empty array */
  emptyWinners$ = combineLatest([this.emptyLatestWinnersSubject.asObservable(), this.emptyTopWinnersSubject]).pipe(
    map(([emptyLatestWinners, emptyTopWinners]) => emptyLatestWinners && emptyTopWinners)
  );

  /**
   * Get next `nrOfWinners`. If time of validity has expired or there are no winners cached, request new data from API.
   * @param nrOfWinners Number of winners to retrieve on each emit. These are already cached winners.
   * @returns Observable of next `nrOfWinners` winners
   */
  private getLatestWinnersCached(nrOfWinners: number) {
    return this.dataStoreService.latestWinners$.pipe(
      take(1),
      switchMap((latestWinners) => {
        if (
          !latestWinners ||
          latestWinners.time + LatestWinnersApiUpdateInterval < new Date().valueOf() ||
          (latestWinners.items.length === 0 &&
            latestWinners.time + LatestWinnersApiUpdateIntervalOnEmpty < new Date().valueOf())
        ) {
          return this.getUpdatedLatestWinners().pipe(map((lw) => this.resolveWinners(lw)));
        } else {
          return of(this.resolveWinners(latestWinners.items));
        }
      }),
      map((latestWinners) => {
        const fromIndex = this.dataStoreService.latestWinnersIndex ?? 0;
        const selectedItems = this.getItems(latestWinners, nrOfWinners, fromIndex);
        this.dataStoreService.latestWinnersIndex = (fromIndex + nrOfWinners) % latestWinners.length;
        return selectedItems;
      })
    );
  }

  /**
   * Get latest winners every 2 - 4 seconds.
   * @returns Observable of latest `LatestWinnersTakeAmount` winners.
   */
  getLatestWinners(): Observable<WinnersItemResolved[]> {
    return this.getLatestWinnersCached(LatestWinnersTakeAmount).pipe(
      map((result) => {
        return result.map((item) => {
          const resolved: WinnersItemResolved = {
            gameName: item?.game?.title ?? '',
            user: item?.player?.nickname ?? '',
            betAmount: item?.round?.bet ?? 0,
            multiplierResolved: `${Math.round((item?.round?.win / item?.round?.bet + Number.EPSILON) * 100) / 100}x`,
            payoutAmount: item?.round?.win ?? 0,
          };
          return resolved;
        });
      }),
      repeat({ delay: () => timer(Math.random() * 2000 + 2000) })
    );
  }
  getPoolJackpot(): Observable<WinnersItem[]> {
    const topWinners: WinnersItem[] = Array(7)
      .fill(null)
      .map((_, index) => ({
        game: {
          identifier: '3_coins_egypt',
          title: '3 Coins Egypt',
          table_url: '',
          // table_image_path: `assets/cdn-simulation/games/${null ?? this.getRandomImage()}.webp`,
          table_image_path: '',
        },
        player: { nickname: `Nickname${Math.ceil(Math.random() * 100)}` },
        round: { currency: 'NZD', bet: Math.ceil(Math.random() * 500), win: Math.ceil(Math.random() * 500) },
      }));

    return of(topWinners);
  }

  /**
   * Update latest winners and save data to local storage.
   * @returns Observable of latest `LatestWinnersUpdateAmount` winners.
   */
  private getUpdatedLatestWinners(): Observable<TopWinnersATL[]> {
    const listTypeId = environment.deployConfig.brandId === 2 ? 2 : 4;
    return this.gameApi.apiPortalV1ProdGameTopWinnersGet(listTypeId).pipe(
      tap((winners) => {
        this.shuffleArray(winners ?? []);
        const updatedLatestWinnersCache: LatestWinnersCache = {
          items: winners ?? [],
          time: new Date().valueOf(),
        };
        this.dataStoreService.latestWinners = updatedLatestWinnersCache;
        this.dataStoreService.latestWinnersIndex = 0;
      }),
      tap((val) => {
        // Update empty winners subject
        this.emptyLatestWinnersSubject.next(!val || val.length === 0);
      })
    );
  }

  private resolveWinners(winners: TopWinnersATL[]) {
    const resolved: WinnersItem[] = [];
    winners.forEach((item) => {
      resolved.push({
        game: {
          identifier: item.gameExternalId ?? '',
          table_image_path: this.assetsService.getGameImageUrl(item.gameExternalId ?? ''),
          title: item.gameName ?? '',
        },
        player: {
          nickname: item.username ?? '',
        },
        round: {
          bet: isNaN(Number(item.betAmount)) ? 0 : Number(item.betAmount),
          currency: this.dataStoreService.defaultCurrency,
          win: isNaN(Number(item.amount)) ? 0 : Number(item.amount),
        },
      });
    });
    return resolved;
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Function which takes items from source array and creates a new array of defined length.
   * If the desired length is longer than source array, it wraps around.
   *
   * @param array Array to be used as source
   * @param n Number of items to take
   * @param i Index at which to start taking items from source array
   * @returns Array which starts at index i of source array and is of length n
   */
  private getItems<T>(array: T[], n: number, i: number): T[] {
    const length = array.length;
    if (array.length === 0) {
      return [];
    }
    const result: T[] = [];

    for (let j = i; j < i + n; j++) {
      const index = j % length;
      result.push(array[index]);
    }
    return result;
  }

  private getRandomImage() {
    return TMPGameIds[Math.floor(Math.random() * TMPGameIds.length)];
  }
}
