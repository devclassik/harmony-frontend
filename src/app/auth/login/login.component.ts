import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { MatIconModule } from '@angular/material/icon';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, LoadingOverlayComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private alertService: AlertService
  ) {}

  signUp() {
    this.router.navigate(['/auth/sign-up']);
  }

  forgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      this.alertService.error('Please enter your email and password.');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        // Successful login
        this.alertService.success('Login successful! Welcome back.');
        // Navigate after a short delay to show the success alert
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error: any) => {
        const errorMsg =
          error?.message || 'An error occurred. Please try again.';
        this.errorMessage = errorMsg;
        this.alertService.error(errorMsg);
        console.error('Login error:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
