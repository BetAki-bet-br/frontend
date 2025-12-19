import { Routes } from '@angular/router';
import { categoryResolver } from './games-list-by-category-page/category.resolver';
import { GamesListByCategoryPage } from './games-list-by-category-page/games-list-by-category-page';
import { gameListCategoriesResolver } from './games-list-page/game-list-categories.resolver';
import { gamesResolver } from './games-list-page/games.resolver';
import { GamesListPage } from './games-list-page/games-list-page';
import { providersResolver } from './games-list-page/providers.resolver';
import { recentGamesResolver } from './games-list-page/recent-games.resolver';
import { liveCategoryResolver } from './live-games-list-by-category-page/live-category.resolver';
import { LiveGamesListByCategoryPage } from './live-games-list-by-category-page/live-games-list-by-category-page';
import { liveGameListCategoriesResolver } from './live-games-list-page/live-game-list-categories.resolver';
import { liveGamesResolver } from './live-games-list-page/live-games.resolver';
import { LiveGamesListPage } from './live-games-list-page/live-games-list-page';
import { liveProvidersResolver } from './live-games-list-page/live-providers.resolver';
import { liveRecentGamesResolver } from './live-games-list-page/live-recent-games.resolver';
import { AllProvidersPage } from './all-providers-page/all-providers-page';
import { providerListGamesResolver } from './games-list-by-provider-page/provider-list-games.resolver';
import { GamesListByProviderPage } from './games-list-by-provider-page/games-list-by-provider-page';
import { SearchPage } from '../search-page/search-page';
import { LiveSearchPage } from '../live-search-page/live-search-page';

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
  },
  {
    path: 'search',
    component: SearchPage,
    title: 'Pesquisa de jogos - Bet Aki',
  },
  {
    path: 'category/recent',
    component: GamesListByCategoryPage,
    resolve: { category: recentGamesResolver },
    title: 'Jogos Recentes - Bet Aki',
  },
  {
    path: 'category/providers',
    component: AllProvidersPage,
    title: 'Todos os Provedores - Bet Aki',
  },
  {
    path: 'category/:id',
    component: GamesListByCategoryPage,
    resolve: { category: categoryResolver },
    title: 'Cassino por Categoria - Bet Aki',
  },
  {
    path: 'provider/:id',
    component: GamesListByProviderPage,
    title: 'Jogos por Provedor - Bet Aki',
    resolve: { provider: providerListGamesResolver },
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
  },
  {
    path: 'live/search',
    component: LiveSearchPage,
    title: 'Pesquisa de jogos - Bet Aki',
  },
  {
    path: 'live/category/recent',
    component: LiveGamesListByCategoryPage,
    title: 'Jogos Recentes - Bet Aki',
    resolve: { category: liveRecentGamesResolver },
  },
  {
    path: 'live/provider/:id',
    component: GamesListByProviderPage,
    title: 'Jogos por Provedor Ao Vivo - Bet Aki',
    resolve: { provider: providerListGamesResolver },
  },
  {
    path: 'live/category/providers',
    component: AllProvidersPage,
    title: 'Todos os Provedores Ao Vivo - Bet Aki',
    data: { levelId: 520 },
  },
  {
    path: 'live/category/:id',
    component: LiveGamesListByCategoryPage,
    title: 'Cassino ao Vivo por Categoria - Bet Aki',
    resolve: { category: liveCategoryResolver },
  },
];
