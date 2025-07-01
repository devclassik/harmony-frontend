import { ApiResponse, UserRole } from './common.dto';
import { Employee, UserData, UserOTP } from './user.dto';

export interface LoginResponseData {
  email: string;
  isEmailVerified: boolean;
  isLoggedIn: boolean;
  employee: Employee;
  role: UserRole;
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
  data?: UserData;
}

export interface ResentOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpResponse {}

export interface DataResponse {
  user: UserOTP;
  token: string;
}
