import { Injectable, inject } from '@angular/core';
import { DataStoreService } from '@app/@core';
import { ConfigurationService } from '@app/@core/configuration.service';
import {
  AnnualVerificationInput,
  BetStatus,
  ContactChannel,
  ContactPreferences,
  ContactVerificationStatus,
  FaceAuthTicket,
  GAMES_GATEWAY,
  GameHistoryPage,
  HistoryQuery,
  PLAYER_GATEWAY,
  PlayerLimit as GatewayPlayerLimit,
  PlayerSession,
  PlayerSessionStatus,
  PlayerVerificationStatuses,
  SessionHistoryQuery,
  SportsbookBetHistoryPage,
  TransactionPage,
  TransactionStep,
  TransactionQuery,
  UpdateProfileInput,
  WALLET_GATEWAY,
} from '@app/@core/gateway';
import { Logger } from '@app/@shared/logger.service';
import {
  GetGameHistoryResponseResolved,
  GetPlayerTransactionsResponseResolved,
  HistoryResolved,
  LimitTypeEnumResolved,
  PlayerLimit,
  SessionHistory,
  TransactionHistoryModel,
} from '@app/@shared/models';
import { CountryCode } from '@app/@shared/models/countries-code.model';
import { GetBetHistoryResponseResolved, SportsbookBetHistoryModelResolved } from '@app/@shared/models/sportsbook.model';
import { CredentialsService } from '@app/auth/credentials.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ChangeMessageTypeEnum, MessageService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { COUNTRY_CODES } from './country-codes';
import { TransactionTypeOption } from './wallet/wallet-history/wallet-history.component';

const log = new Logger('PlayerProfileService');

/**
 * Everything the profile screens do, in one place: the player's data, the responsible-gaming
 * limits, the history tables and the account's paperwork.
 *
 * The identity half now goes through {@link PLAYER_GATEWAY}, and what is left here is
 * orchestration: caching the verification statuses, turning amounts into strings in the player's
 * locale, and sorting a list before a table renders it.
 *
 * The game and sportsbook history now go through {@link GAMES_GATEWAY}, and what is left of them
 * here is the same orchestration: turning amounts into strings in the player's locale.
 *
 * The wallet goes through {@link WALLET_GATEWAY}, and what is left of it here is the formatting the
 * statement table needs.
 *
 * The message calls below still talk to the generated PortalGateway client, because their port
 * (MessagesGateway) is not written yet. They are the reason this file still imports a vendor SDK.
 */
@Injectable({
  providedIn: 'root',
})
export class PlayerProfileService {
  private playerGateway = inject(PLAYER_GATEWAY);
  private dataStoreService = inject(DataStoreService);
  private configurationService = inject(ConfigurationService);
  private translateService = inject(TranslateService);
  private gamesGateway = inject(GAMES_GATEWAY);
  private walletGateway = inject(WALLET_GATEWAY);
  private credentialsService = inject(CredentialsService);
  private messagesService = inject(MessageService);

  private playerLocale: string | undefined;

  constructor() {
    this.credentialsService.isAuthenticated$
      ?.pipe(
        switchMap((isAuth) => {
          let locale$ = of('en-NZ');
          if (isAuth) {
            locale$ = this.configurationService.getPlayerInfo().pipe(
              map((playerInfo) => {
                return playerInfo?.locale ?? 'en-NZ';
              }),
            );
          }
          return locale$;
        }),
      )
      .subscribe({
        next: (locale) => {
          this.playerLocale = locale;
        },
      });
  }

  /** The verification gates, from the cache when the caller can live with a stale answer. */
  getPlayerVerificationStatus(useCache: boolean = false): Observable<PlayerVerificationStatuses> {
    if (useCache && this.dataStoreService.isPlayerVerificationStatusCached()) {
      return of(this.dataStoreService.playerVerificationStatus);
    }

    return this.playerGateway.getVerificationStatuses().pipe(
      map((statuses) => {
        this.dataStoreService.playerVerificationStatus = statuses;
        return statuses;
      }),
    );
  }

  /** Opens an identity check for a player the operator wants to see again. */
  playerReverification(): Observable<FaceAuthTicket | null> {
    return this.playerGateway.startReverification();
  }

  /** Bars the player until the given ISO timestamp. They cannot undo it. */
  playerSelfExclusion(untilIso: string): Observable<FaceAuthTicket | null> {
    return this.playerGateway.selfExclude(untilIso);
  }

