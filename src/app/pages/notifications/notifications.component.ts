import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import {
  NotificationService,
  NotificationItem,
} from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  filteredNotifications: NotificationItem[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  currentFilter: 'all' | 'unread' | 'recent' = 'all';
  showFilterDropdown: boolean = false;

  filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Unread', value: 'unread' },
    { label: 'Recent', value: 'recent' },
  ];

  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadNotifications() {
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications;
        this.applyFilter();
      })
    );
  }

  applyFilter() {
    let filtered = [...this.notifications];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.user.name
            ?.toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          item.type?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.targetUser?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (this.currentFilter) {
      case 'unread':
        filtered = filtered.filter((item) => !item.isRead);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    this.filteredNotifications = filtered;
    this.totalPages = Math.ceil(
      this.filteredNotifications.length / this.pageSize
    );
    this.currentPage = 1; // Reset to first page when filtering
  }

  get paginatedNotifications(): NotificationItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredNotifications.slice(startIndex, endIndex);
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilter();
  }

  onFilterChange(filter: string) {
    this.currentFilter = filter as 'all' | 'unread' | 'recent';
    this.showFilterDropdown = false; // Close dropdown after selection
    this.applyFilter();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  toggleFilter() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  closeFilterDropdown() {
    this.showFilterDropdown = false;
  }

  markAsRead(notificationId: number) {
    this.notificationService.markNotificationAsRead(notificationId);
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}
