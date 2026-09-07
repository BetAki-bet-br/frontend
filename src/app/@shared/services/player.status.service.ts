import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { LoyaltyStatus, PLAYER_GATEWAY, PlayerBalance } from '@app/@core/gateway';
import { Logger } from '@app/@shared/logger.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import {
  Observable,
  ReplaySubject,
  catchError,
  exhaustMap,
  forkJoin,
  map,
  of,
  retry,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { AccountResolved } from '../models';

const log = new Logger('PlayerStatusService');

@Injectable({
  providedIn: 'root',
})
export class PlayerStatusService {
  private playerGateway = inject(PLAYER_GATEWAY);
  private configurationService = inject(ConfigurationService);
  private dataStoreService = inject(DataStoreService);
  private credentialsService = inject(CredentialsService);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);

  private loyaltyStatusSub = new ReplaySubject<LoyaltyStatus | null>(1);
  private balanceSub = new ReplaySubject<AccountResolved | null>(1);

  loyaltyStatusSub$ = this.loyaltyStatusSub.asObservable();
  balanceSub$ = this.balanceSub.asObservable();

  private readonly balanceUpdateInterval = 2000;
  private readonly responsibleGamingLimitUpdateInterval = 60000;

  private readonly balanceUpdateSpecificsConfig = {
    high: {
      urls: ['/profile/wallet/deposit', '/profile/wallet/deposit'],
      interval: 2000, //2s
    },
    medium: {
      urls: ['/game/'],
      interval: 10000, //10s
    },
    default: {
      interval: 30000, //30s default
    },
  };

  constructor() {
    // subscribe to player balance which repeats on 1 second and retries if error
    this.startBalanceUpdate().subscribe();
    // subscribe to player gaming limit expire which repeats on 1 min and retries if error
    this.startSessionResponsibleGamingLimitExpireCheck().subscribe();

    // Update player balance on authentication change
    this.credentialsService.isAuthenticated$?.pipe(switchMap((_) => this.updatePlayerBalance())).subscribe();
  }

  // Returns loyalty for player and emits new data
  updatePlayerLoyaltyStatus(): Observable<LoyaltyStatus | null> {
    return this.playerGateway.getLoyalty().pipe(
      tap((loyalty) => this.loyaltyStatusSub.next(loyalty)),
      catchError((err) => {
        log.debug('Get loyalty failed with error:', err);
        throw err;
      }),
    );
  }

  // Returns player balance and emits new data
  updatePlayerBalance(): Observable<AccountResolved | null> {
    if (!this.credentialsService.isAuthenticated()) return of(null);

    return this.playerGateway.getBalance().pipe(
      switchMap((balance) => (balance ? this.resolveBalance(balance) : of(null))),
      tap((resolved) => {
        this.balanceSub.next(resolved);
      }),
    );
  }

  // update all data and emit
  updatePlayerData(): Observable<{
    loyalty: LoyaltyStatus | null;
    balance: AccountResolved | null;
  }> {
    return forkJoin({
      loyalty: this.updatePlayerLoyaltyStatus(),
      balance: this.balanceSub$.pipe(take(1)),
    });
  }

  /**
   * Tells the gateway the player is still here, once a minute.
   *
   * The answer that matters is `session-limit-reached`: a responsible-gaming limit has run out and
   * the session is over, so the player is signed out. Which limit it was, and how the provider
   * reported it, is the adapter's business.
   */
  startSessionResponsibleGamingLimitExpireCheck(): Observable<unknown> {
    return timer(0, this.responsibleGamingLimitUpdateInterval).pipe(
      exhaustMap(() => {
        if (!this.credentialsService.isAuthenticated()) return of(null);

        return this.playerGateway
          .recordActivity()
          .pipe(
            switchMap((outcome) =>
              outcome === 'session-limit-reached' ? this.authenticationService.logout(true) : of(outcome),
            ),
          );
      }),
      catchError((err) => {
        log.debug('Get player activity failed with error:', err);
        throw err;
      }),
      retry({
        delay: (error, count) => {
          // Retry forever, but with an exponential step-back
          // maxing out at 5 minute.
          return timer(Math.min(60000 * 5, 2 ^ (count * this.responsibleGamingLimitUpdateInterval)));
        },
      }),
    );
  }

  startBalanceUpdate(): Observable<AccountResolved | null> {
    return timer(0, this.balanceUpdateInterval).pipe(
      exhaustMap((value: number) => {
        if (this.balanceUpdateSpecificsConfig.high.urls.some((substr) => this.router.url.startsWith(substr))) {
          if ((value * this.balanceUpdateInterval) % this.balanceUpdateSpecificsConfig.high.interval === 0) {
            return this.updatePlayerBalance();
          }
        }

        if (this.balanceUpdateSpecificsConfig.medium.urls.some((substr) => this.router.url.startsWith(substr))) {
          if ((value * this.balanceUpdateInterval) % this.balanceUpdateSpecificsConfig.medium.interval === 0) {
            return this.updatePlayerBalance();
          }
        }

        if ((value * this.balanceUpdateInterval) % this.balanceUpdateSpecificsConfig.default.interval === 0) {
          return this.updatePlayerBalance();
        }

        return of(null);
      }),
      catchError((err) => {
        log.debug('Get balance failed with error:', err);
        throw err;
      }),
      retry({
        delay: (error, count) => {
          // Retry forever, but with an exponential step-back
          // maxing out at 1 minute.
          return timer(Math.min(60000, 2 ^ (count * this.balanceUpdateInterval)));
        },
      }),
    );
  }

  /**
   * The gateway already split the balance; this only adds the symbol the screens print, which
   * depends on the player's locale and is therefore not the gateway's to know.
   */
  private resolveBalance(balance: PlayerBalance): Observable<AccountResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currency = balance.currency ?? playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency;

        return {
          ...balance,
          currency,
          currencySymbol: this.dataStoreService.getCurrencySymbol(this.dataStoreService.defaultLanguage, currency),
        };
      }),
    );
  }
}
