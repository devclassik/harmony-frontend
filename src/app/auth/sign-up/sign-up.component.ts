import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';
import { AlertService } from '../../services/alert.service';
import { RegisterResponse, VerifyOtpResponse } from '../../dto';
import { AuthService } from '../../services/auth.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomModalComponent,
    MatIconModule,
    LoadingOverlayComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  form: SignUpForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  showModal: boolean = false;
  showOtp: boolean = false;
  modalText: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  currentOperation: 'register' | 'verify' | 'resend' | null = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private alertService: AlertService
  ) {}

  login() {
    this.router.navigate(['/auth/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.currentOperation = 'register';

    // Validate form
    if (
      !this.form.firstName ||
      !this.form.lastName ||
      !this.form.email ||
      !this.form.password ||
      !this.form.confirmPassword
    ) {
      this.isLoading = false;
      this.currentOperation = null;
      this.alertService.error('Please fill all the input.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.isLoading = false;
      this.currentOperation = null;
      this.alertService.error('Please enter a valid email address.');
      return;
    }

    // Validate password match
    if (this.form.password !== this.form.confirmPassword) {
      this.isLoading = false;
      this.currentOperation = null;
      this.alertService.error('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (this.form.password.length < 6) {
      this.isLoading = false;
      this.currentOperation = null;
      this.alertService.error('Password must be at least 6 characters long.');
      return;
    }

    this.auth
      .register({
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        password: this.form.password,
        // roleId: 1, // Assuming role 1 Admin, 2-HOD, 3-Minister, 4-worker
      })
      .subscribe({
        next: (response: RegisterResponse) => {
          console.log('Registration response:', response);

          // Check if registration was successful
          if (response.status === 'success' || response.data) {
            // Registration successful - show OTP modal
            this.showModal = true;
            this.showOtp = true;
            this.modalText = `A 6-digit OTP was sent to ${this.form.email}. Please provide the code sent to your email to complete your verification.`;
            this.alertService.success(
              'Registration successful! Please check your email for the OTP code.'
            );
          } else {
            // Registration failed
            this.alertService.error(
              response.message || 'Registration failed. Please try again.'
            );
          }
        },
        error: (error: any) => {
          this.alertService.error(
            error.error?.message || 'An error occurred during registration.'
          );
          console.error('Registration error:', error);
        },
        complete: () => {
          this.isLoading = false;
          this.currentOperation = null;
        },
      });
  }

  closeModal() {
    this.showModal = false;
    this.showOtp = false;
  }

  handleSubmit(event: any) {
    this.isLoading = true;
    this.currentOperation = 'verify';

    this.auth
      .verifyOtp({
        email: this.form.email,
        otp: event,
      })
      .subscribe({
        next: (response: VerifyOtpResponse) => {
          console.log('OTP verification response:', response);

          // Check if OTP verification was successful
          if (response.success || response.data) {
            // OTP verification successful
            this.alertService.success(
              'Email verification successful! You can now login.'
            );
            this.showModal = false;
            this.showOtp = false;

            // Navigate to login page with success message
            this.router.navigate(['/auth/login'], {
              queryParams: { registered: 'true', verified: 'true' },
            });
          } else {
            // OTP verification failed
            this.alertService.error(
              response.message || 'Verification failed. Please try again.'
            );
          }
        },
        error: (error: any) => {
          this.alertService.error(
            error.error?.message || 'An error occurred during OTP verification.'
          );
          console.error('Verify OTP error:', error);
        },
        complete: () => {
          this.isLoading = false;
          this.currentOperation = null;
        },
      });
  }

  resendOtp() {
    if (!this.form.email) {
      this.alertService.error('Email is required to resend OTP.');
      return;
    }

    this.isLoading = true;
    this.currentOperation = 'resend';

    this.auth
      .register({
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        password: this.form.password,
      })
      .subscribe({
        next: (response: RegisterResponse) => {
          if (response.status === 'success' || response.data) {
            this.alertService.success('OTP has been resent to your email.');
          } else {
            this.alertService.error(
              response.message || 'Failed to resend OTP. Please try again.'
            );
          }
        },
        error: (error: any) => {
          this.alertService.error(
            error.error?.message || 'An error occurred while resending OTP.'
          );
          console.error('Resend OTP error:', error);
        },
        complete: () => {
          this.isLoading = false;
          this.currentOperation = null;
        },
      });
  }

  getLoadingMessage(): { title: string; message: string } {
    switch (this.currentOperation) {
      case 'register':
        return {
          title: 'Creating your account...',
          message: 'Please wait while we set up your Harmony account.',
        };
      case 'verify':
        return {
          title: 'Verifying your email...',
          message: 'Please wait while we confirm your email address.',
        };
      case 'resend':
        return {
          title: 'Resending verification code...',
          message: 'Please wait while we send a new code to your email.',
        };
      default:
        return {
          title: 'Please wait...',
          message: 'Processing your request.',
        };
    }
  }
}
