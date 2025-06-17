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
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private auth: AuthService) {}

  signUp() {
    this.router.navigate(['/auth/sign-up']);
  }

  forgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }

  async onSubmit(): Promise<boolean> {
    if (!this.username || !this.password) {
      alert('Please enter your username and password.');
      return false;
    }

    console.log('Username:', this.username);
    console.log('Password:', this.password);

    const res = this.auth.login(this.username, this.password);

    // Check if login was successful
    if (res && typeof res === 'object' && res.auth) {
      // Success - redirect to dashboard
      this.router.navigate(['/dashboard']);
      return true;
    } else {
      // Failed - show error message using same alert pattern
      alert('Invalid username or password. Please try again.');
      return false;
    }
  }
}
