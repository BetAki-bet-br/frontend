import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { LobbiesService } from '@app/@core/backoffice';
import { Observable, tap } from 'rxjs';
import { LobbyResponse } from '../models/game.models';
import { MaintenanceDialogComponent } from '@app/@shared/components/maintenance-dialog/maintenance-dialog.component';

export const liveLobbyResolver: ResolveFn<LobbyResponse> = (): Observable<LobbyResponse> => {
  const router = inject(Router);
  const dialog = inject(Dialog);

  return inject(LobbiesService)
    .getLiveLobby()
    .pipe(
      tap((response) => {
        if (response.status === 'inactive') {
          router.navigate(['/games'], { replaceUrl: true });
        } else if (response.status === 'maintenance') {
          dialog.open(MaintenanceDialogComponent, {
            panelClass: 'maintenance-dialog-panel',
          });
          router.navigate(['/games'], { replaceUrl: true });
        }
      }),
    );
};
