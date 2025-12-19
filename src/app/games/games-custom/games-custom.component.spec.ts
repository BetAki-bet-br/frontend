import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesCustomComponent } from './games-custom.component';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TranslateModule } from '@ngx-translate/core';
import { HttpBackend } from '@angular/common/http';

describe('GamesCustomComponent', () => {
  let component: GamesCustomComponent;
  let fixture: ComponentFixture<GamesCustomComponent>;

  beforeEach(async () => {
    const paramMap: ParamMap = convertToParamMap({ provider: 'example-provider' });
    const activatedRouteStub = {
      params: of(paramMap),
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), GamesCustomComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ProdGameService, useValue: {} },
        HttpBackend,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GamesCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
