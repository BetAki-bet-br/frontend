import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { GamesGateway } from '../games.gateway';
import {
  BetStatus,
  Game,
  GameHistoryPage,
  GameLaunchResult,
  GameRound,
  GameRoundStatus,
  HistoryQuery,
  LaunchGameInput,
  SportsbookBet,
  SportsbookBetHistoryPage,
  TopWinner,
} from '../games.models';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/** How many rounds and bets the invented history holds, spread one per day backwards from today. */
const HISTORY_DAYS = 30;

/**
 * `GamesGateway` with no backend at all: a small invented catalogue, a placeholder game, and a
 * month of history generated from a fixed seed.
 *
 * Same job as the other demo adapters — open the app locally with the provider hosts dead, and
 * show a brand end to end without one. The lobby itself does not depend on this: its rows and
 * artwork come from the backoffice, so the pages that matter still look real. A production build
 * refuses this adapter.
 */
@Injectable()
export class DemoGamesGateway implements GamesGateway {
  /** The games the demo player has opened this session, newest first. */
  private static readonly RECENT_KEY = 'demo-games-recent';

  getGames(): Observable<Game[]> {
    return this.answer(DEMO_CATALOGUE);
  }

  getRecentlyPlayedIds(count: number): Observable<string[]> {
    return this.answer(this.readRecent().slice(0, count));
  }

  launchGame(input: LaunchGameInput): Observable<GameLaunchResult> {
    this.rememberRecent(input.gameId);

    return this.answer<GameLaunchResult>({
      outcome: 'ok',
      launch: {
        id: 1,
        gameExternalId: input.gameId,
        url: placeholderGameUrl(input),
        parameters: {},
        webMethod: 'GET',
      },
    });
  }

  /**
   * Nothing. A brand with no players has no winners, and the invented ids would not match any
   * game the backoffice knows, so the ticker would drop them anyway. `WinnersService` answers an
   * empty list by falling back to the backoffice's curated batch, which is what a local run wants.
   */
  getTopWinners(): Observable<TopWinner[]> {
    return this.answer([] as TopWinner[]);
  }

  getGameHistory(query: HistoryQuery): Observable<GameHistoryPage> {
    const rounds = demoRounds().filter((round) => within(round.start, query));
    return this.answer({ rounds: page(rounds, query), recordCount: rounds.length });
  }

  getSportsbookBetHistory(query: HistoryQuery): Observable<SportsbookBetHistoryPage> {
    const bets = demoBets().filter((bet) => within(bet.insertDate, query));
    return this.answer({ bets: page(bets, query), recordCount: bets.length });
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }

  private readRecent(): string[] {
    try {
      const stored = localStorage.getItem(DemoGamesGateway.RECENT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // A browser with storage blocked still plays, it just never remembers what.
    }
    return [];
  }

  private rememberRecent(gameId: string): void {
    const recent = [gameId, ...this.readRecent().filter((id) => id !== gameId)].slice(0, 50);
    try {
      localStorage.setItem(DemoGamesGateway.RECENT_KEY, JSON.stringify(recent));
    } catch {
      // See above.
    }
  }
}

/**
 * A handful of games, one of them from Softswiss because the lobby has a row that filters on that
 * supplier and an empty row is a worse demo than a short one.
 */
const DEMO_CATALOGUE: Game[] = [
  { id: 1, externalId: 'DEMO-0001', name: 'Fortuna do Sol', productSupplierName: 'Softswiss', gameTypeName: 'Slots' },
  { id: 2, externalId: 'DEMO-0002', name: 'Trilha do Ouro', productSupplierName: 'Softswiss', gameTypeName: 'Slots' },
  {
    id: 3,
    externalId: 'DEMO-0003',
    name: 'Roleta Brasileira',
    productSupplierName: 'Evolution',
    gameTypeName: 'Roulette',
  },
  {
    id: 4,
    externalId: 'DEMO-0004',
    name: 'Blackjack ao Vivo',
    productSupplierName: 'Evolution',
    gameTypeName: 'Blackjack',
  },
  {
    id: 5,
    externalId: 'DEMO-0005',
    name: 'Tigre da Sorte',
    productSupplierName: 'Pragmatic Play',
    gameTypeName: 'Slots',
  },
  {
    id: 6,
    externalId: 'DEMO-0006',
    name: 'Mina de Diamantes',
    productSupplierName: 'Pragmatic Play',
    gameTypeName: 'Slots',
  },
];

/**
 * The page the placeholder game runs at, as a self-contained document.
 *
 * A `data:` url and not a file under `assets/`, so the adapter stays what the other demo adapters
 * are: something that invents its answers in memory and ships nothing with the brand.
 */
function placeholderGameUrl(input: LaunchGameInput): string {
  const document = `<!doctype html><meta charset="utf-8"><title>${input.gameId}</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;font:16px/1.5 system-ui;background:#111;color:#eee">
<div style="text-align:center">
<p style="font-size:14px;letter-spacing:.2em;opacity:.6;margin:0">JOGO DE DEMONSTRA&Ccedil;&Atilde;O</p>
<p style="font-size:28px;margin:.4em 0">${input.gameId}</p>
<p style="font-size:14px;opacity:.6;margin:0">Nenhum provedor est&aacute; conectado nesta marca.</p>
</div>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(document)}`;
}

/** One round a day going backwards, alternating win and loss so both table styles show up. */
function demoRounds(): GameRound[] {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const game = DEMO_CATALOGUE[index % DEMO_CATALOGUE.length];
    const start = daysAgo(index);
    const won = index % 3 === 0 ? 45.5 : 0;

    return {
      id: `demo-round-${index + 1}`,
      name: game.name,
      start: start.toISOString(),
      stop: new Date(start.getTime() + 4 * 60 * 1000).toISOString(),
      stake: 10,
      won,
      status: GameRoundStatus.Finished,
    };
  });
}

/** Same idea for the sportsbook, with a running slip at the top so that state is visible too. */
function demoBets(): SportsbookBet[] {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const placed = daysAgo(index);
    const status = index === 0 ? BetStatus.Running : index % 3 === 0 ? BetStatus.Won : BetStatus.Lost;

    return {
      externalBetSlipId: `demo-bet-${index + 1}`,
      betSlipDescription: 'Simples - Brasileirão Série A',
      insertDate: placed.toISOString(),
      settleTime: status === BetStatus.Running ? null : new Date(placed.getTime() + 2 * 3600 * 1000).toISOString(),
      generalStake: 20,
      winAmount: status === BetStatus.Won ? 62 : 0,
      status,
      settleId: status === BetStatus.Running ? undefined : 9000 + index,
    };
  });
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

function within(isoDate: string | null | undefined, query: HistoryQuery): boolean {
  if (!isoDate) return false;
  const at = new Date(isoDate).getTime();
  return at >= query.from.getTime() && at <= query.to.getTime();
}

/** The port's pages are 1-based, the way both history screens count. */
function page<T>(rows: T[], query: HistoryQuery): T[] {
  const start = Math.max(0, (query.pageNumber - 1) * query.pageSize);
  return rows.slice(start, start + query.pageSize);
}
