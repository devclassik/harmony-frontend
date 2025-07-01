import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  Employee,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResentOtpRequest,
  ResendOtpResponse,
} from '../dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(private router: Router, private http: HttpClient) {
    this.loadAuthState();
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(
        `${environment.apiUrl}${environment.routes.auth.register}`,
        data
      )
      .pipe(
        catchError((error) => {
          console.error('Registration error:', error);
          return of({
            success: false,
            message:
              error.error?.message || 'Registration failed. Please try again.',
          });
        })
      );
  }

  verifyOtp(data: VerifyOtpRequest): Observable<VerifyOtpResponse> {
    return this.http
      .post<VerifyOtpResponse>(
        `${environment.apiUrl}${environment.routes.auth.verifyOtp}`,
        data
      )
      .pipe(
        catchError((error) => {
          console.error('OTP verification error:', error);
          return of({
            success: false,
            message:
              error.error?.message ||
              'OTP verification failed. Please try again.',
          });
        })
      );
  }

  login(
    email: string,
    password: string
  ): Observable<{ auth: boolean; role: string | null }> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}${environment.routes.auth.login}`,
        {
          email,
          password,
        }
      )
      .pipe(
        map((response) => {
          const user = this.mapEmployeeToUser(
            response.data.employee,
            response.data.email,
            response.data.role.name
          );
          this.setAuthState(response.data.token, user);
          return { auth: true, role: response.data.role.name };
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return of({ auth: false, role: null });
        })
      );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private mapEmployeeToUser(
    employee: Employee,
    email: string,
    roleName: string
  ): User {
    return {
      name: employee.profferedName || employee.firstName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: email,
      role: roleName,
    };
  }

  private setAuthState(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userFullName', user.fullName);
    this.currentUser = user;
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');

    if (token && userRole && userEmail && userFullName) {
      this.currentUser = {
        name: userFullName.split(' ')[0] || 'User',
        fullName: userFullName,
        email: userEmail,
        role: userRole,
      };
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    this.currentUser = null;
  }
}
