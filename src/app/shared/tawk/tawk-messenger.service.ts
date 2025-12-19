import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TawkMessengerService {
  private tawkApiReady = new ReplaySubject<void>(1);
  tawkApiReady$ = this.tawkApiReady.asObservable();

  constructor() {
    const w = window as Window;
    w.Tawk_API = w.Tawk_API || {
      maximize: () => {
        console.log('Tawk_API maximize called');
      },
      onLoad: () => {
        this.tawkApiReady.next();
        this.tawkApiReady.complete();
      },
    };
  }

  openChat(): void {
    this.tawkApiReady$.subscribe(() => {
      window.Tawk_API?.maximize();
    });
  }
}
