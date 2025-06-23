import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import {
  NotificationService,
  NotificationItem,
} from '../../services/notification.service';
import { TableData } from '../../interfaces/employee.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  tableData: TableData[] = [];
  filteredTableData: TableData[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  showFilterDropdown: boolean = false;
  currentFilter: 'all' | 'unread' | 'recent' = 'all';

  // Table configuration
  tableHeaders: TableHeader[] = []; // Not needed for list view

  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadNotifications() {
    // Subscribe to notifications from the service
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe((notifications) => {
        this.notifications = notifications;
        this.convertToTableData();
        this.applyFilter();
      })
    );
  }

  convertToTableData() {
    this.tableData = this.notifications.map((notification) => ({
      id: notification.id.toString(),
      name: notification.user.name,
      imageUrl: notification.user.image,
      type: notification.type,
      message: notification.message,
      targetUser: notification.targetUser,
      timestamp: notification.timestamp,
      isRead: notification.isRead,
      user: notification.user,
    }));
  }

  applyFilter() {
    let filtered = [...this.tableData];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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
        filtered = filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    this.filteredTableData = filtered;
    this.totalPages = Math.ceil(this.filteredTableData.length / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
  }

  getPaginatedData(): TableData[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTableData.slice(startIndex, endIndex);
  }

  onSearch(searchValue: string) {
    this.searchTerm = searchValue;
    this.applyFilter();
  }

  onFilterChange(filter: string) {
    this.currentFilter = filter as 'all' | 'unread' | 'recent';
    this.applyFilter();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onMenuAction(event: { action: string; row: TableData }) {
    if (event.action === 'markAsRead') {
      this.markAsRead(parseInt(event.row.id));
    }
  }

  markAsRead(notificationId: number) {
    // Use the service to mark as read, which will automatically update the unread count
    this.notificationService.markNotificationAsRead(notificationId);
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  // Override the table data to return paginated data
  get paginatedTableData(): TableData[] {
    return this.getPaginatedData();
  }
}
