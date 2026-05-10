import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import {
  LoginRequest, LoginResponse, TokenResponse, ChangePasswordRequest
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', request).pipe(
      tap(res => {
        this.tokenStorage.saveTokens(res.accessToken, res.refreshToken);
        this.tokenStorage.setMustChangePassword(res.mustChangePassword);
      })
    );
  }

  refresh(refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/refresh', { refreshToken }).pipe(
      tap(res => {
        this.tokenStorage.saveTokens(res.accessToken, res.refreshToken);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/auth/change-password', request).pipe(
      tap(res => {
        this.tokenStorage.saveTokens(res.accessToken, res.refreshToken);
        this.tokenStorage.setMustChangePassword(false);
      })
    );
  }

  logout(): void {
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      this.http.post('/api/auth/logout', {}).subscribe({ error: () => {} });
    }
    this.tokenStorage.clearTokens();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken() && !this.tokenStorage.isTokenExpired();
  }

  hasRefreshToken(): boolean {
    return !!this.tokenStorage.getRefreshToken();
  }

  mustChangePassword(): boolean {
    return this.tokenStorage.getMustChangePassword();
  }
}
