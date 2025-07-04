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
  PasswordResetInitiateResponse,
  PasswordResetVerifyResponse,
  PasswordResetResendResponse,
  PasswordResetFinalizeResponse,
  Permission,
  UserRole,
} from '../dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;
  private currentPermissions: Permission[] = [];

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
          if (response.status === 'success' && response.data) {
            const { data } = response;
            const user = this.mapEmployeeToUser(
              data.employee,
              data.email,
              data.role.name
            );
            this.setAuthState(data.token, user, data.role, data.isLoggedIn);
            return { auth: true, role: data.role.name };
          } else {
            return { auth: false, role: null };
          }
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
    const token = localStorage.getItem('token');
    return !!token;
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getPermissions(): Permission[] {
    return this.currentPermissions;
  }

  hasPermission(
    feature: string,
    action: 'view' | 'create' | 'edit' | 'delete'
  ): boolean {
    const permission = this.currentPermissions.find(
      (p) => p.feature === feature
    );
    if (!permission) return false;

    switch (action) {
      case 'view':
        return permission.canView;
      case 'create':
        return permission.canCreate;
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      default:
        return false;
    }
  }

  canAccessFeature(feature: string): boolean {
    return this.hasPermission(feature, 'view');
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

  private setAuthState(
    token: string,
    user: User,
    role: UserRole,
    isLoggedIn: boolean
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userFullName', user.fullName);
    localStorage.setItem('roleId', role.id.toString());
    localStorage.setItem('permissions', JSON.stringify(role.permissions));

    this.currentUser = user;
    this.currentPermissions = role.permissions;
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');
    const permissionsStr = localStorage.getItem('permissions');

    if (token && userRole && userEmail && userFullName) {
      this.currentUser = {
        name: userFullName.split(' ')[0] || 'User',
        fullName: userFullName,
        email: userEmail,
        role: userRole,
      };

      if (permissionsStr) {
        try {
          this.currentPermissions = JSON.parse(permissionsStr);
        } catch (error) {
          console.error('Error parsing permissions from localStorage:', error);
          this.currentPermissions = [];
        }
      }
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('roleId');
    localStorage.removeItem('permissions');
    this.currentUser = null;
    this.currentPermissions = [];
  }

  // Password Reset Methods
  initiatePasswordReset(
    email: string
  ): Observable<PasswordResetInitiateResponse> {
    return this.http.post<PasswordResetInitiateResponse>(
      `${environment.apiUrl}${environment.routes.auth.passwordReset.initiate}`,
      { email }
    );
  }

  verifyPasswordResetOtp(
    email: string,
    otp: string
  ): Observable<PasswordResetVerifyResponse> {
    return this.http.post<PasswordResetVerifyResponse>(
      `${environment.apiUrl}${environment.routes.auth.passwordReset.verify}`,
      { email, otp }
    );
  }

  resendPasswordResetOtp(
    email: string
  ): Observable<PasswordResetResendResponse> {
    return this.http.post<PasswordResetResendResponse>(
      `${environment.apiUrl}${environment.routes.auth.passwordReset.resendOtp}`,
      { email }
    );
  }

  finalizePasswordReset(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<PasswordResetFinalizeResponse> {
    return this.http.post<PasswordResetFinalizeResponse>(
      `${environment.apiUrl}${environment.routes.auth.passwordReset.finalize}`,
      {
        email,
        otp,
        newPassword,
        confirmPassword,
      }
    );
  }
}
