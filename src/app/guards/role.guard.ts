import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RbacService } from '../services/rbac.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const rbacService = inject(RbacService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  const userRole = authService.getUserRole();
  if (!userRole) {
    return router.createUrlTree(['/auth/login']);
  }

  // Check if user has permission to access this route
  const canAccess = rbacService.canAccessRoute(userRole, state.url);

  if (!canAccess) {
    // Redirect to dashboard or unauthorized page
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
