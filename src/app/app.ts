import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@layout/header/header';
import { Footer } from '@layout/footer/footer';
import { Loading } from '@shared/loading/loading';
import { LoadingService } from '@shared/loading/loading.service';
import { SidebarMobile } from './layout/sidebar-mobile/sidebar-mobile';
import { MobileMenu } from './layout/mobile-menu/mobile-menu';
import { RoutingService } from './core/services/routing.service';
import { LegitimuzScriptLoaderService } from './core/services/legitimuz-script-loader';
import { ProcessVerificationModalComponent } from '@shared/process-verification-modal/process-verification-modal';
import { ModalService } from './core/services/modal.service';
import { KycVerificationModal } from '@shared/kyc-verification-modal/kyc-verification-modal';
import { CookieConsentModal } from '@shared/cookie-consent-modal/cookie-consent-modal';

import { AgeVerificationModal } from '@shared/age-verification-modal/age-verification-modal';
import { AgeVerificationService } from './core/services/age-verification.service';
import { LoginFaceAuthModal } from './shared/login-face-auth-modal/kyc-verification-modal';
import { CookieService } from 'ngx-cookie-service';
import { GhostColorLayer } from './features/games-page/components/ghost-color-layer/ghost-color-layer';

import { InlineLoading } from '@shared/inline-loading/inline-loading';
import { Tawk } from '@shared/tawk/tawk';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    Loading,
    MobileMenu,
    SidebarMobile,
    ProcessVerificationModalComponent,
    KycVerificationModal,
    CookieConsentModal,
    AgeVerificationModal,
    LoginFaceAuthModal,
    GhostColorLayer,
    Tawk,
    InlineLoading,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  loadingService: LoadingService = inject(LoadingService);
  routingService: RoutingService = inject(RoutingService);
  legitimuzScriptLoaderService = inject(LegitimuzScriptLoaderService);
  modalService = inject(ModalService);
  cookieService = inject(CookieService);
  ageVerificationService = inject(AgeVerificationService);

  isProcessVerificationModalOpen = this.modalService.isModalOpen('processVerification');
  isKycVerificationModalOpen = this.modalService.isModalOpen('kycVerification');
  isLoginFaceAuthModalOpen = this.modalService.isModalOpen('loginFaceAuth');

  constructor() {
    this.legitimuzScriptLoaderService.loadGeolocSdk();
    this.legitimuzScriptLoaderService.loadOcrSdk();

    if (!this.cookieService.get('cookie-consent')) {
      this.modalService.open('cookie-consent');
    }
    if (!this.ageVerificationService.isVerified()) {
      this.modalService.open('age-verification');
    }
  }

  closeModal() {
    this.modalService.close('processVerification');
  }

  closeKycVerificationModal() {
    this.modalService.close('kycVerification');
  }

  closeLoginFaceAuthModal() {
    this.modalService.close('loginFaceAuth');
  }
}
