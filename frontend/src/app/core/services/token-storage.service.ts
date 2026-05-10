import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'at';
const REFRESH_TOKEN_KEY = 'rt';
const MUST_CHANGE_KEY = 'mcp';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(MUST_CHANGE_KEY);
  }

  setMustChangePassword(value: boolean): void {
    localStorage.setItem(MUST_CHANGE_KEY, String(value));
  }

  getMustChangePassword(): boolean {
    return localStorage.getItem(MUST_CHANGE_KEY) === 'true';
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
