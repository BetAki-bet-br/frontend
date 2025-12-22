import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { Logger } from '@app/@shared/logger.service';
import { AuthenticationService, CredentialsService } from '@app/auth';
import {
  Account,
  BalanceService,
  CheckUserRegistrationReturn,
  Loyalty,
  LoyaltyService,
  PlayerService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
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
  throwError,
  timer,
} from 'rxjs';
import { AccountResolved } from '../models';

const log = new Logger('PlayerStatusService');

@Injectable({
  providedIn: 'root',
})
export class PlayerStatusService {
  private loyaltyServiceApi = inject(LoyaltyService);
  private balanceService = inject(BalanceService);
  private configurationService = inject(ConfigurationService);
  private playerServiceApi = inject(PlayerService);
  private dataStoreService = inject(DataStoreService);
  private credentialsService = inject(CredentialsService);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);
  private dialog = inject(Dialog);
  private translate = inject(TranslateService);
  private activatedRoute = inject(ActivatedRoute);

  private loyaltyStatusSub = new ReplaySubject<Loyalty | null>(1);
  private balanceSub = new ReplaySubject<AccountResolved | null>(1);

  loyaltyStatusSub$ = this.loyaltyStatusSub.asObservable();
  balanceSub$ = this.balanceSub.asObservable();

  private readonly balanceUpdateInterval = 2000;
  private readonly responsibleGamingLimitUpdateInterval = 60000;
  private readonly geolocationCheck = 1800000;

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
    // subscribe to start geolocation check which repeats on 30 min and retries if error
    // this.startGeolocationCheck().subscribe();

    // Update player balance on authentication change
    this.credentialsService.isAuthenticated$?.pipe(switchMap((_) => this.updatePlayerBalance())).subscribe();
  }

  // Returns loyalty for player and emits new data
  updatePlayerLoyaltyStatus(): Observable<Loyalty | null> {
    return this.loyaltyServiceApi.apiPortalV1LoyaltyGet().pipe(
      map((response) => {
        if (response.loyalty) {
          this.loyaltyStatusSub.next(response.loyalty);
          return response.loyalty;
        }
        return null;
      }),
      catchError((err) => {
        log.debug('Get loyalty failed with error:', err);
        throw err;
      }),
    );
  }

  // Returns player balance and emits new data
  updatePlayerBalance(): Observable<AccountResolved | null> {
    if (!this.credentialsService.isAuthenticated()) return of(null);

    return this.balanceService.apiPortalV1BalanceGet('true', 'true').pipe(
      switchMap((response) => {
        if (response.accounts) {
          return this.resolveAccount(response.accounts);
        }
        return of(null);
      }),
      tap((resolved) => {
        this.balanceSub.next(resolved);
      }),
    );
  }

  // update all data and emit
  updatePlayerData(): Observable<{
    loyalty: Loyalty | null;
    balance: Account | null;
  }> {
    return forkJoin({
      loyalty: this.updatePlayerLoyaltyStatus(),
      balance: this.balanceSub$.pipe(take(1)),
    });
  }

  startSessionResponsibleGamingLimitExpireCheck(): Observable<CheckUserRegistrationReturn | null> {
    return timer(0, this.responsibleGamingLimitUpdateInterval).pipe(
      exhaustMap(() => {
        if (!this.credentialsService.isAuthenticated()) return of(null);

        return this.playerServiceApi.apiPortalV1PlayerPlayerActivityPost().pipe(
          catchError((err) => {
            log.debug('Get player activity failed with error:', err);
            if (
              err?.error?.errorMessage === 'RGLSiteSessionCheckFailed' ||
              err?.error?.errorMessage === 'RGLDailySiteSessionCheckFailed' ||
              err?.error?.errorMessage === 'RGLMonthlySiteSessionCheckFailed'
            ) {
              return this.authenticationService.logout(true).pipe(switchMap((_) => throwError(() => err)));
            }
            throw err;
          }),
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

  private resolveAccount(accounts: Account[]): Observable<AccountResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const withdrawableBalance =
          accounts.find((account) => account.accountType === 'WithdrawableBalance')?.balance ?? 0;
        const nonWithdrawableBalance =
          accounts.find((account) => account.accountType === 'NonWithdrawableBalance')?.balance ?? 0;
        const realMoneyBalance = accounts.find((account) => account.accountType === 'Money')?.balance ?? 0;
        const bonusCasinoBalance =
          accounts.find((account) => account.accountType === 'BonusMoney' && account.productType === 'Casino')
            ?.balance ?? 0;
        const bonusSportsbookBalance =
          accounts.find((account) => account.accountType === 'BonusMoney' && account.productType === 'Sportsbook')
            ?.balance ?? 0;
        const totalBalance = withdrawableBalance + nonWithdrawableBalance;

        const currency = accounts[0].currency ?? playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency;
        const currencySymbol = this.dataStoreService.getCurrencySymbol(this.dataStoreService.defaultLanguage, currency);

        const resolved: AccountResolved = {
          totalBalance,
          lockedBalance: nonWithdrawableBalance,
          realMoneyBalance,
          bonusCasinoBalance,
          bonusSportsbookBalance,
          currency: currency,
          currencySymbol: currencySymbol,
          withdrawableBalance,
        };

        return resolved;
      }),
    );
  }
}
