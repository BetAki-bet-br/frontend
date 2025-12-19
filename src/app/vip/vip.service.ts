import { Injectable } from '@angular/core';
import { VipProgram } from '@app/@shared/models';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VipService {
  constructor() {}

  getAllVipPrograms(): Observable<VipProgram[]> {
    return of([
      {
        id: 1,
        name: 'Bronze',
        min: 200,
        max: 499,
        prizeAmount: 10,
        wager: 5,
        freeSpinsPrize: 20,
      },
      {
        id: 2,
        name: 'Silver',
        min: 500,
        max: 4999,
        percentageAmount: 0.05,
        wager: 5,
        freeSpinsPrize: 50,
      },
      {
        id: 3,
        name: 'Gold',
        min: 5000,
        max: 9999,
        percentageAmount: 0.07,
        wager: 5,
        freeSpinsPrize: 100,
      },
      {
        id: 4,
        name: 'Platinum',
        min: 10000,
        max: 19999,
        percentageAmount: 0.1,
        wager: 5,
        freeSpinsPrize: 150,
      },
      {
        id: 5,
        name: 'Diamond',
        min: 20000,
        max: 29999,
        percentageAmount: 0.12,
        wager: 5,
        freeSpinsPrize: 200,
      },
      /* {
        id: 6,
        name: 'All Star',
        min: 30000,
        max: 39999,
        percentageAmount: 0.15,
        wager: 5,
        freeSpinsPrize: 250,
      },
      {
        id: 7,
        name: 'High Roller',
        min: 40000,
        max: 49999,
        percentageAmount: 0.18,
        wager: 5,
        freeSpinsPrize: 300,
      },
      {
        id: 8,
        name: 'Hall of Fame',
        min: 50000,
        percentageAmount: 0.2,
        wager: 5,
        freeSpinsPrize: 350,
      }, */
    ]);
  }
}
