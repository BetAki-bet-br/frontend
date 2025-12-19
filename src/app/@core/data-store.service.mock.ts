import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MockDataStoreService {
  setPlayerInfoInMemoryPending(isPending: boolean): void {}
}
