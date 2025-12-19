import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpPagesLoaderComponent } from './help-pages/help-pages-loader/help-pages-loader.component';
import { staticFilePaths } from './help-pages/static-file-paths';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

const routes: Routes = [
  {
    path: 'contact',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.Contact,
      title: marker('Contact'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'customer-support',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.CustomerSupport,
      title: marker('Customer support'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'technical-support',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.TechnicalSupport,
      title: marker('Technical support'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'sportsbook-annex',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.SportsbookAnnex1,
      title: marker('Annex 1 - Sportsbook'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'privacy-policy',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.PrivacyPolicy,
      title: marker('Privacy policy'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'aml-policy',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.AML,
      title: marker('AML Policy'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'rgl',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.RGL,
      title: marker('Responsible Gaming'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
  {
    path: 'terms-and-conditions',
    component: HelpPagesLoaderComponent,
    data: {
      staticHtmlPath: staticFilePaths.TermsAndConditions,
      title: marker('Terms and conditions'),
      robots: ['index', 'follow'],
      customClassName: 'html-assets',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule {}
