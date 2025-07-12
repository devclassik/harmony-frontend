import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';
import {
  PasswordResetInitiateResponse,
  PasswordResetVerifyResponse,
  PasswordResetResendResponse,
} from '../../dto';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    CustomModalComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  showOtpModal: boolean = false;
  modalText: string = '';
  otpVerified: boolean = false;
  verifiedOtp: string = '';
  currentOperation: 'initiate' | 'verify' | 'resend' | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  backToLogin() {
    this.router.navigate(['auth/login']);
  }

  onSubmit() {
    if (!this.email) {
      this.alertService.error('Please enter your email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.alertService.error('Please enter a valid email address.');
      return;
    }

    this.isLoading = true;
    this.currentOperation = 'initiate';

    this.authService.initiatePasswordReset(this.email).subscribe({
      next: (response: PasswordResetInitiateResponse) => {
        console.log('Password reset initiate response:', response);

        if (response.status === 'success' || response.data) {
          // Show OTP modal
          this.showOtpModal = true;
          this.modalText = `A 6-digit reset code has been sent to ${this.email}. Please enter the code to continue with your password reset.`;
          this.alertService.success(
            'Reset code sent! Please check your email.'
          );
        } else {
          this.alertService.error(
            response.message || 'Failed to send reset code. Please try again.'
          );
        }
      },
      error: (error: any) => {
        this.alertService.error(
          error.error?.message || 'An error occurred. Please try again.'
        );
        console.error('Password reset initiate error:', error);
      },
      complete: () => {
        this.isLoading = false;
        this.currentOperation = null;
      },
    });
  }

  closeModal() {
    this.showOtpModal = false;
  }

  handleOtpSubmit(otp: string) {
    if (!otp || otp.length !== 6) {
      this.alertService.error('Please enter a valid 6-digit code.');
      return;
    }

    this.isLoading = true;
    this.currentOperation = 'verify';

    this.authService.verifyPasswordResetOtp(this.email, otp).subscribe({
      next: (response: PasswordResetVerifyResponse) => {
        console.log('OTP verification response:', response);

        if (
          response.status === 'success' ||
          response.success ||
          response.data
        ) {
          // OTP verified successfully
          this.verifiedOtp = otp;
          this.otpVerified = true;
          this.showOtpModal = false;
          this.alertService.success(
            'Code verified! Redirecting to reset password...'
          );

          // Navigate to reset password page after a short delay
          setTimeout(() => {
            this.router.navigate(['/auth/reset-password'], {
              state: {
                email: this.email,
                otp: this.verifiedOtp,
              },
            });
          }, 1000);
        } else {
          this.alertService.error(
            response.message || 'Invalid code. Please try again.'
          );
        }
      },
      error: (error: any) => {
        this.alertService.error(
          error.error?.message || 'An error occurred during verification.'
        );
        console.error('OTP verification error:', error);
      },
      complete: () => {
        this.isLoading = false;
        this.currentOperation = null;
      },
    });
  }

  handleResendOtp() {
    this.isLoading = true;
    this.currentOperation = 'resend';

    this.authService.resendPasswordResetOtp(this.email).subscribe({
      next: (response: PasswordResetResendResponse) => {
        if (response.status === 'success' || response.data) {
          this.alertService.success(
            'Reset code has been resent to your email.'
          );
        } else {
          this.alertService.error(
            response.message || 'Failed to resend code. Please try again.'
          );
        }
      },
      error: (error: any) => {
        this.alertService.error(
          error.error?.message || 'An error occurred while resending code.'
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
      case 'initiate':
        return {
          title: 'Sending reset code...',
          message: 'Please wait while we send a secure code to your email.',
        };
      case 'verify':
        return {
          title: 'Verifying your code...',
          message: 'Please wait while we verify your reset code.',
        };
      case 'resend':
        return {
          title: 'Resending reset code...',
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
