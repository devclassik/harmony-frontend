import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle unauthorized error
        localStorage.removeItem('token');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Handle forbidden error
        router.navigate(['/forbidden']);
      } else if (error.status === 404) {
        // Handle not found error
        router.navigate(['/not-found']);
      }

      return throwError(() => error);
    })
  );
}; 