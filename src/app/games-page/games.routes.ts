import { Routes } from '@angular/router';
import { allProvidersResolver } from '@app/games-page/all-providers-page/all-providers.resolver';
import { AllProvidersPage } from '@app/games-page/all-providers-page/all-providers-page';
import { categoryResolver } from '@app/games-page/games-list-by-category-page/category.resolver';
import { GamesListByCategoryPage } from '@app/games-page/games-list-by-category-page/games-list-by-category-page';
import { GamesListByProviderPage } from '@app/games-page/games-list-by-provider-page/games-list-by-provider-page';
import { providerListGamesResolver } from '@app/games-page/games-list-by-provider-page/provider-list-games.resolver';
import { gameListCategoriesResolver } from '@app/games-page/games-list-page/game-list-categories.resolver';
import { casinoLobbyResolver } from '@app/games-page/games-list-page/casino-lobby.resolver';
import { GamesListPage } from '@app/games-page/games-list-page/games-list-page';
import { gamesResolver } from '@app/games-page/games-list-page/games.resolver';
import { providersResolver } from '@app/games-page/games-list-page/providers.resolver';
import { recentGamesResolver } from '@app/games-page/games-list-page/recent-games.resolver';
import { liveCategoryResolver } from '@app/games-page/live-games-list-by-category-page/live-category.resolver';
import { liveGameListCategoriesResolver } from '@app/games-page/live-games-list-page/live-game-list-categories.resolver';
import { liveLobbyResolver } from '@app/games-page/live-games-list-page/live-lobby.resolver';
import { liveProvidersResolver } from '@app/games-page/live-games-list-page/live-providers.resolver';
import { searchPlaceholderResolver } from './search/search-page/search-placeholder.resolver';
import { liveSearchPlaceholderResolver } from './search/live-search-page/live-search-placeholder.resolver';
import { GamesPage } from './games-page';

export const GAMES_ROUTES: Routes = [
  {
    path: '', // URL: /games
    component: GamesListPage,
    title: 'Cassino - Bet Aki',
    resolve: {
      categories: gameListCategoriesResolver,
      providers: providersResolver,
      lobby: casinoLobbyResolver,
      recent: recentGamesResolver,
    },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search-page/search-page').then((m) => m.SearchPage),
    title: 'Pesquisa de jogos - Bet Aki',
    resolve: { placeholder: searchPlaceholderResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'category/recent',
    loadComponent: () =>
      import('./games-list-by-category-page/games-list-by-category-page').then((m) => m.GamesListByCategoryPage),
    resolve: { category: recentGamesResolver },
    title: 'Jogos Recentes - Bet Aki',
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'category/providers',
    loadComponent: () => import('./all-providers-page/all-providers-page').then((m) => m.AllProvidersPage),
    title: 'Todos os Provedores - Bet Aki',
    resolve: { providers: allProvidersResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'category/:id',
    loadComponent: () =>
      import('./games-list-by-category-page/games-list-by-category-page').then((m) => m.GamesListByCategoryPage),
    resolve: { category: categoryResolver },
    title: 'Cassino por Categoria - Bet Aki',
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'provider/:id',
    loadComponent: () =>
      import('./games-list-by-provider-page/games-list-by-provider-page').then((m) => m.GamesListByProviderPage),
    title: 'Jogos por Provedor - Bet Aki',
    resolve: { provider: providerListGamesResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live',
    loadComponent: () => import('./live-games-list-page/live-games-list-page').then((m) => m.LiveGamesListPage),
    title: 'Cassino ao Vivo - Bet Aki',
    resolve: {
      categories: liveGameListCategoriesResolver,
      providers: liveProvidersResolver,
      lobby: liveLobbyResolver,
      recent: recentGamesResolver,
    },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/search',
    loadComponent: () => import('./search/live-search-page/live-search-page').then((m) => m.LiveSearchPage),
    title: 'Pesquisa de jogos - Bet Aki',
    resolve: { placeholder: liveSearchPlaceholderResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/recent',
    loadComponent: () =>
      import('./live-games-list-by-category-page/live-games-list-by-category-page').then(
        (m) => m.LiveGamesListByCategoryPage,
      ),
    title: 'Jogos Recentes - Bet Aki',
    resolve: { category: recentGamesResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/provider/:id',
    component: GamesListByProviderPage,
    title: 'Jogos por Provedor Ao Vivo - Bet Aki',
    resolve: { provider: providerListGamesResolver },
    data: {
      levelId: 520,
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/providers',
    component: AllProvidersPage,
    title: 'Todos os Provedores Ao Vivo - Bet Aki',
    resolve: { providers: allProvidersResolver },
    data: {
      levelId: 520,
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/:id',
    loadComponent: () =>
      import('./live-games-list-by-category-page/live-games-list-by-category-page').then(
        (m) => m.LiveGamesListByCategoryPage,
      ),
    title: 'Cassino ao Vivo por Categoria - Bet Aki',
    resolve: { category: liveCategoryResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
];

export const GAMES_ROOT_ROUTES: Routes = [
  {
    path: '',
    component: GamesPage,
    title: 'Cassino - Bet Aki',
    children: GAMES_ROUTES,
  },
];
