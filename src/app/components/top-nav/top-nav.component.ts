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
  userPhotoUrl = '';
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
    this.loadWorkerInfo();
    this.trackRouteChanges();
    this.updatePageTitle();

    // Initialize notifications after auth check
    if (this.authService.isLoggedIn()) {
      this.notificationService.initializeNotifications();
    }

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

    // Subscribe to user profile updates to refresh user info
    this.subscriptions.push(
      this.authService.getUserProfileUpdatedSubject().subscribe(() => {
        this.loadWorkerInfo();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Make this method public so it can be called from other components
  loadWorkerInfo() {
    const currentWorker = this.authService.getCurrentWorker();
    const workerRole = this.authService.getWorkerRole();

    if (currentWorker) {
      this.userName = currentWorker.name;
      this.userFullName = currentWorker.fullName;
      this.userEmail = currentWorker.email || '';
      this.userPhotoUrl = this.formatImageUrl(currentWorker.photoUrl);
    }

    this.role = workerRole ? workerRole : 'Worker';
  }

  // Method to refresh user info (can be called after profile updates)
  refreshUserInfo() {
    this.loadWorkerInfo();
  }

  // Helper function to properly format image URLs
  private formatImageUrl(url: string | null | undefined): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback instead of SVG
    if (!url || url === '') {
      return 'assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Handle image loading errors
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/svg/gender.svg';
    }
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
    return `${notification.message} ${notification.targetWorker}`;
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
