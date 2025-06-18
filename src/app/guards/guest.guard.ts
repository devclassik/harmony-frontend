import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return true;
  }

  // Redirect to dashboard if already authenticated
  router.navigate(['/dashboard']);
  return false;
};
