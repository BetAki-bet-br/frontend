import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '@app/material.module';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientJsonpModule } from '@angular/common/http';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PipesModule } from '@app/@pipes/pipes.module';
import { SwiperModule } from 'swiper/angular';
import { AdblockerDialogComponent } from '../auth/login/adblocker-dialog/adblocker-dialog.component';
import { BaseDialogComponent } from './components/base-dialog/base-dialog.component';
import { BaseTableComponent } from './components/base-table/base-table.component';
import { BaseTableMsgsComponent } from './components/base-table-msgs/base-table-msgs.component';
import { BasicPageContainerComponent } from './components/basic-page-container/basic-page-container.component';
import { FaceAuthenticatorDialogComponent } from './components/face-authenticator-dialog/face-authenticator-dialog.component';
import { CategoryCardComponent } from './components/category-card/category-card.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CustomSnackbarComponent } from './components/custom-snackbar/custom-snackbar.component';
import { DepositDialogComponent } from './components/deposit-dialog/deposit-dialog.component';
import { FileUploadComponent } from './components/file-uploader/file-upload.component';
import { FileUploadDirective } from './components/file-uploader/file-upload.directive';
import { FillPlayerInfoDialogComponent } from './components/fill-player-info-dialog/fill-player-info-dialog.component';
import { GameSearchComponent } from './components/game-search/game-search.component';
import { GameFiltersProvidersDrawerComponent } from './components/games/game-filters-providers/game-filters-providers.component';
import { GameFiltersComponent } from './components/games/game-filters/game-filters.component';
import { GameCardComponent } from './components/games/games/game-card/game-card.component';
import { GameTilesComponent } from './components/games/games/games.component';
import { ProvidersComponent } from './components/games/providers/providers.component';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { MainBannerComponent } from './components/main-banner/main-banner.component';
import { MaintenancePageComponent } from './components/maintenance-page/maintenance-page.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { PageBreadcrumbsComponent } from './components/page-breadcrumbs/page-breadcrumbs.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PasswordStrengthIndicatorComponent } from './components/password-strength-indicator/password-strength-indicator.component';
import { PlayerActivationDialogComponent } from './components/player-activation-dialog/player-activation-dialog.component';
import { ProcessVerificationDialogComponent } from './components/process-verification-dialog/process-verification-dialog.component';
import { ComponentLoaderDirective } from './components/utils/component-loader.directive';
import { WelcomeMessageComponent } from './components/welcome-message/welcome-message.component';
import { CasinoWinsComponent } from './components/winners-section/casino-wins/casino-wins.component';
import { WinnersPromoBlockComponent } from './components/winners-section/winners-promo-block/winners-promo-block.component';
import { WinnersSectionComponent } from './components/winners-section/winners-section.component';
import { MatTabScrollToCenterDirective } from './directives/mat-tab-scroll-to-center.directive';
import { MatchAnyRouterLinkDirective } from './directives/route-match.directive';
import { LoaderComponent } from './loader/loader.component';
import { PopupMessageDialogComponent } from './components/popup-message-dialog/popup-message-dialog.component';
import { AnnualVerificationDialogComponent } from './components/annual-verification-dialog/annual-verification-dialog.component';
import { WithdrawalDialogComponent } from './components/withdrawal-dialog/withdrawal-dialog.component';
import { WithdrawalAuthenticationDialogComponent } from './components/withdrawal-authentication-dialog/withdrawal-authentication-dialog.component';
import { DateAutoFormatDirective } from './directives/date-input.directive';
import { TrimInputDirective } from './directives/white-space-input.directive';
import { AccessRestrictedDialogComponent } from './components/access-restricted-dialog/access-restricted-dialog.component';

@NgModule({
  declarations: [
    MainBannerComponent,
    ComponentLoaderDirective,
    WinnersSectionComponent,
    WinnersPromoBlockComponent,
    GameTilesComponent,
    BaseDialogComponent,
    LoaderComponent,
    GlobalSearchComponent,
    BasicPageContainerComponent,
    CustomSnackbarComponent,
    DepositDialogComponent,
    GameFiltersComponent,
    MatchAnyRouterLinkDirective,
    PageNotFoundComponent,
    BaseTableComponent,
    BaseTableMsgsComponent,
    PasswordStrengthIndicatorComponent,
    MessageDialogComponent,
    FileUploadComponent,
    FileUploadDirective,
    GameCardComponent,
    ConfirmationDialogComponent,
    GameFiltersProvidersDrawerComponent,
    WelcomeMessageComponent,
    MatTabScrollToCenterDirective,
    FillPlayerInfoDialogComponent,
    PlayerActivationDialogComponent,
    FaceAuthenticatorDialogComponent,
    CategoryCardComponent,
    CasinoWinsComponent,
    GameSearchComponent,
    MaintenancePageComponent,
    AdblockerDialogComponent,
    ProcessVerificationDialogComponent,
    PageBreadcrumbsComponent,
    ProvidersComponent,
    PopupMessageDialogComponent,
    AnnualVerificationDialogComponent,
    WithdrawalDialogComponent,
    WithdrawalAuthenticationDialogComponent,
    DateAutoFormatDirective,
    TrimInputDirective,
    AccessRestrictedDialogComponent,
  ],
  exports: [
    ComponentLoaderDirective,
    MainBannerComponent,
    GameTilesComponent,
    BaseDialogComponent,
    LoaderComponent,
    WinnersSectionComponent,
    WinnersPromoBlockComponent,
    GlobalSearchComponent,
    BasicPageContainerComponent,
    CustomSnackbarComponent,
    GameFiltersComponent,
    BaseTableComponent,
    BaseTableMsgsComponent,
    PasswordStrengthIndicatorComponent,
    ReactiveFormsModule,
    FormsModule,
    FileUploadComponent,
    GameCardComponent,
    PipesModule,
    WelcomeMessageComponent,
    NgOptimizedImage,
    MatTabScrollToCenterDirective,
    CategoryCardComponent,
    GameSearchComponent,
    ProcessVerificationDialogComponent,
    PageBreadcrumbsComponent,
    ProvidersComponent,
    WithdrawalDialogComponent,
    WithdrawalAuthenticationDialogComponent,
    DateAutoFormatDirective,
    TrimInputDirective,
  ],
  imports: [
    MaterialModule,
    TranslateModule,
    CommonModule,
    SwiperModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
    PipesModule,
    HttpClientJsonpModule,
    ScrollingModule,
  ],
  providers: [MatBottomSheet],
})
export class SharedModule {}
