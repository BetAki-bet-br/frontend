import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LobbiesService } from '@app/@core/backoffice';
import { Observable, tap } from 'rxjs';
import { LobbyResponse } from '../models/game.models';
import { Dialog } from '@angular/cdk/dialog';
import { MaintenanceDialogComponent } from '@app/@shared/components/maintenance-dialog/maintenance-dialog.component';

export const liveLobbyResolver: ResolveFn<LobbyResponse> = (): Observable<LobbyResponse> => {
  const dialog = inject(Dialog);
  return inject(LobbiesService)
    .getLiveLobby()
    .pipe(
      tap(() => {
        if (dialog.openDialogs.length === 0) {
          dialog.open(MaintenanceDialogComponent);
        }
      }),
    );
};
