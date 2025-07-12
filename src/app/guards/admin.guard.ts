import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if worker is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if worker has admin role
  if (authService.isAdmin()) {
    return true;
  }

  // If worker is not admin, redirect to dashboard with error message
  router.navigate(['/dashboard'], {
    queryParams: {
      error: 'Access denied. This feature is only available to administrators.',
    },
  });
  return false;
};
