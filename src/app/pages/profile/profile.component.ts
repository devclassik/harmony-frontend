import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TableComponent } from '../../components/table/table.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  userName: string = '';
  emptyStateImage: string = 'assets/animations/profile.gif';
  emptyStateText: string = 'No Data Currently Available';
  showButtonText: string = 'Create Profile';
  showButtonIcon: string = './assets/svg/add.svg';
  showButtonStyle: string =
    'bg-gradient-to-r from-[#12C16F] to-[#0A8754] hover:from-[#0A8754] hover:to-[#12C16F] text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#12C16F] focus:ring-offset-2';

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

  onButtonClick(event: boolean) {
    this.onCreateProfile();
  }
}
