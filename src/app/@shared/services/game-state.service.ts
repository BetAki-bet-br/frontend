// Create game-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private _isLive = new BehaviorSubject<boolean>(false);

  setIsLive(isLive: boolean): void {
    this._isLive.next(isLive);
  }

  getIsLive(): boolean {
    return this._isLive.value;
  }

  get isLive$() {
    return this._isLive.asObservable();
  }
}
