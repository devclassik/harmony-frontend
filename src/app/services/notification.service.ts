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

    const totalUnreadCount = unreadInboxCount + unreadNotificationsCount;

    this.unreadCountSubject.next(totalUnreadCount);
  }

  private getDefaultInboxItems(): InboxItem[] {
    return [
      {
        id: 1,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'Promotion Approved',
        preview:
          'The promotion request placed by your head of department on the 25th of July for the position of so...',
        message:
          'The promotion request placed by your head of department on the 25th of July for the position of zonal pastor was approved by the admin. Please find attached your promotion letter.',
        time: '1:45PM',
        isRead: false,
      },
      {
        id: 2,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'Accommodation Assigned',
        preview:
          'Your accommodation request has been processed and approved. You have been assigned to Building A...',
        message:
          'Your accommodation request has been processed and approved. You have been assigned to Building A, Room 204. The accommodation includes all necessary amenities and utilities. Please report to the accommodation office to collect your keys and complete the check-in process.',
        time: '1:45PM',
        isRead: false,
      },
      {
        id: 3,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'May Paystub',
        preview:
          'Your May 2024 paystub is now available for download. This includes your salary, allowances...',
        message:
          'Your May 2024 paystub is now available for download. This includes your salary, allowances, and deductions for the month. Please review the document and contact payroll if you have any questions or discrepancies.',
        time: '1:45PM',
        isRead: false,
      },
      {
        id: 4,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'Accommodation Assigned',
        preview:
          'Your accommodation request has been processed and approved. You have been assigned to Building B...',
        message:
          'Your accommodation request has been processed and approved. You have been assigned to Building B, Room 105. The accommodation includes all necessary amenities and utilities. Please report to the accommodation office to collect your keys and complete the check-in process.',
        time: '1:45PM',
        isRead: false,
      },
      {
        id: 5,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'Promotion Approved',
        preview:
          'The promotion request placed by your head of department on the 20th of July for the position of so...',
        message:
          'The promotion request placed by your head of department on the 20th of July for the position of Team Lead was approved by the admin. Please find attached your promotion letter.',
        time: '1:45PM',
        isRead: false,
      },
      {
        id: 6,
        sender: 'Admin',
        profileImage: './assets/svg/profilePix.svg',
        subject: 'Promotion Approved',
        preview:
          'The promotion request placed by your head of department on the 18th of July for the position of so...',
        message:
          'The promotion request placed by your head of department on the 18th of July for the position of Project Manager was approved by the admin. Please find attached your promotion letter.',
        time: '1:45PM',
        isRead: false,
      },
    ];
  }

  private getDefaultNotifications(): NotificationItem[] {
    return [
      {
        id: 1,
        worker: {
          name: 'Jane Adesanya',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Promotion Request',
        message:
          'submitted a promotion request with detailed explanation about career progression, achievements over the past three years, additional responsibilities taken on, and reasons for requesting advancement in the company hierarchy to',
        targetWorker: 'John Adegoke',
        timestamp: '26-07-2024',
        isRead: false,
      },
      {
        id: 2,
        worker: {
          name: 'Michael Johnson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Leave Request',
        message: 'submitted a leave request for approval to',
        targetWorker: 'John Adegoke',
        timestamp: '27-07-2024',
        isRead: false,
      },
      {
        id: 3,
        worker: {
          name: 'Sarah Williams',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Transfer Request',
        message: 'submitted a transfer request to',
        targetWorker: 'John Adegoke',
        timestamp: '25-07-2024',
        isRead: false,
      },
      {
        id: 4,
        worker: {
          name: 'David Brown',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Sick Leave Request',
        message: 'submitted a sick leave request to',
        targetWorker: 'John Adegoke',
        timestamp: '28-07-2024',
        isRead: false,
      },
      {
        id: 5,
        worker: {
          name: 'Emily Davis',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Annual Leave Request',
        message: 'submitted an annual leave request to',
        targetWorker: 'John Adegoke',
        timestamp: '29-07-2024',
        isRead: false,
      },
      {
        id: 6,
        worker: {
          name: 'Robert Wilson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Overtime Request',
        message: 'submitted an overtime request to',
        targetWorker: 'John Adegoke',
        timestamp: '30-07-2024',
        isRead: false,
      },
      {
        id: 7,
        worker: {
          name: 'Lisa Anderson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Training Request',
        message: 'submitted a training request to',
        targetWorker: 'John Adegoke',
        timestamp: '31-07-2024',
        isRead: false,
      },
      {
        id: 8,
        worker: {
          name: 'James Taylor',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Disciplinary Appeal',
        message: 'submitted a disciplinary appeal to',
        targetWorker: 'John Adegoke',
        timestamp: '01-08-2024',
        isRead: false,
      },
      {
        id: 9,
        worker: {
          name: 'Maria Garcia',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Accommodation Request',
        message: 'submitted an accommodation request to',
        targetWorker: 'John Adegoke',
        timestamp: '02-08-2024',
        isRead: false,
      },
      {
        id: 10,
        worker: {
          name: 'Jane Adesanya',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Promotion Request',
        message: 'submitted a promotion request to',
        targetWorker: 'John Adegoke',
        timestamp: '26-07-2024',
        isRead: true,
      },
    ];
  }

  private loadInboxItemsFromApi(): void {
    this.apiService.get<MessageResponse>('/message').subscribe({
      next: (response) => {
        const inboxItems = this.mapApiMessagesToInboxItems(response.data);
        this.inboxItemsSubject.next(inboxItems);
      },
      error: (error) => {
        console.error('Error loading inbox items:', error);
        // Fallback to default data or handle error appropriately
        this.inboxItemsSubject.next(this.getDefaultInboxItems());
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
        // Fallback to default data or handle error appropriately
        this.notificationsSubject.next(this.getDefaultNotifications());
      },
    });
  }

  markSelectedInboxItemAsRead(itemId: number) {
    this.apiService.put(`/message/`, { messageIds: [itemId] }).subscribe({
      next: () => {
        this.markInboxItemAsRead(itemId);
      },
      error: (error) => {
        console.error('Error marking inbox item as read:', error);
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

  // Common methods
  getUnreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
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

  hasUnreadMessages(): Observable<boolean> {
    return this.getUnreadCount().pipe(map((count) => count > 0));
  }

  // Methods to refresh data from API
  refreshInboxItems(): void {
    this.loadInboxItemsFromApi();
  }

  refreshNotifications(): void {
    this.loadNotificationsFromApi();
  }
}
