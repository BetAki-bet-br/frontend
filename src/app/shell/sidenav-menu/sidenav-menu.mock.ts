import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SideMenuItem } from './sidenav-menu.component';

export const SideNavMenuMockCasino: SideMenuItem[] = [
  {
    label: marker('All Games'),
    link: '/games/all',
    categories: null,
  },
  {
    label: marker('Slots'),
    link: '/games/slots',
    categories: null,
  },
  {
    label: marker('Live'),
    link: '/games/live',
    categories: null,
  },
  {
    label: marker('Recommended'),
    link: '/games/recommended',
    categories: null,
  },
  {
    label: marker('Roulette'),
    link: '/games/roulette',
    categories: null,
  },
  {
    label: marker('Crash'),
    link: '/games/crash',
    categories: null,
  },
  {
    label: marker('Spaceman'),
    link: '/game/ALE-4595',
    categories: null,
  },
];

export const SideNavMenuMockSportsbook: SideMenuItem[] = [
  {
    label: marker('Sportsbook Live'),
    link: '/sportsbook',
    fragment: '/live',
    categories: null,
  },
  {
    label: marker('E-Sports'),
    link: '/sportsbook',
    fragment: '/esports',
    categories: null,
  },

  {
    label: marker('Popular'),
    collapsedLabel: marker('Popular'),
    link: '',
    categories: [
      // {
      //   label: 'Brasiliero Serie A',
      //   link: '/sportsbook#/sport/66/category/593',
      //   categories: null,
      // },
      // {
      //   label: 'Brasiliero Serie B',
      //   link: '/sportsbook#/sport/66/category/593',
      //   categories: null,
      // },
      {
        label: marker('Premiere League'),
        link: '/sportsbook',
        fragment: '/sport/66/category/497/championship/2936/eventType/m',
        categories: null,
      },
      {
        label: marker('FIFA'),
        link: '/sportsbook',
        fragment: '/sport/66/category/549/championship/34186/eventType/m',
        categories: null,
      },
    ],
  },
  {
    label: marker('Top 5 sports'),
    collapsedLabel: marker('Top 5'),
    link: '',
    categories: [
      {
        label: marker('Football'),
        link: '/sportsbook',
        fragment: '/sport/66',
        categories: null,
      },
      {
        label: marker('Basketball'),
        link: '/sportsbook',
        fragment: '/sport/67',
        categories: null,
      },
      {
        label: marker('Tennis'),
        link: '/sportsbook',
        fragment: '/sport/68',
        categories: null,
      },
      {
        label: marker('Voleyball'),
        link: '/sportsbook',
        fragment: '/sport/69',
        categories: null,
      },
      {
        label: marker('E-Sports'),
        link: '/sportsbook',
        fragment: '/esports',
        categories: null,
      },
    ],
  },
];
