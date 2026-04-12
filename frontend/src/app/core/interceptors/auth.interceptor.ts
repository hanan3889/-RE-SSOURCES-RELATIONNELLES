import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(environment.jwtTokenName);

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token expiré ou invalide : purge session et redirection
        localStorage.removeItem(environment.jwtTokenName);
        localStorage.removeItem('currentUser');
        window.location.href = '/auth/login';
      }
      return throwError(() => err);
    })
  );
};
