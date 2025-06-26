import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  userName: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser?.name || 'John Adegoke';
  }

  onCreateProfile() {
    // TODO: Implement create profile functionality
    console.log('Create Profile clicked');
  }
}
