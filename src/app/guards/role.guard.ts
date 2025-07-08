import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    const workerRole = localStorage.getItem('workerRole');

    if (workerRole && allowedRoles.includes(workerRole)) {
      return true;
    }

    // Redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  };
};
