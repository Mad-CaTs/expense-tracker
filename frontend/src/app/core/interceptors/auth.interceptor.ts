import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

const PUBLIC_URLS = ['/api/auth/login', '/api/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);

  if (PUBLIC_URLS.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = tokenStorage.getAccessToken();

  if (token && !tokenStorage.isTokenExpired()) {
    return next(addToken(req, token)).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) return handleRefresh(req, next, tokenStorage, authService);
        return throwError(() => err);
      })
    );
  }

  if (tokenStorage.getRefreshToken()) {
    return handleRefresh(req, next, tokenStorage, authService);
  }

  return next(req);
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenStorage: TokenStorageService,
  authService: AuthService
) {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    authService.logout();
    return EMPTY;
  }
  return authService.refresh(refreshToken).pipe(
    switchMap(res => next(addToken(req, res.accessToken))),
    catchError(() => {
      authService.logout();
      return EMPTY;
    })
  );
}
