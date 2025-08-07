import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Use AuthService method for proper validation
  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login page with return url
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
