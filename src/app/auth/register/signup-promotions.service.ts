import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { PROMOTION_LIST } from './promotions-mock-data';
import { Promotion } from '@app/@shared/models';

@Injectable({
  providedIn: 'root',
})
export class SignUpPromotionsService {
  constructor() {}

  getSignupPromotions(): Observable<Promotion[]> {
    return of(PROMOTION_LIST.filter((value) => value.id !== 1));
  }

  getMainSignupPromotion(): Observable<Promotion> {
    return of(PROMOTION_LIST.find((value) => value.id === 1) as Promotion);
  }
}
