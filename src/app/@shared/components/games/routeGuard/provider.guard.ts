import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { GamesService } from '@app/@shared/services/games/games.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProviderGuard implements CanActivate {
  private router = inject(Router);
  private gamesService = inject(GamesService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return of(true); // Allow access to the route

    // TODO: Remove file as this guard is not used.

    // const providerList = this.gamesService.providerList;
    // const lastParam = route.url[route.url.length - 1].path;
    // const isProviderValid = providerList.includes(lastParam);

    // if (isProviderValid) {
    //   return of(true); // Allow access to the route
    // } else {
    //   this.router.navigate(['/games']); // Redirect to the '/games' route
    //   return of(false); // Block access to the route
    // }
  }
}
