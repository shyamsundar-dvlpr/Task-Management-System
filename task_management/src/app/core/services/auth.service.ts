import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environment';
import { LoginDto, RegisterDto, AuthResponse, JwtPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;
  private router = inject(Router);

  private _user = signal<JwtPayload | null>(null);

  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());
  role = computed(() => this._user()?.role);
  username = computed(() => this._user()?.unique_name || this._user()?.unique_name || 'User');

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(data: LoginDto) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken',res.refreshToken)
        const decoded: any = jwtDecode<JwtPayload>(res.accessToken);
        this._user.set(decoded);
      })
    );
  }

  register(data: RegisterDto) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data);
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if(refreshToken) {
      this.http.post(`${this.baseUrl}/revoke`, JSON.stringify(refreshToken), {
        headers: { 'Content-Type':'application/json'}
      }).subscribe();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const decoded = jwtDecode<JwtPayload>(token);
    this._user.set(decoded);
  }

  refreshTokens() {
     const refreshToken = localStorage.getItem('refreshToken');
     return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`,
      JSON.stringify(refreshToken),
      { headers: {'Content-Type' : 'application/json'}}
     ).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
        const decoded = jwtDecode<JwtPayload>(res.accessToken);
        this._user.set(decoded);
      })
     )
  }
}