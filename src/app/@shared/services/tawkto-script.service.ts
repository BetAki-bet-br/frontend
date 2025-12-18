import { Injectable, inject } from '@angular/core';
import { ConfigurationService } from '@app/@core/configuration.service';
import { CredentialsService } from '@app/auth';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TawkToScriptService {
  private credentialsService = inject(CredentialsService);
  private configurationService = inject(ConfigurationService);

  private readySubject = new BehaviorSubject<boolean>(false);
  public readonly isReady$: Observable<boolean> = this.readySubject.asObservable();

  constructor() {
    this.checkIfTawkReady();
  }

  private get tawkApi(): TawkAPI | undefined {
    return (window as any).Tawk_API;
  }

  maximize() {
    this.tawkApi?.maximize();
  }

  minimize() {
    this.tawkApi?.minimize();
  }

  showWidget() {
    this.tawkApi?.showWidget();
  }

  hideWidget() {
    this.tawkApi?.hideWidget();
  }

  endChat() {
    this.tawkApi?.endChat();
  }

  setCredentials(email: string, name: string) {
    this.tawkApi?.setAttributes(
      {
        name: name?.length > 0 ? name : 'Convidado',
        email: email?.length > 0 ? email : 'Convidado@tawk.to',
      },
      (error: string | undefined) => {
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
      if (this.tawkApi) {
        this.tawkApi.hideWidget();
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
