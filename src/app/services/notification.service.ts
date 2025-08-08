import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  NotificationResponse,
  MessageResponse,
  NotificationItem as ApiNotificationItem,
  MessageItem as ApiMessageItem,
} from '../dto/notification.dto';
import { map } from 'rxjs/operators';

export interface InboxItem {
  id: number;
  sender: string;
  profileImage: string;
  subject: string;
  preview: string;
  message: string;
  time: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: number;
  worker: {
    name: string;
    image: string;
  };
  type: string;
  message: string;
  targetWorker: string;
  timestamp: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private inboxItemsSubject = new BehaviorSubject<InboxItem[]>([]);
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    // Don't auto-load data in constructor - wait for manual trigger after auth
    // This prevents API calls before user is authenticated

    // Update unread count whenever inbox items or notifications change
    this.inboxItemsSubject.subscribe(() => this.updateUnreadCount());
    this.notificationsSubject.subscribe(() => this.updateUnreadCount());
  }

  // Public method to initialize data after authentication
  initializeNotifications(): void {
    this.loadInboxItemsFromApi();
    this.loadNotificationsFromApi();
  }

  // Public method to check if notifications are loaded
  hasNotifications(): boolean {
    return this.notificationsSubject.value.length > 0;
  }

  // Public method to check if inbox items are loaded
  hasInboxItems(): boolean {
    return this.inboxItemsSubject.value.length > 0;
  }

  private updateUnreadCount(): void {
    const inboxItems = this.inboxItemsSubject.value;
    const notifications = this.notificationsSubject.value;

    const unreadInboxCount = inboxItems.filter((item) => !item.isRead).length;
    const unreadNotificationsCount = notifications.filter(
      (item) => !item.isRead
    ).length;

    const totalUnreadCount = unreadInboxCount;

    this.unreadCountSubject.next(totalUnreadCount);
  }

  private loadInboxItemsFromApi(): void {
    this.apiService.get<MessageResponse>('/message').subscribe({
      next: (response) => {
        const currentEmployeeId = this.authService.getCurrentEmployeeId();
        const apiMessages = Array.isArray(response.data) ? response.data : [];
        const filteredForEmployee =
          currentEmployeeId == null
            ? []
            : apiMessages.filter((message) =>
                this.isItemForEmployee(message, currentEmployeeId)
              );
        const inboxItems = this.mapApiMessagesToInboxItems(filteredForEmployee);
        this.inboxItemsSubject.next(inboxItems);
      },
      error: (error) => {
        console.error('Error loading inbox items:', error);
        // Show empty list when API fails to ensure accurate unread count
        this.inboxItemsSubject.next([]);
      },
    });
  }

  private loadNotificationsFromApi(): void {
    this.apiService.get<NotificationResponse>('/notification').subscribe({
      next: (response) => {
        const currentEmployeeId = this.authService.getCurrentEmployeeId();
        const apiNotifications = Array.isArray(response.data)
          ? response.data
          : [];
        const filteredForEmployee =
          currentEmployeeId == null
            ? []
            : apiNotifications.filter((notification) =>
                this.isItemForEmployee(notification, currentEmployeeId)
              );
        const notifications =
          this.mapApiNotificationsToNotificationItems(filteredForEmployee);
        this.notificationsSubject.next(notifications);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        // Show empty list when API fails to ensure accurate unread count
        this.notificationsSubject.next([]);
      },
    });
  }

  markSelectedInboxItemAsRead(itemId: number) {
    this.apiService
      .put(`/message/mark-read`, { messageIds: [itemId] })
      .subscribe({
        next: () => {
          this.markInboxItemAsRead(itemId);
        },
        error: (error) => {
          console.error('Error marking inbox item as read:', error);
        },
      });
  }

  markSelectedNotificationItemAsRead(itemId: number) {
    this.apiService
      .put(`/notification/mark-read`, { notificationIds: [itemId] })
      .subscribe({
        next: () => {
          this.markNotificationAsRead(itemId);
        },
        error: (error) => {
          console.error('Error marking notification item as read:', error);
        },
      });
  }

  private mapApiMessagesToInboxItems(
    apiMessages: ApiMessageItem[]
  ): InboxItem[] {
    return apiMessages.map((message) => ({
      id: message.id,
      sender: `${message.actionBy.firstName} ${message.actionBy.lastName}`,
      profileImage: this.formatImageUrl(message.actionBy.photoUrl),
      subject: message.title || 'No Subject',
      preview:
        message.message.length > 100
          ? message.message.substring(0, 100) + '...'
          : message.message,
      message: message.message,
      time: new Date(message.createdAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      isRead: message.isRead,
    }));
  }

  private mapApiNotificationsToNotificationItems(
    apiNotifications: ApiNotificationItem[]
  ): NotificationItem[] {
    return apiNotifications.map((notification) => ({
      id: notification.id,
      worker: {
        name: `${notification.actionBy.firstName} ${notification.actionBy.lastName}`,
        image: this.formatImageUrl(notification.actionBy.photoUrl),
      },
      type: notification.title || notification.feature,
      message: notification.message,
      targetWorker:
        notification.actionTo.length > 0
          ? `${notification.actionTo[0].firstName} ${notification.actionTo[0].lastName}`
          : 'Unknown',
      timestamp: new Date(notification.createdAt).toLocaleDateString('en-GB'),
      isRead: notification.isRead,
    }));
  }

  private isItemForEmployee(
    item: ApiMessageItem | ApiNotificationItem,
    employeeId: number
  ): boolean {
    // Show only items authored by the current user
    const isActionBy = (item as any).actionBy?.id === employeeId;
    return isActionBy === true;
  }

  // Helper function to properly format image URLs
  private formatImageUrl(url: string | null): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return './assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Inbox methods
  getInboxItems(): Observable<InboxItem[]> {
    return this.inboxItemsSubject.asObservable();
  }

  markInboxItemAsRead(itemId: number): void {
    const currentItems = this.inboxItemsSubject.value;
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, isRead: true } : item
    );
    this.inboxItemsSubject.next(updatedItems);
  }

  // Notification methods
  getNotifications(): Observable<NotificationItem[]> {
    return this.notificationsSubject.asObservable();
  }

  markNotificationAsRead(itemId: number): void {
    const currentItems = this.notificationsSubject.value;
    const updatedItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, isRead: true } : item
    );
    this.notificationsSubject.next(updatedItems);
  }

  getUnreadInboxCount(): Observable<number> {
    return this.inboxItemsSubject
      .asObservable()
      .pipe(map((items) => items.filter((item) => !item.isRead).length));
  }

  getUnreadNotificationsCount(): Observable<number> {
    return this.notificationsSubject
      .asObservable()
      .pipe(map((items) => items.filter((item) => !item.isRead).length));
  }

  // Methods to refresh data from API
  refreshInboxItems(): void {
    this.loadInboxItemsFromApi();
  }

  refreshNotifications(): void {
    this.loadNotificationsFromApi();
  }
}
