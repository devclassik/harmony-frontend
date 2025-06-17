import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }

  signUp() {
    this.router.navigate(['/auth/sign-up']);
  }

  forgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.auth) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid username or password.';
        }
      },
      error: (error) => {
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
