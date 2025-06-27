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
import {
  NotificationService,
  NotificationItem,
} from '../../services/notification.service';
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
  showNotificationDropdown = false;

  @Output() sidebarToggleEvent = new EventEmitter<void>();

  userName = '';
  userFullName = '';
  userEmail = '';
  role = '';
  pageTitle = '';

  private subscriptions: Subscription[] = [];
  notifications: NotificationItem[] = [];

  // Notification truncation properties
  expandedNotifications: Set<number> = new Set();
  readonly MAX_MESSAGE_LENGTH = 50;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.trackRouteChanges();
    this.updatePageTitle();

    // Load notifications on init
    this.loadRecentNotifications();

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

  toggleNotificationDropdown() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  closeNotificationDropdown() {
    this.showNotificationDropdown = false;
  }

  loadRecentNotifications() {
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications;
      })
    );
  }

  getRecentNotifications() {
    // Return only the first 5 notifications for the dropdown
    return this.notifications.slice(0, 5);
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  markNotificationAsRead(notificationId: number) {
    this.notificationService.markNotificationAsRead(notificationId);
  }

  navigateToNotifications() {
    this.closeNotificationDropdown();
    this.router.navigate(['/notifications']);
  }

  navigateToInbox() {
    this.router.navigate(['/inbox']);
  }

  // Notification message truncation methods
  getFullMessage(notification: NotificationItem): string {
    return `${notification.message} ${notification.targetUser}`;
  }

  shouldShowTruncated(notification: NotificationItem): boolean {
    const fullMessage = this.getFullMessage(notification);
    return (
      fullMessage.length > this.MAX_MESSAGE_LENGTH &&
      !this.expandedNotifications.has(notification.id)
    );
  }

  getTruncatedMessage(notification: NotificationItem): string {
    const fullMessage = this.getFullMessage(notification);
    if (fullMessage.length <= this.MAX_MESSAGE_LENGTH) {
      return fullMessage;
    }
    return fullMessage.substring(0, this.MAX_MESSAGE_LENGTH) + '...';
  }

  toggleNotificationExpansion(notificationId: number): void {
    if (this.expandedNotifications.has(notificationId)) {
      this.expandedNotifications.delete(notificationId);
    } else {
      this.expandedNotifications.add(notificationId);
    }
  }

  isNotificationExpanded(notificationId: number): boolean {
    return this.expandedNotifications.has(notificationId);
  }
}
