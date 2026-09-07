import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LimitType } from '@app/@core/gateway';
import { SnackbarService } from '@app/@core/snackbar.service';
import { ConfigurationService } from '@app/@core/configuration.service';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { of } from 'rxjs';
import { ResponsibleGamblingComponent } from './responsible-gambling.component';

/**
 * A autoexclusão do backend da casa responde 204, então o ticket de biometria chega `null`. A porta
 * chama isso de "não precisa de biometria" e a conta já está barrada quando a resposta volta: a tela
 * tem que comemorar, não ficar muda.
 */
describe('ResponsibleGamblingComponent, autoexclusão sem ticket', () => {
  let fixture: ComponentFixture<ResponsibleGamblingComponent>;
  let selfExclusion: jasmine.Spy;
  let success: jasmine.Spy;
  let error: jasmine.Spy;

  beforeEach(() => {
    selfExclusion = jasmine.createSpy('playerSelfExclusion').and.returnValue(of(null));
    success = jasmine.createSpy('openCustomSuccess');
    error = jasmine.createSpy('openCustomError');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: PlayerProfileService,
          useValue: {
            playerSelfExclusion: selfExclusion,
            getPlayerLimits: () => of([]),
          },
        },
        { provide: ConfigurationService, useValue: { getPlayerInfo: () => of(null) } },
        { provide: SnackbarService, useValue: { openCustomSuccess: success, openCustomError: error } },
      ],
    });

    fixture = TestBed.createComponent(ResponsibleGamblingComponent);
    fixture.detectChanges();
  });

  it('trata o ticket nulo como sucesso', () => {
    fixture.componentInstance.setSelfExclusion({ limitType: LimitType.SiteSessionDuration, amountValue: 3 });

    expect(selfExclusion).toHaveBeenCalled();
    expect(success).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
