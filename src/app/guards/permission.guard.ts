import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard = (
  requiredFeature: string,
  requiredAction: 'view' | 'create' | 'edit' | 'delete' = 'view'
): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    // Check if worker is logged in
    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Check if worker has the required permission
    if (authService.hasPermission(requiredFeature, requiredAction)) {
      return true;
    }

    // If worker doesn't have permission, redirect to dashboard with error message
    router.navigate(['/dashboard'], {
      queryParams: {
        error: 'You do not have permission to access this feature',
      },
    });
    return false;
  };
};
