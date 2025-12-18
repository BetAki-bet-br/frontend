import { Routes } from '@angular/router';
import { AllProvidersPage } from '@app/games-page/all-providers-page/all-providers-page';
import { categoryResolver } from '@app/games-page/games-list-by-category-page/category.resolver';
import { GamesListByCategoryPage } from '@app/games-page/games-list-by-category-page/games-list-by-category-page';
import { GamesListByProviderPage } from '@app/games-page/games-list-by-provider-page/games-list-by-provider-page';
import { providerListGamesResolver } from '@app/games-page/games-list-by-provider-page/provider-list-games.resolver';
import { gameListCategoriesResolver } from '@app/games-page/games-list-page/game-list-categories.resolver';
import { GamesListPage } from '@app/games-page/games-list-page/games-list-page';
import { gamesResolver } from '@app/games-page/games-list-page/games.resolver';
import { providersResolver } from '@app/games-page/games-list-page/providers.resolver';
import { recentGamesResolver } from '@app/games-page/games-list-page/recent-games.resolver';
import { liveCategoryResolver } from '@app/games-page/live-games-list-by-category-page/live-category.resolver';
import { LiveGamesListByCategoryPage } from '@app/games-page/live-games-list-by-category-page/live-games-list-by-category-page';
import { liveGameListCategoriesResolver } from '@app/games-page/live-games-list-page/live-game-list-categories.resolver';
import { LiveGamesListPage } from '@app/games-page/live-games-list-page/live-games-list-page';
import { liveGamesResolver } from '@app/games-page/live-games-list-page/live-games.resolver';
import { liveProvidersResolver } from '@app/games-page/live-games-list-page/live-providers.resolver';
import { liveRecentGamesResolver } from '@app/games-page/live-games-list-page/live-recent-games.resolver';
import { LiveSearchPage } from './search/live-search-page/live-search-page';
import { SearchPage } from './search/search-page/search-page';

export const GAMES_ROUTES: Routes = [
  {
    path: '', // URL: /games
    component: GamesListPage,
    title: 'Cassino - Bet Aki',
    resolve: {
      games: gamesResolver,
      categories: gameListCategoriesResolver,
      providers: providersResolver,
    },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'search',
    component: SearchPage,
    title: 'Pesquisa de jogos - Bet Aki',
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'category/recent',
    component: GamesListByCategoryPage,
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
    component: AllProvidersPage,
    title: 'Todos os Provedores - Bet Aki',
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'category/:id',
    component: GamesListByCategoryPage,
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
    component: GamesListByProviderPage,
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
    component: LiveGamesListPage,
    title: 'Cassino ao Vivo - Bet Aki',
    resolve: {
      games: liveGamesResolver,
      categories: liveGameListCategoriesResolver,
      providers: liveProvidersResolver,
    },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/search',
    component: LiveSearchPage,
    title: 'Pesquisa de jogos - Bet Aki',
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/recent',
    component: LiveGamesListByCategoryPage,
    title: 'Jogos Recentes - Bet Aki',
    resolve: { category: liveRecentGamesResolver },
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
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/providers',
    component: AllProvidersPage,
    title: 'Todos os Provedores Ao Vivo - Bet Aki',
    data: {
      levelId: 520,
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
  {
    path: 'live/category/:id',
    component: LiveGamesListByCategoryPage,
    title: 'Cassino ao Vivo por Categoria - Bet Aki',
    resolve: { category: liveCategoryResolver },
    data: {
      robots: ['index', 'follow'],
      title: 'Cassino - Roleta, caça-níqueis, cartas e muito mais! ',
      description: 'Aposte no cassino da BetAki com super bônus.',
    },
  },
];
