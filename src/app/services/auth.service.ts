import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
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
  UpdateEmployeeRequest,
} from '../dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentWorker: Worker | null = null;
  private currentPermissions: Permission[] = [];
  private userProfileUpdatedSubject = new BehaviorSubject<void>(undefined);

  constructor(private router: Router, private http: HttpClient) {
    this.loadAuthState();
    // Add to window for debugging purposes
    // (window as any).authService = this;
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
            this.setAuthState(
              data.token,
              worker,
              data.role,
              data.isLoggedIn,
              data.employee
            );
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

    // Check if we have both token and login flag
    if (!token || !isLoggedIn) {
      // If either is missing, clear all auth state to prevent inconsistent state
      this.clearAuthState();
      return false;
    }

    // Additional validation: check if we have essential user data
    const workerEmail = localStorage.getItem('workerEmail');
    const workerFullName = localStorage.getItem('workerFullName');

    if (!workerEmail || !workerFullName) {
      // If essential data is missing, clear all auth state
      this.clearAuthState();
      return false;
    }

    return true;
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

  isAdmin(): boolean {
    return this.getWorkerRole()?.toLowerCase() === 'admin';
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
      photoUrl: employee.photoUrl,
    };
  }

  private setAuthState(
    token: string,
    worker: Worker,
    role: WorkerRole,
    isLoggedIn: boolean,
    employee: Employee
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('workerRole', worker.role.toLowerCase());
    localStorage.setItem('workerEmail', worker.email);
    localStorage.setItem('workerFullName', worker.fullName);
    localStorage.setItem('workerPhotoUrl', worker.photoUrl || '');
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    localStorage.setItem('roleId', role.id.toString());
    localStorage.setItem('permissions', JSON.stringify(role.permissions));
    localStorage.setItem('employeeId', employee.id.toString());

    this.currentWorker = { ...worker, role: worker.role.toLowerCase() };
    this.currentPermissions = role.permissions;
    this.userProfileUpdatedSubject.next();
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const workerRole = localStorage.getItem('workerRole');
    const workerEmail = localStorage.getItem('workerEmail');
    const workerFullName = localStorage.getItem('workerFullName');
    const workerPhotoUrl = localStorage.getItem('workerPhotoUrl');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const permissionsStr = localStorage.getItem('permissions');

    if (token && workerRole && workerEmail && workerFullName && isLoggedIn) {
      this.currentWorker = {
        name: workerFullName.split(' ')[0] || 'Worker',
        fullName: workerFullName,
        email: workerEmail,
        role: workerRole,
        photoUrl: workerPhotoUrl || null,
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
    // Clear all authentication-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('workerRole');
    localStorage.removeItem('workerEmail');
    localStorage.removeItem('workerFullName');
    localStorage.removeItem('workerPhotoUrl');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('roleId');
    localStorage.removeItem('permissions');
    localStorage.removeItem('employeeId');

    // Clear in-memory state
    this.currentWorker = null;
    this.currentPermissions = [];
    this.userProfileUpdatedSubject.next();
  }

  getCurrentEmployeeId(): number | null {
    const employeeId = localStorage.getItem('employeeId');
    return employeeId ? parseInt(employeeId, 10) : null;
  }

  // Method to update user photo after profile update
  updateUserPhoto(photoUrl: string | null): void {
    if (this.currentWorker) {
      this.currentWorker.photoUrl = photoUrl;
      localStorage.setItem('workerPhotoUrl', photoUrl || '');
      this.userProfileUpdatedSubject.next();
    }
  }

  // Comprehensive method to update user profile data after profile update
  updateUserProfile(updatedData: Partial<UpdateEmployeeRequest>): void {
    if (!this.currentWorker) return;

    // Update name if changed
    if (
      updatedData.firstName ||
      updatedData.lastName ||
      updatedData.profferedName
    ) {
      const firstName =
        updatedData.firstName || this.currentWorker.fullName.split(' ')[0];
      const lastName =
        updatedData.lastName ||
        this.currentWorker.fullName.split(' ').slice(1).join(' ');
      const profferedName = updatedData.profferedName;

      // Update displayed name (prefer proffered name)
      this.currentWorker.name = profferedName || firstName;
      this.currentWorker.fullName = `${firstName} ${lastName}`;

      localStorage.setItem('workerFullName', this.currentWorker.fullName);
    }

    // Update email if changed
    if (updatedData.email) {
      this.currentWorker.email = updatedData.email;
      localStorage.setItem('workerEmail', updatedData.email);
    }

    // Update photo if changed
    if (updatedData.photoUrl !== undefined) {
      this.currentWorker.photoUrl = updatedData.photoUrl;
      localStorage.setItem('workerPhotoUrl', updatedData.photoUrl || '');
    }

    // Trigger update notification to all subscribed components
    this.userProfileUpdatedSubject.next();
  }

  // Debug method to force clear all auth state
  // Can be called from browser console: window.authService.forceLogout()
  forceLogout(): void {
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
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

  getUserProfileUpdatedSubject(): BehaviorSubject<void> {
    return this.userProfileUpdatedSubject;
  }
}
