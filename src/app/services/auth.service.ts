import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Worker,
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
  WorkerRole,
} from '../dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentWorker: Worker | null = null;
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

  login(email: string, password: string): Observable<void> {
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
            const worker = this.mapEmployeeToWorker(
              data.employee,
              data.email,
              data.role.name
            );
            this.setAuthState(data.token, worker, data.role, data.isLoggedIn);
            return; // Success - return void
          } else {
            throw new Error('Login failed: Invalid credentials');
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          const errorMessage =
            error?.error?.message ||
            'Login failed: Please check your credentials';
          throw new Error(errorMessage);
        })
      );
  }

  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return !!token && isLoggedIn;
  }

  getWorkerRole(): string | null {
    return localStorage.getItem('workerRole');
  }

  getCurrentWorker(): Worker | null {
    return this.currentWorker;
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

  private mapEmployeeToWorker(
    employee: Employee,
    email: string,
    roleName: string
  ): Worker {
    return {
      name: employee.profferedName || employee.firstName,
      fullName: `${employee.firstName} ${employee.lastName}`,
      email: email,
      role: roleName.toLowerCase(),
    };
  }

  private setAuthState(
    token: string,
    worker: Worker,
    role: WorkerRole,
    isLoggedIn: boolean
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('workerRole', worker.role.toLowerCase());
    localStorage.setItem('workerEmail', worker.email);
    localStorage.setItem('workerFullName', worker.fullName);
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('roleId', role.id.toString());
    localStorage.setItem('permissions', JSON.stringify(role.permissions));

    this.currentWorker = { ...worker, role: worker.role.toLowerCase() };
    this.currentPermissions = role.permissions;
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const workerRole = localStorage.getItem('workerRole');
    const workerEmail = localStorage.getItem('workerEmail');
    const workerFullName = localStorage.getItem('workerFullName');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const permissionsStr = localStorage.getItem('permissions');

    if (token && workerRole && workerEmail && workerFullName && isLoggedIn) {
      this.currentWorker = {
        name: workerFullName.split(' ')[0] || 'Worker',
        fullName: workerFullName,
        email: workerEmail,
        role: workerRole,
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
    localStorage.removeItem('workerRole');
    localStorage.removeItem('workerEmail');
    localStorage.removeItem('workerFullName');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('roleId');
    localStorage.removeItem('permissions');
    this.currentWorker = null;
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
