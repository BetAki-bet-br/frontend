import { Injectable } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { CredentialsService } from '@app/auth';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

declare const Tawk_API: any;

@Injectable({
  providedIn: 'root',
})
export class TawkToScriptService {
  private readySubject = new BehaviorSubject<boolean>(false);
  public readonly isReady$: Observable<boolean> = this.readySubject.asObservable();

  constructor(private credentialsService: CredentialsService, private configurationService: ConfigurationService) {
    this.checkIfTawkReady();
  }

  maximize() {
    if (Tawk_API) {
      Tawk_API.maximize();
    }
  }

  minimize() {
    if (Tawk_API) {
      Tawk_API.minimize();
    }
  }

  showWidget() {
    if (Tawk_API) {
      Tawk_API.showWidget();
    }
  }

  hideWidget() {
    if (Tawk_API) {
      Tawk_API.hideWidget();
    }
  }

  endChat() {
    if (Tawk_API) {
      Tawk_API.endChat();
    }
  }

  setCredentials(email: string, name: string) {
    Tawk_API.setAttributes(
      {
        name: name?.length > 0 ? name : 'Convidado',
        email: email?.length > 0 ? email : 'Convidado@tawk.to',
      },
      (error: any) => {
        if (error) {
          console.error('Tawk setAttributes error:', error);
          if (error === 'INVALID_EMAIL') {
            console.error('Invalid email address:', email);
          }
        } else {
          console.log('Visitor attributes set successfully.');
        }
      }
    );
  }

  private checkIfTawkReady() {
    const interval = setInterval(() => {
      if (window['Tawk_API']) {
        Tawk_API.hideWidget();

        this.readySubject.next(true);
        clearInterval(interval);
        this.checkCredentials();
      }
    }, 200);
  }

  private checkCredentials() {
    this.credentialsService.isAuthenticated$
      .pipe(
        switchMap((res) => {
          if (res) {
            return this.configurationService.getPlayerInfo(true);
          }
          return of(null);
        })
      )
      .subscribe((res) => {
        this.setCredentials(res?.eMail ?? '', res?.firstName ?? '');
      });
  }
}
