import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
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

  constructor(private apiService: ApiService) {
    // Load data from API
    this.loadInboxItemsFromApi();
    this.loadNotificationsFromApi();

    // Update unread count whenever inbox items or notifications change
    this.inboxItemsSubject.subscribe(() => this.updateUnreadCount());
    this.notificationsSubject.subscribe(() => this.updateUnreadCount());
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
        const inboxItems = this.mapApiMessagesToInboxItems(response.data);
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
        const notifications = this.mapApiNotificationsToNotificationItems(
          response.data
        );
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
      profileImage: message.actionBy.photoUrl || './assets/svg/profilePix.svg',
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
        image: notification.actionBy.photoUrl || './assets/svg/profilePix.svg',
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
