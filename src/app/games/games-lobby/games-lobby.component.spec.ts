import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesLobbyComponent } from './games-lobby.component';
import { TranslateModule } from '@ngx-translate/core';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { HttpBackend } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

describe('GamesLobbyComponent', () => {
  let component: GamesLobbyComponent;
  let fixture: ComponentFixture<GamesLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GamesLobbyComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: ProdGameService, useValue: {} }, HttpBackend, { provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(GamesLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
