import { Game } from '@app/@core/gateway';

export interface AwardedData {
  wins_count: number;
  prize_sum: number;
  max_prize: number;
  avg_prize: number;
}

/**
 * A game on a lobby card: what the games gateway knows about it, plus what the backoffice adds.
 *
 * The {@link Game} half comes from whoever supplies the games; everything below it is the CMS's —
 * the artwork, the numbers the card badges, and the jackpot figures. A card built entirely from
 * backoffice data (the search pages, the recently-played row) fills the gateway half from the
 * slot's own fields and leaves the rest out.
 */
export interface GameMain extends Game {
  current_prize_sum?: number;
  volatility?: number;
  minBet?: string;
  rtp?: string;
  awarded?: AwardedData;
  /**
   * Absolute thumbnail url served by the backoffice CMS (`coverUrl` on every game of
   * `GET /api/v1/lobbies/*`, `GET /api/v1/categories/{id}` and `POST /api/v1/slots/by-ids`).
   * Null/absent when the CMS has no artwork for the game — callers then fall back to the
   * brand thumbnail CDN via `AssetsService.getGameCoverUrl`.
   */
  coverUrl?: string | null;
}

export interface SubLevel {
  id: number | string;
  parentId?: number;
  name: string;
  gameName: string | null;
  subLevel: SubLevel[];
  gameMains: GameMain[];
  slots?: GameMain[];
  levelType: string;
}

export interface Provider {
  id: number;
  name: string;
  gameCount: number;
  /** Absolute logo url from the CMS (`logoUrl`/`logo_url`); falls back to `cmsAssetsBaseUrl`. */
  logoUrl?: string | null;
  /** CMS slug, used as the logo file name in the `cmsAssetsBaseUrl` fallback. */
  slug?: string | null;
}

export interface GameCategory {
  id: number | undefined;
  gameCount?: number;
  name: string;
  type?: string;
  slug?: string;
  parentId: number | null;
  categoryTypeId: number;
}

export interface LobbySection {
  id: number | string;
  title: string;
  order: number;
  type: string;
  games?: GameMain[];
  gameMains?: GameMain[];
  gameCount?: number;
  data?: any;
  metadata?: {
    categoryId?: number | string;
    type?: string;
    [key: string]: any;
  };
}

export interface LobbyResponse {
  status?: 'active' | 'inactive' | 'maintenance';
  message?: string;
  sections: LobbySection[];
}
