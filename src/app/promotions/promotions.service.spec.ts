import { TestBed } from '@angular/core/testing';

import { PromotionsService } from './promotions.service';
import {
  BannerService,
  BonusService,
  ProdGameService,
  PromotionService,
  PromotionStatusEnum,
} from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { RenderTemplatePipe } from '@app/@pipes/render-template.pipe';
import { EllipsisPipe } from '@app/@pipes/ellipsis.pipe';
import { ActivatedRoute } from '@angular/router';
import { MockTemplateService } from '@app/@shared/services/template.service.mock';
import { TemplateService } from '@app/@shared/services/template.service';
import { HttpBackend } from '@angular/common/http';

describe('PromotionsService', () => {
  let service: PromotionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: BonusService, useClass: MockCtgApiService },
        { provide: PromotionService, useClass: MockCtgApiService },
        { provide: ProdGameService, useClass: MockCtgApiService },
        { provide: BannerService, useClass: MockCtgApiService },
        RenderTemplatePipe,
        EllipsisPipe,
        { provide: ActivatedRoute, useValue: {} },
        { provide: TemplateService, useClass: MockTemplateService },
        HttpBackend,
      ],
    });
    service = TestBed.inject(PromotionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return First Deposit Promotion', () => {
    const promotions: any[] = [
      {
        promotionFriendlyName: 'oldest',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2000, 1, 1),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'mid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2002, 1, 1),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'mid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2001, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'latest',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2010, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.OptedOut,
        promotionActivationDate: new Date(2012, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2012, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'NA',
          },
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2012, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
          {
            type: 'Level',
            content: '99',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2012, 1, 1),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'NA',
          },
          {
            type: 'Level',
            content: '99',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2012, 1, 1).toISOString(),
        customContentList: [
          {
            type: 'PromotionGroup',
            content: 'DepositBonus',
          },
        ],
      },
      {
        promotionFriendlyName: 'invalid',
        promotionStatus: PromotionStatusEnum.NotYetOptedin,
        promotionActivationDate: new Date(2012, 1, 1),
        customContentList: [
          {
            type: 'Level',
            content: '1',
          },
        ],
      },
    ];

    const result = service.findFirstDepositPromotion(promotions);

    expect(result?.promotionFriendlyName).toBe('latest');
  });
});
