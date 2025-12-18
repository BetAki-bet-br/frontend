import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialsService } from './credentials.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private credentialsService: CredentialsService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.body?.hasOwnProperty('sessiontoken')) {
      request.body.sessiontoken = this.credentialsService.credentials?.sessionKey;
    } else if (request.body?.hasOwnProperty('sessionToken')) {
      request.body.sessionToken = this.credentialsService.credentials?.sessionKey;
    }
    return next.handle(request).pipe(map((response) => this.responseHandler(response)));
  }

  private responseHandler(response: HttpEvent<any>): HttpEvent<any> {
    const bodyKey = 'body';
    const errorKey = 'error';

    if (
      response[bodyKey]?.errormessage === 'Session not valid' ||
      response[errorKey]?.errormessage === 'Session not valid'
    ) {
      this.router.navigate(['/login'], {
        state: { unauthorized: true },
        queryParams: { redirect: this.router.url },
      });
      throw { errorMessage: 'Session not valid' };
    }
    return response;
  }
}
