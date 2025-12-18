import { Routes } from '@angular/router';

import { staticFilePaths } from './help-pages/static-file-paths';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export const routes: Routes = [
  {
    path: 'contact',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.Contact,
      title: marker('Contact'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'customer-support',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.CustomerSupport,
      title: marker('Customer support'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'technical-support',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.TechnicalSupport,
      title: marker('Technical support'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'sportsbook-annex',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.SportsbookAnnex1,
      title: marker('Annex 1 - Sportsbook'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.PrivacyPolicy,
      title: marker('Privacy policy'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'aml-policy',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.AML,
      title: marker('AML Policy'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'rgl',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.RGL,
      title: marker('Responsible Gaming'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'terms-and-conditions',
    loadComponent: () =>
      import('./help-pages/help-pages-loader/help-pages-loader.component').then((m) => m.HelpPagesLoaderComponent),
    data: {
      staticHtmlPath: staticFilePaths.TermsAndConditions,
      title: marker('Terms and conditions'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
];
