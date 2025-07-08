import { ApiResponse, WorkerRole } from './common.dto';
import { Employee, WorkerData, WorkerOTP } from './user.dto';

export interface LoginResponseData {
  email: string;
  isEmailVerified: boolean;
  isLoggedIn: boolean;
  employee: Employee;
  role: WorkerRole;
  token: string;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterResponse {
  message?: string;
  status?: string;
  data?: DataResponse;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: WorkerData;
}

export interface ResentOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpResponse {}

export interface DataResponse {
  worker: WorkerOTP;
  token: string;
}

// Password Reset DTOs
export interface PasswordResetInitiateRequest {
  email: string;
}

export interface PasswordResetInitiateResponse {
  status: string;
  message: string;
  data?: any;
}

export interface PasswordResetVerifyRequest {
  email: string;
  otp: string;
}

export interface PasswordResetVerifyResponse {
  status: string;
  message: string;
  success?: boolean;
  data?: any;
}

export interface PasswordResetResendRequest {
  email: string;
}

export interface PasswordResetResendResponse {
  status: string;
  message: string;
  data?: any;
}

export interface PasswordResetFinalizeRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetFinalizeResponse {
  status: string;
  message: string;
  data?: any;
}
