import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const changePasswordGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);

  if (!tokenStorage.getAccessToken()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.mustChangePassword()) {
    router.navigate(['/expenses']);
    return false;
  }

  return true;
};
