import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersSectionComponent } from './winners-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PipesModule } from '@app/@pipes/pipes.module';

describe('WinnersSectionComponent', () => {
  let component: WinnersSectionComponent;
  let fixture: ComponentFixture<WinnersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WinnersSectionComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule, PipesModule],
      providers: [{ provide: ProdGameService, useClass: MockCtgApiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
