import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface User {
  name: string;
  fullName: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

interface UserData {
  email: string;
  role: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  employee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    title: string | null;
    middleName: string | null;
    gender: string | null;
    profferedName: string | null;
    primaryPhone: string | null;
    primaryPhoneType: string | null;
    altPhone: string | null;
    altPhoneType: string | null;
    dob: string | null;
    maritalStatus: string | null;
    photoUrl: string | null;
    altEmail: string | null;
    employeeStatus: string | null;
    employmentType: string | null;
    serviceStartDate: string | null;
    retiredDate: string | null;
    id: number;
    everDivorced: boolean;
    beenConvicted: boolean;
    hasQuestionableBackground: boolean;
    hasBeenInvestigatedForMisconductOrAbuse: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  isEmailVerified: boolean;
  isLoggedIn: boolean;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}
interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: UserData;
}
interface ResentOtpRequest {
  email: string;
  otp: string;
}
interface ResendOtpResponse {}
interface RegisterResponse {
  message?: string;
  status?: string;
  data?: DataResponse;
}

interface Permission {
  id: number;
  feature: string;
  label: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string; // Consider using Date if you parse it
  updatedAt: string; // Consider using Date if you parse it
  deletedAt: string | null; // Consider using Date | null if you parse it
}

interface UserRole {
  id: number;
  name: string;
  createdAt: string; // Consider using Date if you parse it
  updatedAt: string; // Consider using Date if you parse it
  deletedAt: string | null; // Consider using Date | null if you parse it
  permissions: Permission[];
}

interface Employee {
  id: number;
  employeeId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string | null;
  profferedName: string | null;
  primaryPhone: string | null;
  primaryPhoneType: string | null;
  altPhone: string | null;
  altPhoneType: string | null;
  dob: string | null; // Consider using Date | null if you parse it
  maritalStatus: string | null;
  everDivorced: boolean;
  beenConvicted: boolean;
  hasQuestionableBackground: boolean;
  hasBeenInvestigatedForMisconductOrAbuse: boolean;
  photoUrl: string | null;
  altEmail: string | null;
  employeeStatus: string | null;
  employmentType: string | null;
  serviceStartDate: string | null; // Consider using Date | null if you parse it
  retiredDate: string | null; // Consider using Date | null if you parse it
  createdAt: string; // Consider using Date if you parse it
  updatedAt: string; // Consider using Date if you parse it
  deletedAt: string | null; // Consider using Date | null if you parse it
}

interface UserOTP {
  id: number;
  email: string;
  password?: string; // It's a password hash, often not needed on the client, so made optional
  verifyEmailOTP: string;
  isEmailVerified: boolean;
  passwordResetOTP: string | null;
  isLoggedIn: boolean;
  createdAt: string; // Consider using Date if you parse it
  updatedAt: string; // Consider using Date if you parse it
  deletedAt: string | null; // Consider using Date | null if you parse it
  employee: Employee;
  role: UserRole;
}

interface DataResponse {
  user: UserOTP;
  token: string;
}

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
    username: string,
    password: string
  ): Observable<{ auth: boolean; role: string | null }> {
    // For development, use mock login
    if (environment.production === false) {
      if (username === 'admin' && password === 'qaz') {
        const mockUser: User = {
          name: 'John D.',
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          role: 'admin',
        };
        const mockToken = 'mock-jwt-token';

        this.setAuthState(mockToken, mockUser);
        return of({ auth: true, role: mockUser.role });
      }

      // Add mock user with role "user"
      if (username === 'user' && password === 'qaz') {
        const mockUser: User = {
          name: 'Jane S.',
          fullName: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'user',
        };
        const mockToken = 'mock-jwt-token-user';

        this.setAuthState(mockToken, mockUser);
        return of({ auth: true, role: mockUser.role });
      }

      return of({ auth: false, role: null });
    }

    // For production, use actual API
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        password,
      })
      .pipe(
        map((response) => {
          this.setAuthState(response.token, response.user);
          return { auth: true, role: response.user.role };
        }),
        catchError(() => of({ auth: false, role: null }))
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

  private setAuthState(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    this.currentUser = user;
  }

  private loadAuthState(): void {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      this.currentUser = {
        name: 'John D.', // This should come from your API
        fullName: 'John Doe', // This should come from your API
        email: 'john.doe@example.com', // This should come from your API
        role: userRole,
      };
    }
  }

  private clearAuthState(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.currentUser = null;
  }
}