  /** A break that ends by itself at the given ISO timestamp. */
  playerSetTimeout(untilIso: string): Observable<void> {
    return this.playerGateway.timeOut(untilIso);
  }

  /** Sends a confirmation code to the player's e-mail address or phone. */
  verifyPlayerContactInfo(channel: ContactChannel): Observable<void> {
    return this.playerGateway.startContactVerification(channel);
  }

  /** Confirms a channel with the code the player received. */
  completeContactInfoVerification(channel: ContactChannel, verificationCode: string): Observable<void> {
    return this.playerGateway.confirmContactVerification(channel, verificationCode);
  }

  getCountryCodes(): Observable<CountryCode[]> {
    return of(COUNTRY_CODES);
  }

  /**
   * A page of the statement, with every amount already a string in the player's locale.
   *
   * The filter form is the screen's shape; what "Other" covers is the port's promise, so the list
   * of types travels as it is.
   */
  getWalletTransactions(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      type: TransactionTypeOption[] | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetPlayerTransactionsResponseResolved> {
    log.debug('getWalletTransactions() invoked with:', filters);

    const query: TransactionQuery = {
      from: filters.dateFrom ?? new Date(0),
      to: filters.dateTo ?? new Date(),
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 5,
      types: filters.type?.map((type) => type.id),
    };

    return this.walletGateway.getTransactions(query).pipe(switchMap((page) => this.resolveWalletTransactions(page)));
  }

  getSessionHistory(filter?: SessionHistoryQuery): Observable<SessionHistory[]> {
    const query: SessionHistoryQuery = { pageNumber: 1, pageSize: 1000, ...filter };

    return this.playerGateway.getSessions(query).pipe(map((sessions) => this.resolveSessionHistory(sessions)));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<FaceAuthTicket | null> {
    return this.playerGateway.changePassword(oldPassword, newPassword);
  }

  getPlayerLimits(): Observable<PlayerLimit[]> {
    return this.playerGateway.getLimits().pipe(map((limits) => this.resolvePlayerLimits(limits)));
  }

  setPlayerLimit(limit: PlayerLimit): Observable<void> {
    if (!limit.limitType)
      return throwError(
        () => new Error(this.translateService.instant(marker('Cannot set player limit without limit type.'))),
      );

    return this.playerGateway.setLimit({
      limitType: limit.limitType,
      time: limit.time,
      amountValue: limit.amountValue,
      reason: limit.reason,
    });
  }

  deletePlayerLimit(limitId: number): Observable<void> {
    return this.playerGateway.deleteLimit(limitId);
  }

  /** Saves the profile screen's changes. A ticket in the answer means biometry is still owed. */
  updatePlayerSettings(input: UpdateProfileInput): Observable<FaceAuthTicket | null> {
    return this.playerGateway.updateProfile(input);
  }

  /** Submits the yearly re-check the regulator requires. */
  updatePlayerAnnualReverification(input: AnnualVerificationInput): Observable<FaceAuthTicket | null> {
    return this.playerGateway.annualVerification(input);
  }

  getContactPreferences(): Observable<ContactPreferences> {
    return this.playerGateway.getContactPreferences();
  }

  /** Whether the player's phone number has been confirmed. */
  checkNumberVerification(): Observable<ContactVerificationStatus> {
    return this.playerGateway.getContactVerificationStatus('mobile-phone');
  }

  updateContactPreferences(preferences: ContactPreferences): Observable<void> {
    return this.playerGateway.updateContactPreferences(preferences);
  }

  getGameHistory(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetGameHistoryResponseResolved> {
    return this.gamesGateway.getGameHistory(toHistoryQuery(filters)).pipe(
      switchMap((page) => {
        log.debug('getGameHistory() returned result', page);
        return this.resolveHistoryList(page);
      }),
      catchError((err) => {
        log.debug('getGameHistory() returned error:', err);
        throw err;
      }),
    );
  }

  resolveHistoryList(page: GameHistoryPage): Observable<GetGameHistoryResponseResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = this.currencySymbolFor(playerInfo);
        const decimalFormatter = this.decimalFormatterFor(playerInfo);

        const historyList: HistoryResolved[] = page.rounds.map((round) => {
          const netWin = (round.won ?? 0) - (round.stake ?? 0);

          return {
            ...round,
            stakeResolved: currencySymbol + ' ' + decimalFormatter.format(round.stake ?? 0),
            wonResolved: currencySymbol + ' ' + decimalFormatter.format(round.won ?? 0),
            balanceBefore: 0,
            balanceBeforeResolved: currencySymbol + ' ' + decimalFormatter.format(0),
            balanceAfter: 0,
            balanceAfterResolved: currencySymbol + ' ' + decimalFormatter.format(0),
            netWin: netWin,
            netWinResolved: currencySymbol + ' ' + decimalFormatter.format(netWin),
            isWin: netWin > 0,
            locale: playerInfo?.locale ?? '',
          };
        });

        return { historyListResolved: historyList, recordCount: page.recordCount };
      }),
      catchError((err) => {
        log.debug('resolveHistoryList() returned error:', err);
        throw err;
      }),
    );
  }

  getSportsbookBetHistory(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetBetHistoryResponseResolved> {
    return this.gamesGateway.getSportsbookBetHistory(toHistoryQuery(filters)).pipe(
      switchMap((page) => {
        log.debug('getSportsbookBetHistory() returned result', page);
        return this.resolveSportsbookHistoryList(page);
      }),
      catchError((err) => {
        log.debug('getSportsbookBetHistory() returned error:', err);
        throw err;
      }),
    );
  }

  resolveSportsbookHistoryList(page: SportsbookBetHistoryPage): Observable<GetBetHistoryResponseResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = this.currencySymbolFor(playerInfo);
        const decimalFormatter = this.decimalFormatterFor(playerInfo);

        const historyList: SportsbookBetHistoryModelResolved[] = page.bets.map((bet) => {
          const netWin = (bet.winAmount ?? 0) - (bet.generalStake ?? 0);

          return {
            ...bet,
            generalStakeResolved: currencySymbol + ' ' + decimalFormatter.format(bet.generalStake ?? 0),
            winAmountResolved: currencySymbol + ' ' + decimalFormatter.format(bet.winAmount ?? 0),
            balanceBefore: 0,
            balanceBeforeResolved: currencySymbol + ' ' + decimalFormatter.format(0),
            balanceAfter: 0,
            balanceAfterResolved: currencySymbol + ' ' + decimalFormatter.format(0),
            netWin: netWin,
            netWinResolved: currencySymbol + ' ' + decimalFormatter.format(netWin),
            isWin: bet.status === BetStatus.Won,
            locale: playerInfo?.locale ?? '',
          };
        });

        return { historyListResolved: historyList, recordCount: page.recordCount };
      }),
      catchError((err) => {
        log.debug('resolveSportsbookHistoryList() returned error:', err);
        throw err;
      }),
    );
  }

  /**
   * The player's currency symbol on its own, which `Intl` will not hand over directly: format zero
   * and strip the digits back out.
   */
  private currencySymbolFor(playerInfo: { locale?: string; currencyCode?: string } | null): string {
    return new Intl.NumberFormat(playerInfo?.locale ?? '', {
      style: 'currency',
      currencyDisplay: 'narrowSymbol',
      currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
    })
      .format(0)
      .replace(/\d|\.|\,/g, '')
      .trim();
  }

  private decimalFormatterFor(playerInfo: { locale?: string } | null): Intl.NumberFormat {
    return new Intl.NumberFormat(playerInfo?.locale ?? '', {
      style: 'decimal',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  /** How one movement was settled, for the row a history screen has just expanded. */
  getTransactionDetails(reference: string): Observable<TransactionStep[]> {
    return this.walletGateway.getTransactionSteps(reference).pipe(
      catchError((err) => {
        log.debug('getTransactionDetails() returned error:', err);
        throw err;
      }),
    );
  }

  terminateAllSessions(): Observable<any> {
    // return this.playerServiceApi
    //   .apiPortalV1PlayerTerminateAllSessionsPost(this.dataStoreService.credentials?.renewalToken)
    //   .pipe(
    //     map((res) => {
    //       log.debug('terminateAllSessions() returned', res);
    //       return res;
    //     }),
    //     catchError((err) => {
    //       log.debug('terminateAllSessions() returned error:', err);
    //       throw err;
    //     })
    //   );
    return of();
  }

  getPlayerLocale() {
    return this.playerLocale;
  }

  closePlayerAccount(): Observable<FaceAuthTicket | null> {
    return this.playerGateway.closeAccount();
  }

  requestAnnualReport(): Observable<void> {
    return this.playerGateway.requestAnnualReport();
  }

  deleteMessage(id: number) {
    return this.messagesService.apiPortalV1MessageMessageIdDelete(id).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('apiPortalV1MessageMessageIdDelete() returned error:', err);
        throw err;
      }),
    );
  }

  toReadMessage(id: number) {
    return this.messagesService.apiPortalV1MessageMessageIdPut(id, ChangeMessageTypeEnum.Read).pipe(
      map((response) => {
        return response;
      }),
      catchError((err) => {
        log.debug('apiPortalV1MessageMessageIdPut() returned error:', err);
        throw err;
      }),
    );
  }

  /**
   * Active sessions first, plus the strings the security screen prints.
   *
   * When more than one session says it is active the list cannot tell which one is this browser's,
   * so the rest are shown as incomplete and nobody is offered a terminate button.
   */
  private resolveSessionHistory(sessions: PlayerSession[]): SessionHistory[] {
    const order = Object.values(PlayerSessionStatus);
    const sorted = [...sessions].sort(
      (a, b) =>
        order.indexOf(a.status ?? PlayerSessionStatus.Closed) - order.indexOf(b.status ?? PlayerSessionStatus.Closed),
    );

    const activeCount = sorted.filter((session) => session.status === PlayerSessionStatus.Active).length;

    return sorted.map((session) => ({
      ...session,
      client: 'Missing',
      userAgent: 'Missing',
      logonLocal: session.logonTime?.toLocaleString() ?? '',
      logoutLocal: session.logoutTime?.toLocaleString() ?? '',
      status:
        session.status === PlayerSessionStatus.Active && activeCount > 1
          ? PlayerSessionStatus.Incomplete
          : session.status,
      statusResolved:
        session.status === PlayerSessionStatus.Active || session.status === PlayerSessionStatus.Incomplete
          ? this.translateService.instant(PlayerSessionStatus.Active)
          : this.translateService.instant(PlayerSessionStatus.Closed),
      ipResolved: `${(session.realClientIp ? session.realClientIp : session.clientIp) ?? ''} ${
        session.countryCode ?? ''
      }`,
    }));
  }

  private resolveWalletTransactions(page: TransactionPage): Observable<GetPlayerTransactionsResponseResolved> {
    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = this.currencySymbolFor(playerInfo);
        const decimalFormatter = this.decimalFormatterFor(playerInfo);
        const money = (value: number) => `${currencySymbol} ${decimalFormatter.format(value)}`;

        return {
          recordCount: page.recordCount,
          transactions: page.transactions.map(
            (transaction): TransactionHistoryModel => ({
              ...transaction,
              statusResolved: transaction.status ? this.translateService.instant(transaction.status) : '/',
              typeResolved: this.translateService.instant(transaction.type),
              amountResolved: money(transaction.amount),
              balanceAfterResolved: money(transaction.balanceAfter),
              balanceBeforeResolved: money(transaction.balanceBefore),
            }),
          ),
        };
      }),
    );
  }

  private resolvePlayerLimits(limit: GatewayPlayerLimit[]): PlayerLimit[] {
    const resolved: PlayerLimit[] = [];

    limit?.forEach((limit) => {
      resolved.push({
        ...limit,
        amountRatio: limit.amountValue == undefined ? 0 : (100 * (limit.amountLeft ?? 0)) / limit.amountValue,
        limitTypeResolved: limit.limitType ? LimitTypeEnumResolved[limit.limitType] : '',
      });
    });

    return resolved;
  }
}

/**
 * The history filter form, as the port wants it.
 *
 * Both history screens hand over a partially filled form: a window they left open means "since the
 * beginning" and "until now", and a page they never touched is the first one.
 */
function toHistoryQuery(
  filters: Partial<{
    dateFrom: Date | null;
    dateTo: Date | null;
    pageNumber: number | null;
    pageSize: number | null;
  }>,
): HistoryQuery {
  return {
    from: filters.dateFrom ?? new Date(0),
    to: filters.dateTo ?? new Date(),
    pageNumber: filters.pageNumber ?? 1,
    pageSize: filters.pageSize ?? 5,
  };
}
