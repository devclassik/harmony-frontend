import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

let totalRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  totalRequests++;
  // You can implement a loading service here to show/hide loading indicators
  // For example: inject(LoadingService).setLoading(true);

  return next(req).pipe(
    finalize(() => {
      totalRequests--;
      if (totalRequests === 0) {
        // Hide loading indicator when all requests are complete
        // For example: inject(LoadingService).setLoading(false);
      }
    })
  );
}; 