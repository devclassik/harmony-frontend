import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Handle unauthorized error - clear ALL auth state
        localStorage.removeItem('token');
        localStorage.removeItem('workerRole');
        localStorage.removeItem('workerEmail');
        localStorage.removeItem('workerFullName');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('roleId');
        localStorage.removeItem('permissions');
        localStorage.removeItem('employeeId');

        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        // Handle forbidden error
        router.navigate(['/forbidden']);
      }
      // Note: 404 errors are not routed to not-found page to allow components to handle them

      return throwError(() => error);
    })
  );
};
