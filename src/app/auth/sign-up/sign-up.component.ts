import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomModalComponent } from "../../components/custom-modal/custom-modal.component";
import { AlertService } from '../../services/alert.service';

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
  imports: [CommonModule, FormsModule, CustomModalComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  form: SignUpForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  showModal: boolean = false;
  showOtp: boolean = false;
  modalText: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private alertService: AlertService
  ) { }

  login() {
    this.router.navigate(['/auth/login']);
  }

  onSubmit() {
    this.isLoading = true;

    // Validate form
    if (
      !this.form.firstName ||
      !this.form.lastName ||
      !this.form.email ||
      !this.form.password ||
      !this.form.confirmPassword
    ) {
      this.isLoading = false;
      this.alertService.error('Please fill all the input.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email)) {
      this.isLoading = false;
      this.alertService.error('Please enter a valid email address.');
      return;
    }

    // Validate password match
    if (this.form.password !== this.form.confirmPassword) {
      this.isLoading = false;
      this.alertService.error('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (this.form.password.length < 6) {
      this.isLoading = false;
      this.alertService.error('Password must be at least 6 characters long.');
      return;
    }

    this.auth.register({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      password: this.form.password
    }).subscribe({
      next: (response) => {
        console.log(response);
        if (response.data) {
          // this.router.navigate(['/auth/login'], {
          //   queryParams: { registered: 'true' }
          // });
        } else {
          this.showModal = true;
          this.showOtp = true;
          // this.modalText = `A 6-dIGIT OTP was sent to ${response.data?.email}. Provide the code sent to your email to complete your verification`;
          this.alertService.error(response.message || 'Registration failed. Please try again.');
        }
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'An error occurred during registration.');
        console.error('Registration error:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.showOtp = false;
  }

  handleSubmit(event: any) {

    this.auth.verifyOtp({
      email: this.form.email,
      otp: event
    }).subscribe({
      next: (response) => {
        console.log({response});
        if (response.data) {
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true' }
          });
          this.showModal = false;
          this.showOtp = false;
        } else {
          this.alertService.error(response.message || 'Verification failed. Please try again.');
        }
      },
      error: (error) => {
        this.alertService.error(error.error?.message || 'An error occurred during OTP verification.');
        console.error('verify OTP error:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
