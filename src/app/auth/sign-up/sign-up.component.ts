import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomModalComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  constructor(private router: Router) { }

  showModal: boolean = false;
  showOtpBox: boolean = true;

  logo = "src/assets/images/jpg/HARMONY_LOGO.png"

  firstName: string = '';
  lastName: string = '';
  username: string = '';
  password: string = '';

  login() {
    console.log('oreddd');

    this.router.navigate(['/auth/login']);
  }

  onSubmit() {
    this.showModal = true;
    // if (!this.username || !this.password) {
    //   alert('Please enter your username and password.');
    //   return;
    // }

    // console.log('Username:', this.username);
    // console.log('Password:', this.password);

    // // TODO: Replace this with an API call to authenticate the user
    // if (this.username === 'admin' && this.password === 'password123') {
    //   alert('Login successful!');
    //   this.router.navigate(['/dashboard']); // Navigate to dashboard or another page
    // } else {
    //   alert('Invalid credentials. Please try again.');
    // }
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  handleSubmit(otp: string) {
    console.log('OTP Submitted:', otp);
    this.closeModal();
  }
}
