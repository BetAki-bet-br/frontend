import { Injectable, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { Observable, delay, of } from 'rxjs';
import { FaceAuthTicket } from '../../auth/auth.models';
import { PlayerGateway } from '../player.gateway';
import {
  ActivityOutcome,
  AnnualVerificationInput,
  ContactPreferences,
  ContactVerificationStatus,
  LimitStatus,
  LoyaltyStatus,
  PlayerBalance,
  PlayerLimit,
  PlayerProfile,
  PlayerSession,
  PlayerSessionStatus,
  PlayerVerificationStatuses,
  ReferAFriendStatistics,
  SetLimitInput,
  UpdateProfileInput,
} from '../player.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/**
 * `PlayerGateway` with no backend at all: one player, kept in `localStorage` for the length of the
 * browser profile.
 *
 * Same job as `DemoAuthGateway`, and the half that actually matters locally: without it the app
 * signs in and then dies on the first balance call. The player it invents is fully verified and
 * has money, so every screen behind the login is reachable. A production build refuses it.
 */
@Injectable()
export class DemoPlayerGateway implements PlayerGateway {
  private static readonly STORAGE_KEY = 'demo-player';

  /** The demo adapter has no session token to identify the player with, so it asks the app. */
  private readonly credentials = inject(CredentialsService);

  getProfile(): Observable<PlayerProfile | null> {
    return this.answer(this.read().profile);
  }

  updateProfile(input: UpdateProfileInput): Observable<FaceAuthTicket | null> {
    const state = this.read();
    state.profile = {
      ...state.profile,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      mobilePhone: input.mobilePhone ?? state.profile.mobilePhone,
      city: input.city ?? state.profile.city,
      street: input.street ?? state.profile.street,
      houseNumber: input.houseNumber ?? state.profile.houseNumber,
      postalCode: input.postalCode ?? state.profile.postalCode,
    };
    this.write(state);

    // No biometry: the point of the demo gateway is that a change goes through.
    return this.answer(null);
  }

  annualVerification(input: AnnualVerificationInput): Observable<FaceAuthTicket | null> {
    const state = this.read();
    state.profile = {
      ...state.profile,
      email: input.email,
      mobilePhone: input.mobilePhone,
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      city: input.city,
      postalCode: input.postalCode,
      street: input.street,
      houseNumber: input.houseNumber,
      stateProvince: input.stateProvince,
      countryCode: input.countryCode,
    };
    this.write(state);

    return this.answer(null);
  }

  changePassword(): Observable<FaceAuthTicket | null> {
    return this.answer(null);
  }

  closeAccount(): Observable<FaceAuthTicket | null> {
    return this.answer(null);
  }

  requestAnnualReport(): Observable<void> {
    return this.answer(undefined);
  }

  getVerificationStatuses(): Observable<PlayerVerificationStatuses> {
    return this.answer({
      playerStatus: true,
      kycStatus: true,
      kycAnnualVerificationRequired: false,
      email: true,
      phoneNumber: true,
      address: true,
      sigapReady: true,
      calculatedStatus: true,
    });
  }

  startReverification(): Observable<FaceAuthTicket | null> {
    return this.answer(null);
  }

  getContactVerificationStatus(): Observable<ContactVerificationStatus> {
    return this.answer<ContactVerificationStatus>('verified');
  }

  startContactVerification(): Observable<void> {
    return this.answer(undefined);
  }

  confirmContactVerification(): Observable<void> {
    return this.answer(undefined);
  }

  getSessions(): Observable<PlayerSession[]> {
    return this.answer([
      {
        logonTime: new Date().toISOString(),
        logoutTime: null,
        clientIp: '127.0.0.1',
        realClientIp: '127.0.0.1',
        countryCode: 'BR',
        status: PlayerSessionStatus.Active,
      },
    ]);
  }

  getContactPreferences(): Observable<ContactPreferences> {
    return this.answer(this.read().preferences);
  }

  updateContactPreferences(preferences: ContactPreferences): Observable<void> {
    const state = this.read();
    state.preferences = preferences;
    this.write(state);
    return this.answer(undefined);
  }

  getLimits(): Observable<PlayerLimit[]> {
    return this.answer(this.read().limits);
  }

  setLimit(input: SetLimitInput): Observable<void> {
    const state = this.read();
    state.limits = [
      ...state.limits.filter((limit) => limit.limitType !== input.limitType),
      {
        id: Date.now(),
        limitType: input.limitType,
        limitStatus: LimitStatus.Active,
        time: input.time,
        amountValue: input.amountValue,
        amountLeft: input.amountValue,
        locked: false,
        reason: input.reason,
        dateCreated: new Date().toISOString(),
        dateActivated: new Date().toISOString(),
      },
    ];
    this.write(state);

    return this.answer(undefined);
  }

  deleteLimit(limitId: number): Observable<void> {
    const state = this.read();
    state.limits = state.limits.filter((limit) => limit.id !== limitId);
    this.write(state);

    return this.answer(undefined);
  }

  selfExclude(): Observable<FaceAuthTicket | null> {
    return this.answer(null);
  }

  timeOut(): Observable<void> {
    return this.answer(undefined);
  }

  recordActivity(): Observable<ActivityOutcome> {
    return this.answer<ActivityOutcome>('ok');
  }

  getBalance(): Observable<PlayerBalance | null> {
    return this.answer({
      totalBalance: 1250.75,
      withdrawableBalance: 1000,
      lockedBalance: 250.75,
      realMoneyBalance: 1000,
      bonusCasinoBalance: 200.75,
      bonusSportsbookBalance: 50,
      currency: 'BRL',
    });
  }

  getLoyalty(): Observable<LoyaltyStatus | null> {
    return this.answer({
      level: 'Bronze',
      levelLabel: 'Bronze',
      points: 1200,
      totalPoints: 3400,
      nextLevel: 'Prata',
      pointsToNextLevel: 800,
    });
  }

  getReferAFriendStatistics(): Observable<ReferAFriendStatistics> {
    return this.answer({ total: 5, successful: 2, currentRegistered: 1, totalReferralBonuses: 100 });
  }

  referAFriend(): Observable<boolean> {
    return this.answer(true);
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }

  private read(): DemoPlayerState {
    try {
      const stored = localStorage.getItem(DemoPlayerGateway.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // A browser with storage blocked still gets a working player, just not a durable one.
    }

    return this.seed();
  }

  private write(state: DemoPlayerState): void {
    try {
      localStorage.setItem(DemoPlayerGateway.STORAGE_KEY, JSON.stringify(state));
    } catch {
      // See above: nothing to do, the next read seeds a fresh player.
    }
  }

  /** A complete Brazilian player, so no screen has an empty field to trip over. */
  private seed(): DemoPlayerState {
    const username = this.credentials.credentials?.username ?? '000.000.000-00';

    return {
      profile: {
        id: this.credentials.credentials?.userId ?? 1,
        username,
        firstName: 'Jogador',
        lastName: 'Demo',
        email: 'jogador.demo@example.com',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        mobilePhone: '+5511999999999',
        city: 'São Paulo',
        street: 'Avenida Paulista',
        houseNumber: '1000',
        postalCode: '01310-100',
        stateProvince: 'SP',
        countryCode: 'BR',
        currencyCode: 'BRL',
        locale: 'pt-BR',
      },
      preferences: {
        receiveExclusiveOffersAndBonuses: true,
        channels: { email: true, sms: true, im: false, telephone: false, post: false, popupInbox: true },
      },
      limits: [],
    };
  }
}

/** Everything the demo player owns, in one `localStorage` entry. */
interface DemoPlayerState {
  profile: PlayerProfile;
  preferences: ContactPreferences;
  limits: PlayerLimit[];
}
