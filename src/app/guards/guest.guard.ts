import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return true;
  }

  // Redirect to home page if already authenticated
  router.navigate(['/']);
  return false;
}; 