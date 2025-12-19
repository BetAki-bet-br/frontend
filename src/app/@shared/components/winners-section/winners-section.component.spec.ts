import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinnersSectionComponent } from './winners-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { MockCtgApiService } from '@app/@shared/http/ctg-api.service.mock';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PipesModule } from '@app/@pipes/pipes.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('WinnersSectionComponent', () => {
  let component: WinnersSectionComponent;
  let fixture: ComponentFixture<WinnersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), PipesModule, WinnersSectionComponent],
      providers: [
        { provide: ProdGameService, useClass: MockCtgApiService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
