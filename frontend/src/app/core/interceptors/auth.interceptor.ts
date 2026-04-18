import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(environment.jwtTokenName);

  if (token && token !== 'undefined' && token !== 'null') {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
