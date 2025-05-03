import { Component, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthService } from '../../services/auth.service';

interface Notification {
  user: {
    name: string;
    image: string;
  };
  message: string;
  time: string;
}

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  menuToggle = false;
  sidebarToggle = false;
  darkMode = false;
  dropdownOpen = false;
  notifying = true;
  messages = true;
  
  userName = 'John D.';
  userFullName = 'John Doe';
  userEmail = 'john.doe@example.com';
  role = 'Admin';
  notifications: Notification[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadNotifications();
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuToggle = !this.menuToggle;
  }

  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    console.log('dropdownOpen', this.dropdownOpen);
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  markNotificationsAsRead() {
    this.notifying = false;
  }

  markMessagesAsRead() {
    this.messages = false;
    this.router.navigate(['/inbox']);
  }

  loadNotifications() {
    this.notifications = [
      {
        user: {
          name: 'John Doe',
          image: 'https://ui-avatars.com/api/?name=John+Doe'
        },
        message: 'Sent you a message',
        time: '2 hours ago'
      },
      {
        user: {
          name: 'Jane Smith',
          image: 'https://ui-avatars.com/api/?name=Jane+Smith'
        },
        message: 'Liked your post',
        time: '3 hours ago'
      }
    ];
  }
}
