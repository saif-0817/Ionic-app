import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userIsAuthenticated.pipe(
    switchMap(isAuthenticated => {
      if (isAuthenticated) {
        return of(true); // User is authenticated, allow navigation
      } else {
        return authService.autoLogin().pipe(
          switchMap(autoLoginSuccess => {
            if (!autoLoginSuccess) {
              router.navigateByUrl('/auth'); // Navigate to login page
              return of(false); // Deny navigation
            }
            return of(true); // Allow navigation
          })
        );
      }
    })
  );
};
