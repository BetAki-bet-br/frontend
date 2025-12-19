import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { SessionService } from './session.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  Account as ApiAccount,
  GetBalanceResponse as ApiGetBalanceResponse,
  BonusCategoryIdEnum,
} from '../../api/model/models';
import { BalanceService as BalanceApiService } from '../../api';

export interface Account {
  name: string | null;
  balance: number;
  lockedAmount: number;
  currency: string | null;
  accountType: string;
  productType: string | null;
  wageringRequirement: number | null;
  wagered: number | null;
  wagerType: string;
  bonusType: string | null;
  initiallyLockedAmount: number;
  bonusCategoryId: number | null;
  playerBonusId: number | null;
  wageringContributionMode: string | null;
  numWageredRequirement: number | null;
  totalNumWagered: number | null;
}

export interface GetBalanceResponse {
  accounts: Account[];
  recordCount: number;
}

// Mappers
const bonusCategoryIdMap: Record<BonusCategoryIdEnum, number> = {
  FirstDeposit: 1,
  Reload: 2,
  Rebate: 3,
  Cashback: 4,
  FreeSpins: 5,
  AwardGames: 6,
  Freebet: 7,
};

function toLocalAccount(apiAccount: ApiAccount): Account {
  return {
    name: apiAccount.name ?? null,
    balance: apiAccount.balance ?? 0,
    lockedAmount: apiAccount.lockedAmount ?? 0,
    currency: apiAccount.currency ?? null,
    accountType: apiAccount.accountType ?? '',
    productType: apiAccount.productType ?? null,
    wageringRequirement: apiAccount.wageringRequirement ?? null,
    wagered: apiAccount.wagered ?? null,
    wagerType: apiAccount.wagerType ?? '',
    bonusType: apiAccount.bonusType ?? null,
    initiallyLockedAmount: apiAccount.initiallyLockedAmount ?? 0,
    bonusCategoryId: apiAccount.bonusCategoryId
      ? bonusCategoryIdMap[apiAccount.bonusCategoryId]
      : null,
    playerBonusId: apiAccount.playerBonusId ?? null,
    wageringContributionMode: apiAccount.wageringContributionMode ?? null,
    numWageredRequirement: apiAccount.numWageredRequirement ?? null,
    totalNumWagered: apiAccount.totalNumWagered ?? null,
  };
}

function toLocalBalanceResponse(apiResponse: ApiGetBalanceResponse): GetBalanceResponse {
  return {
    accounts: apiResponse.accounts?.map(toLocalAccount) ?? [],
    recordCount: apiResponse.recordCount ?? 0,
  };
}

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private readonly sessionService = inject(SessionService);
  private readonly balanceApiService = inject(BalanceApiService);

  private readonly fullBalance = signal<Account[]>([]);
  readonly isBalanceVisible = signal(true);

  readonly money = computed(() => {
    const account = this.fullBalance().find((acc) => acc.accountType === 'Money');
    return account?.balance ?? 0;
  });

  readonly withdrawable = computed(() => {
    const account = this.fullBalance().find((acc) => acc.accountType === 'WithdrawableBalance');
    return account?.balance ?? 0;
  });

  readonly nonWithdrawable = computed(() => {
    const account = this.fullBalance().find((acc) => acc.accountType === 'NonWithdrawableBalance');
    return account?.balance ?? 0;
  });

  readonly totalBalance = computed(() => {
    return this.money() + this.nonWithdrawable();
  });

  constructor() {
    effect(() => {
      if (this.sessionService.isAuthenticated()) {
        this.fetchBalance().subscribe();
      } else {
        this.fullBalance.set([]);
      }
    });
  }

  updateBalances() {
    this.fetchBalance().subscribe();
  }

  fetchBalance(): Observable<GetBalanceResponse> {
    return this.balanceApiService.apiPortalV1BalanceGet().pipe(
      map(toLocalBalanceResponse),
      tap((response) => {
        this.fullBalance.set(response.accounts || []);
      })
    );
  }

  toggleBalanceVisibility() {
    this.isBalanceVisible.update((value) => !value);
  }
}
