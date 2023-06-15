import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenModel } from './token-model';
import { UserProfile } from './user-profile';

const ALLOWED_ENDPOINTS = ['login', 'refresh', 'signup', 'verify']

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  constructor(
    private jwtHelper: JwtHelperService,
    private authService: AuthService,
    private router: Router
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    for (let allowedEndpoint of ALLOWED_ENDPOINTS) {
      if (req.url.indexOf(allowedEndpoint) > -1) {
        return next.handle(req);
      }
    }

    const localStorageTokens = localStorage.getItem('tokens');
    let token: TokenModel;
    if (localStorageTokens) {
      token = JSON.parse(localStorageTokens) as TokenModel;
      let isTokenExpired = this.jwtHelper.isTokenExpired(token?.access_token);
      if (!isTokenExpired) {
        return next.handle(req);
      } else {
        return this.authService.refreshToken(token).pipe(
          switchMap((newTokens: TokenModel) => {
            newTokens.refresh_token=token.refresh_token
            localStorage.setItem('tokens', JSON.stringify(newTokens));
            let userInfo = this.jwtHelper.decodeToken(
              newTokens.access_token
            ) as UserProfile;
            this.authService.userProfile.next(userInfo);
            const transformedReq = req.clone({
              headers: req.headers.set(
                'Authorization',
                `bearer ${newTokens.access_token}`
              ),
            });
            return next.handle(transformedReq);
          })
        );
      }
    }
    return throwError(() => 'Invalid call');
  }
}
