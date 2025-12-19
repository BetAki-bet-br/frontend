import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ModalService } from '@/app/core/services/modal.service';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-cookie-consent-modal',
  templateUrl: './cookie-consent-modal.html',
  styleUrls: ['./cookie-consent-modal.scss'],
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentModal {
  private readonly modalService = inject(ModalService);
  private readonly cookieService = inject(CookieService);

  isOpen = this.modalService.isModalOpen('cookie-consent');

  accept(): void {
    this.cookieService.set('cookie-consent', 'true');
    this.close();
  }

  deny(): void {
    this.cookieService.set('cookie-consent', 'false');
    this.close();
  }

  close(): void {
    this.modalService.close('cookie-consent');
  }
}
