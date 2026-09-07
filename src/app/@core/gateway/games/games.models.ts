/**
 * The vocabulary the application uses to talk about games: what is in the catalogue, where a
 * launched game runs, who won what, and what the player has been playing.
 *
 * Nothing here comes from a vendor SDK on purpose. The lobby's *content* — which rows exist, which
 * games sit in them, the artwork — comes from our own backoffice and never crosses this port. What
 * a game provider owns is narrower: the catalogue of games it can serve, the launch, the top-winner
 * ticker, and the player's own round and bet history.
 */

/**
 * One game in the provider's catalogue.
 *
 * Deliberately small: only the fields a screen reads. The provider knows more (supplier ids,
 * product ids, per-game parameter blobs, jackpot pools) and none of it reaches a template, so none
 * of it is here. The artwork, the RTP and the volatility are the backoffice's, and
 * `GameMain` in `games-page/models/game.models.ts` extends this with them.
 */
export interface Game {
  /** The provider's own id for the game. */
  id: number;
  /** The id everything else refers to the game by: launch, history, winners, the CMS. */
  externalId: string;
  /** Title, as the card shows it. */
  name: string;
  /** The studio behind the game ("Pragmatic Play"). The lobby groups and filters on it. */
  productSupplierName: string;
  /** What kind of game it is ("Slots", "Roulette"), as the card's badge shows it. */
  gameTypeName: string;
}

/** Where the player came from and goes back to, for the chrome the provider draws around a game. */
export interface LaunchGameInput {
  /** The game's {@link Game.externalId}. */
  gameId: string;
  /** Absolute url of the lobby, for the provider's "back to lobby" control. */
  lobbyUrl: string;
  /** Absolute url to return to when the player closes the game. */
  returnUrl: string;
  /** Absolute url of the deposit screen, for the provider's "out of money" prompt. */
  depositUrl: string;
}

/** An opened game: where it runs and how to load it. */
export interface GameLaunch {
  /** The provider's id for this launch. */
  id: number;
  /** Echo of the game that was opened, in {@link Game.externalId} space. */
  gameExternalId: string;
  /** Absolute url the game runs at. */
  url: string;
  /** Query parameters to append to {@link url} before loading it. */
  parameters: Record<string, string>;
  /** `GET` or `POST`: how the provider expects the url to be opened. */
  webMethod: string;
}

/**
 * The answer to a launch request.
 *
 * `unavailable` is the provider saying the game exists but cannot be played right now — a
 * maintenance window, a country restriction, a licence that lapsed. It is a different message to
 * the player from "the launch failed", which surfaces as a thrown error like everywhere else.
 */
export type GameLaunchResult = { outcome: 'ok'; launch: GameLaunch } | { outcome: 'unavailable' };

/**
 * One row of the lobby's winner ticker.
 *
 * No username: providers send the real one and the ticker must never show it, so the app generates
 * a display name keyed on {@link playerId}. A gateway that has a masked name to offer belongs in
 * the fallback path of `WinnersService`, not here.
 */
export interface TopWinner {
  /** Stable id for the winner, so the generated display name survives a refresh. */
  playerId: string;
  /** The game they won on, in {@link Game.externalId} space. */
  gameExternalId: string;
  gameName: string;
  /** The prize, already a string: providers send it formatted and the ticker renders it as is. */
  amount: string;
}

/** How the history screens narrow a list. Both history calls take the same window. */
export interface HistoryQuery {
  from: Date;
  to: Date;
  /** 1-based, the way both history screens count. */
  pageNumber: number;
  pageSize: number;
}

/**
 * What became of a round of play.
 *
 * Written as a constant object and not a bare union because the history table both compares
 * against it and hands the value to `translate.instant()`, so these strings are also translation
 * keys.
 */
export const GameRoundStatus = {
  Active: 'Active',
  Finished: 'Finished',
  Voided: 'Voided',
} as const;
export type GameRoundStatus = (typeof GameRoundStatus)[keyof typeof GameRoundStatus];

/** One round of play, as the casino history table shows it. */
export interface GameRound {
  /** The provider's id for the round. Rendered as the reference the player quotes to support. */
  id?: string | null;
  /** Name of the game that was played. */
  name?: string | null;
  /** ISO timestamp the round started. */
  start?: string | null;
  /** ISO timestamp the round ended. Absent while the round is `Active`. */
  stop?: string | null;
  /** What was staked, in the account's currency. Formatting is the app's job. */
  stake?: number | null;
  /** What was won. Whether it is gross or net of bonus is the operator's configuration. */
  won?: number | null;
  status?: GameRoundStatus;
}

/** A page of {@link GameRound}s, with the total the paginator needs. */
export interface GameHistoryPage {
  rounds: GameRound[];
  /** How many rounds the filter matches in total, not how many are in this page. */
  recordCount: number;
}

/**
 * What became of a bet slip. Also a translation key, same as {@link GameRoundStatus}.
 *
 * The full domain is listed even though the sportsbook screen only colours three of them: a status
 * the app cannot name would reach the table as a blank cell.
 */
export const BetStatus = {
  None: 'None',
  Placed: 'Placed',
  Running: 'Running',
  CashOut: 'CashOut',
  PartialCashOut: 'PartialCashOut',
  Won: 'Won',
  Lost: 'Lost',
  HalfWon: 'HalfWon',
  HalfLost: 'HalfLost',
  Tie: 'Tie',
  Void: 'Void',
  Cancelled: 'Cancelled',
  Declined: 'Declined',
  Refund: 'Refund',
} as const;
export type BetStatus = (typeof BetStatus)[keyof typeof BetStatus];

/** One bet slip, as the sportsbook history table shows it. */
export interface SportsbookBet {
  /** The reference the player sees and quotes to support. */
  externalBetSlipId?: string | null;
  /** What was bet on, in the sportsbook's own words. */
  betSlipDescription?: string | null;
  /** ISO timestamp the slip was placed. */
  insertDate?: string;
  /** ISO timestamp the slip was settled. Absent while the bet is still running. */
  settleTime?: string | null;
  /** Total staked across the slip's selections. */
  generalStake?: number;
  /** What it paid out. Gross or net of bonus is the operator's configuration. */
  winAmount?: number | null;
  status?: BetStatus;
  /**
   * The settlement's id, which the wallet's transaction-detail call takes to explain how the
   * balance moved. Absent while the bet is still running.
   */
  settleId?: number;
}

/** A page of {@link SportsbookBet}s, with the total the paginator needs. */
export interface SportsbookBetHistoryPage {
  bets: SportsbookBet[];
  /** How many bets the filter matches in total, not how many are in this page. */
  recordCount: number;
}
