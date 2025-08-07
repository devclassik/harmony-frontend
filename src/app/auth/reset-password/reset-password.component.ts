import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { MatIconModule } from '@angular/material/icon';
import { PasswordResetFinalizeResponse } from '../../dto';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingOverlayComponent, MatIconModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  form: ResetPasswordForm = {
    newPassword: '',
    confirmPassword: '',
  };

  email: string = '';
  otp: string = '';
  isLoading: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    // Get email and OTP from router state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state) {
      this.email = state['email'] || '';
      this.otp = state['otp'] || '';
    }
  }

  ngOnInit() {
    // If no email or OTP, redirect back to forgot password
    if (!this.email || !this.otp) {
      this.alertService.error(
        'Invalid access. Please start the password reset process again.'
      );
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // Validate form
    if (!this.form.newPassword || !this.form.confirmPassword) {
      this.alertService.error('Please fill in both password fields.');
      return;
    }

    // Validate password match
    if (this.form.newPassword !== this.form.confirmPassword) {
      this.alertService.error('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (this.form.newPassword.length < 6) {
      this.alertService.error('Password must be at least 6 characters long.');
      return;
    }

    this.isLoading = true;

    this.authService
      .finalizePasswordReset(
        this.email,
        this.otp,
        this.form.newPassword,
        this.form.confirmPassword
      )
      .subscribe({
        next: (response: PasswordResetFinalizeResponse) => {
          console.log('Password reset finalize response:', response);

          if (response.status === 'success' || response.data) {
            // Password reset successful
            this.alertService.success(
              'Password reset successfully! You can now login with your new password.'
            );

            // Navigate to login page after a short delay
            setTimeout(() => {
              this.router.navigate(['/auth/login'], {
                queryParams: { resetSuccess: 'true' },
              });
            }, 2000);
          } else {
            this.alertService.error(
              response.message || 'Password reset failed. Please try again.'
            );
          }
        },
        error: (error: any) => {
          this.alertService.error(
            error.error?.message || 'An error occurred during password reset.'
          );
          console.error('Password reset finalize error:', error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
}
