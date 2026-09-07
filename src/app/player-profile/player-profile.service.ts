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
  UpdateProfileInput,
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
  TransactionStatusEnum,
  TransactionTypeEnum,
} from '@app/@shared/models';
import { CountryCode } from '@app/@shared/models/countries-code.model';
import {
  GetBetHistoryResponseResolved,
  SportsbookBetHistoryModelResolved,
  TransactionDetailsResolved,
} from '@app/@shared/models/sportsbook.model';
import { CredentialsService } from '@app/auth/credentials.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import {
  BalanceService,
  ChangeMessageTypeEnum,
  GetPlayerTransactionsRequest,
  GetPlayerTransactionsResponse,
  MessageService,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateService } from '@ngx-translate/core';
import { Observable, map, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { COUNTRY_CODES } from './country-codes';
import { IdLabel } from './wallet/wallet-history/wallet-history.component';

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
 * The wallet and message calls below still talk to the generated PortalGateway client, because
 * their ports (WalletGateway, MessagesGateway) are not written yet. They are the reason this file
 * still imports a vendor SDK.
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
  private balanceApi = inject(BalanceService);
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

  getWalletTransactions(
    filters: Partial<{
      dateFrom: Date | null;
      dateTo: Date | null;
      type: IdLabel[] | null;
      status: IdLabel | null;
      pageNumber: number | null;
      pageSize: number | null;
    }>,
  ): Observable<GetPlayerTransactionsResponseResolved> {
    log.debug('getWalletTransactions() invoked with:', filters, filters.dateFrom?.toISOString());

    const request: GetPlayerTransactionsRequest = {
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 5,
      fromDate: filters.dateFrom?.toISOString() ?? new Date(0).toISOString(),
      toDate: filters.dateTo?.toISOString() ?? new Date().toISOString(),
      retrieveChildTransactions: false,
      withManualTransactions: true,
    };

    return this.balanceApi.apiPortalV1BalanceTransactionsPost(request).pipe(
      switchMap((result) => {
        log.debug('getWalletTransactions() returned result:', result);

        let transactionList = result.transactions;

        if (filters.type) {
          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Other)) {
            transactionList = transactionList?.filter(
              (transaction) =>
                transaction.type == TransactionTypeEnum.Deposit || transaction.type == TransactionTypeEnum.Withdrawal,
            );
          }

          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Deposit)) {
            transactionList = transactionList?.filter((transaction) => transaction.type != TransactionTypeEnum.Deposit);
          }

          if (!filters.type?.some((type) => type.id === TransactionTypeEnum.Withdrawal)) {
            transactionList = transactionList?.filter(
              (transaction) => transaction.type != TransactionTypeEnum.Withdrawal,
            );
          }
        }

        result.transactions = transactionList;
        result.recordcount = transactionList?.length;

        // mocked transactions for testing purposes can be found in 'player-profile-mock.service.ts'
        return this.resolveWalletTransactions(result);
      }),
      catchError((err) => {
        log.debug('getWalletTransactions() returned error:', err);
        throw err;
      }),
    );
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

  getTransactionDetails(reference: string): Observable<TransactionDetailsResolved[]> {
    return this.balanceApi
      .apiPortalV1BalanceTransactionDetailsPost({
        referenceObject: reference,
      })
      .pipe(
        map((response) => {
          const mappedData: TransactionDetailsResolved[] =
            response?.transactionDetailsInfo
              ?.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
              ?.map((m) => {
                return {
                  balanceAfter: m.amountAfter ?? 0,
                  balanceBefore: m.amountBefore ?? 0,
                  transactionStepTypeName: m.transactionStepTypeName ?? '',
                  transactionStepTypeResolved: m.transactionStepTypeName
                    ? this.resolveStepType(m.transactionStepTypeName)
                    : '',
                };
              }) ?? [];

          return mappedData;
        }),
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

  private resolveWalletTransactions(
    data: GetPlayerTransactionsResponse,
  ): Observable<GetPlayerTransactionsResponseResolved> {
    const transactions = data.transactions ?? [];

    transactions.sort((a, b) => {
      const valA = typeof a.createTime === 'string' ? new Date(a.createTime) : a.createTime;
      const valB = typeof b.createTime === 'string' ? new Date(b.createTime) : b.createTime;
      return (valB?.valueOf() ?? 0) - (valA?.valueOf() ?? 0);
    });

    return this.configurationService.getPlayerInfo().pipe(
      map((playerInfo) => {
        const currencySymbol = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'currency',
          currencyDisplay: 'narrowSymbol',
          currency: playerInfo?.currencyCode ?? this.dataStoreService.defaultCurrency,
        })
          .format(0)
          .replace(/\d|\.|\,/g, '')
          .trim();

        const decimalFormatter = new Intl.NumberFormat(playerInfo?.locale ?? '', {
          style: 'decimal',
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        const resolved: TransactionHistoryModel[] = [];
        transactions.forEach((transaction) => {
          const amount = Math.trunc((transaction.amount ?? 0) * 100) / 100;
          const balanceAfterOrigin = Math.trunc((transaction.balanceAfter ?? 0) * 100) / 100;
          const balanceAfter =
            transaction.type === 1 && transaction.status !== 3 && transaction.status !== 2 // DEPOSIT with status that is not success or failed
              ? Math.trunc(((transaction.balanceAfter ?? 0) + (transaction.amount ?? 0)) * 100) / 100
              : balanceAfterOrigin;
          const balanceBefore =
            transaction.status === 3 //DEPOSIT subtracts amount from balance after
              ? Math.trunc(((transaction.balanceAfter ?? 0) - (transaction.amount ?? 0)) * 100) / 100
              : transaction.type === 2 || transaction.status === 5 //WITHDRAWAL adds amount to balance after
                ? Math.trunc(((transaction.balanceAfter ?? 0) + (transaction.amount ?? 0)) * 100) / 100
                : balanceAfterOrigin;

          resolved.push({
            ...transaction,
            payMethod: transaction.paymentInstrumentName ?? '',
            statusResolved: transaction.status
              ? this.translateService.instant(TransactionStatusEnum[transaction.status ?? 0] ?? '/')
              : '/',
            typeResolved: transaction.type
              ? this.translateService.instant(TransactionTypeEnum[transaction.type ?? 0] ?? '/')
              : '/',
            amount,
            amountResolved: `${currencySymbol} ${decimalFormatter.format(amount)}`,
            balanceAfter,
            balanceAfterResolved: `${currencySymbol} ${decimalFormatter.format(balanceAfter)}`,
            balanceBefore,
            balanceBeforeResolved: `${currencySymbol} ${decimalFormatter.format(balanceBefore)}`,
          });
        });

        const response: GetPlayerTransactionsResponseResolved = {
          ...data,
          transactions: resolved,
        };

        return response;
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

  private resolveStepType(stepType: string) {
    return marker(stepType === 'Debit' ? 'Bet' : stepType === 'Credit' ? 'Win' : 'Correction');
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
