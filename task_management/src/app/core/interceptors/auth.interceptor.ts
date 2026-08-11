import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ApiError } from '../models/api-error.model';

let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('accessToken');
    const authService = inject(AuthService);
    const toastService = inject(ToastService);

    const authedReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(authedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if(error.status===401 && !req.url.includes('/auth')){
                return handle401(req, next, authService);
            }

            const apiError = error.error as ApiError;
            const serverMessage = apiError?.message;

           if (error.status === 403) {
                toastService.error('You do not have permission to perform this action.');
            } else if (error.status === 0) {
                toastService.error('Cannot reach the server. Check your connection.');
            } else if (error.status >= 400 && error.status < 500) {
                toastService.error(serverMessage ?? 'The request could not be completed.');
            } else if (error.status >= 500) {
                toastService.error('An unexpected server error occurred. Please try again.');
            }

            return throwError(() => error);
        })
    );
    function handle401(
        req: HttpRequest<unknown>,
        next: HttpHandlerFn,
        authService: AuthService
    ): Observable<HttpEvent<unknown>> {
        if(!isRefreshing) {
            isRefreshing = true;
            refreshDone$.next(null);
            return authService.refreshTokens().pipe(
                switchMap(res => {
                    isRefreshing = false;
                    refreshDone$.next(res.accessToken);
                    const retryReq= req.clone({
                        setHeaders: {Authorization: `Bearer ${res.accessToken}`}
                    });
                    return next(retryReq);
                }),
                catchError(err => {
                    isRefreshing = false;
                    authService.logout();
                    return throwError(() => err);
                })
            );
        }
        return refreshDone$.pipe(
            filter((token): token is string => token !== null),
            take(1),
            switchMap(token => {
                const retryReq = req.clone({
                    setHeaders : { Authorization : `Bearer ${token!}`}  
                });
                return next(retryReq);
            })
        )
        
    }
};
