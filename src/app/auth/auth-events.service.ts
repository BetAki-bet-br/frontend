import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum AuthEvent {
  Login = 'login',
  Logout = 'logout',
}

@Injectable({
  providedIn: 'root',
})
export class AuthEventsService {
  private authEventsSubject = new Subject<AuthEvent>();
  authEvents$ = this.authEventsSubject.asObservable();

  emitEvent(event: AuthEvent): void {
    this.authEventsSubject.next(event);
  }
}
