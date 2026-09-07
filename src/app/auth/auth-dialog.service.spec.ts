import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { ProcessVerificationResultEnum } from '@app/@shared/components/process-verification-dialog/process-verification-dialog.component';
import { PlayerProfileService } from '@app/player-profile/player-profile.service';
import { of } from 'rxjs';
import { AuthDialogService } from './auth-dialog.service';

/**
 * O critério do ticket nulo, do lado do diálogo de verificação.
 *
 * A porta diz que `startReverification` pode responder `null` ("the gateway had nothing for the
 * player to do"), e é o que o adapter de demo responde. Isso é sucesso, não falha. O que continua
 * sendo `false` é um ramo que não chamou porta nenhuma.
 */
describe('AuthDialogService, reverificação sem ticket', () => {
  function setUp(dialogResult: ProcessVerificationResultEnum | null, ticket: null = null) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PlayerProfileService,
          useValue: {
            playerReverification: () => of(ticket),
            getPlayerVerificationStatus: () => of({ calculatedStatus: true }),
            verifyPlayerContactInfo: () => of(undefined),
          },
        },
        { provide: Dialog, useValue: { open: () => ({ closed: of(dialogResult) }) } },
      ],
    });

    return TestBed.inject(AuthDialogService);
  }

  it('conclui o registro quando o gateway não pede biometria', (done) => {
    setUp(null)
      .initRegistrationVerification()
      .subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
  });

  it('conclui o KYC do diálogo quando o gateway não pede biometria', (done) => {
    setUp(ProcessVerificationResultEnum.KYC)
      .initProcessVerificationDialog(false)
      .subscribe((result) => {
        expect(result).toBeTrue();
        done();
      });
  });

  it('não dá sucesso quando o jogador fecha o diálogo sem escolher nada', (done) => {
    setUp(null)
      .initProcessVerificationDialog(false)
      .subscribe((result) => {
        expect(result).toBeFalse();
        done();
      });
  });
});
