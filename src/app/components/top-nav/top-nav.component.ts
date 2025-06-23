import {
  Component,
  NgModule,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ClickOutsideDirective,
    ConfirmPromptComponent,
  ],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
})
export class TopNavComponent implements OnInit, OnDestroy {
  menuToggle = false;
  sidebarToggle = false;
  darkMode = false;
  dropdownOpen = false;
  userDropdownOpen = false;
  notifying = false;
  messages = false;
  showLogoutConfirm = false;

  @Output() sidebarToggleEvent = new EventEmitter<void>();

  userName = '';
  userFullName = '';
  userEmail = '';
  role = '';
  pageTitle = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.trackRouteChanges();
    this.updatePageTitle();

    // Subscribe to unread inbox count for mail icon
    this.subscriptions.push(
      this.notificationService.getUnreadInboxCount().subscribe((count) => {
        this.messages = count > 0;
      })
    );

    // Subscribe to unread notifications count for bell icon
    this.subscriptions.push(
      this.notificationService
        .getUnreadNotificationsCount()
        .subscribe((count) => {
          this.notifying = count > 0;
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadUserInfo() {
    const currentUser = this.authService.getCurrentUser();
    const userRole = this.authService.getUserRole();

    if (currentUser) {
      this.userName = currentUser.name || 'User';
      this.userFullName = currentUser.fullName || 'User';
      this.userEmail = currentUser.email || '';
    }

    this.role = this.formatRole(userRole || 'user');
  }

  formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  trackRouteChanges() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  updatePageTitle() {
    const url = this.router.url;
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/employee-records': 'Employee Records',
      '/reporting-and-analytics': 'Reporting & Analytics',
      '/employee-management/promotion': 'Employee Promotion',
      '/employee-management/discipline': 'Employee Discipline',
      '/employee-management/transfer': 'Employee Transfer',
      '/employee-management/retirement': 'Employee Retirement',
      '/employee-management/retrenchment': 'Employee Retrenchment',
      '/leave-management/annual-leave': 'Annual Leave',
      '/leave-management/leave-of-absence': 'Leave of Absence',
      '/leave-management/sick-leave': 'Sick Leave',
      '/file-index': 'File Index',
      '/camp-meeting': 'Campmeeting',
      '/inbox': 'Inbox',
      '/notifications': 'Notifications',
      '/payroll': 'Payroll',
      '/settings': 'Settings',
      '/profile': 'Profile',
    };

    this.pageTitle = routeMap[url] || 'Dashboard';
  }

  logout() {
    this.showLogoutConfirm = true;
  }

  onLogoutConfirmed() {
    this.authService.logout();
    this.showLogoutConfirm = false;
  }

  onLogoutCancelled() {
    this.showLogoutConfirm = false;
  }

  toggleMenu() {
    this.menuToggle = !this.menuToggle;
  }

  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
    this.sidebarToggleEvent.emit();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleUserDropdown() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  closeUserDropdown() {
    this.userDropdownOpen = false;
  }

  markNotificationsAsRead() {
    this.notifying = false;
  }

  navigateToInbox() {
    this.router.navigate(['/inbox']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  markMessagesAsRead() {
    this.router.navigate(['/inbox']);
  }
}
