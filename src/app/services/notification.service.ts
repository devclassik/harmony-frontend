import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface InboxItem {
  id: number;
  sender: string;
  profileImage: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: number;
  user: {
    name: string;
    image: string;
  };
  type: string;
  message: string;
  targetUser: string;
  timestamp: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly INBOX_STORAGE_KEY = 'harmony_inbox_items';
  private readonly NOTIFICATIONS_STORAGE_KEY = 'harmony_notifications';

  private inboxItemsSubject = new BehaviorSubject<InboxItem[]>([]);
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    // Clear localStorage for testing - remove this in production
    localStorage.removeItem(this.NOTIFICATIONS_STORAGE_KEY);
    localStorage.removeItem(this.INBOX_STORAGE_KEY);

    // Load data from localStorage or use default mock data
    this.loadInboxItems();
    this.loadNotifications();

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

    // Save to localStorage whenever items change
    this.saveInboxItems(inboxItems);
    this.saveNotifications(notifications);
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
        time: '1:45PM',
        isRead: false,
      },
    ];
  }

  private getDefaultNotifications(): NotificationItem[] {
    return [
      {
        id: 1,
        user: {
          name: 'Jane Adesanya',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Promotion Request',
        message:
          'submitted a promotion request with detailed explanation about career progression, achievements over the past three years, additional responsibilities taken on, and reasons for requesting advancement in the company hierarchy to',
        targetUser: 'John Adegoke',
        timestamp: '26-07-2024',
        isRead: false,
      },
      {
        id: 2,
        user: {
          name: 'Michael Johnson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Leave Request',
        message: 'submitted a leave request for approval to',
        targetUser: 'John Adegoke',
        timestamp: '27-07-2024',
        isRead: false,
      },
      {
        id: 3,
        user: {
          name: 'Sarah Williams',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Transfer Request',
        message: 'submitted a transfer request to',
        targetUser: 'John Adegoke',
        timestamp: '25-07-2024',
        isRead: false,
      },
      {
        id: 4,
        user: {
          name: 'David Brown',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Sick Leave Request',
        message: 'submitted a sick leave request to',
        targetUser: 'John Adegoke',
        timestamp: '28-07-2024',
        isRead: false,
      },
      {
        id: 5,
        user: {
          name: 'Emily Davis',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Annual Leave Request',
        message: 'submitted an annual leave request to',
        targetUser: 'John Adegoke',
        timestamp: '29-07-2024',
        isRead: false,
      },
      {
        id: 6,
        user: {
          name: 'Robert Wilson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Overtime Request',
        message: 'submitted an overtime request to',
        targetUser: 'John Adegoke',
        timestamp: '30-07-2024',
        isRead: false,
      },
      {
        id: 7,
        user: {
          name: 'Lisa Anderson',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Training Request',
        message: 'submitted a training request to',
        targetUser: 'John Adegoke',
        timestamp: '31-07-2024',
        isRead: false,
      },
      {
        id: 8,
        user: {
          name: 'James Taylor',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Disciplinary Appeal',
        message: 'submitted a disciplinary appeal to',
        targetUser: 'John Adegoke',
        timestamp: '01-08-2024',
        isRead: false,
      },
      {
        id: 9,
        user: {
          name: 'Maria Garcia',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Accommodation Request',
        message: 'submitted an accommodation request to',
        targetUser: 'John Adegoke',
        timestamp: '02-08-2024',
        isRead: false,
      },
      {
        id: 10,
        user: {
          name: 'Jane Adesanya',
          image: './assets/svg/profilePix.svg',
        },
        type: 'Promotion Request',
        message: 'submitted a promotion request to',
        targetUser: 'John Adegoke',
        timestamp: '26-07-2024',
        isRead: true,
      },
    ];
  }

  private loadInboxItems(): void {
    try {
      const savedItems = localStorage.getItem(this.INBOX_STORAGE_KEY);
      if (savedItems) {
        const items = JSON.parse(savedItems);
        this.inboxItemsSubject.next(items);
      } else {
        // First time loading, use default data
        const defaultItems = this.getDefaultInboxItems();
        this.inboxItemsSubject.next(defaultItems);
      }
    } catch (error) {
      console.error('Error loading inbox items from localStorage:', error);
      // Fallback to default items
      const defaultItems = this.getDefaultInboxItems();
      this.inboxItemsSubject.next(defaultItems);
    }
  }

  private loadNotifications(): void {
    try {
      const savedItems = localStorage.getItem(this.NOTIFICATIONS_STORAGE_KEY);
      if (savedItems) {
        const items = JSON.parse(savedItems);
        this.notificationsSubject.next(items);
      } else {
        // First time loading, use default data
        const defaultItems = this.getDefaultNotifications();
        this.notificationsSubject.next(defaultItems);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
      // Fallback to default items
      const defaultItems = this.getDefaultNotifications();
      this.notificationsSubject.next(defaultItems);
    }
  }

  private saveInboxItems(items: InboxItem[]): void {
    try {
      localStorage.setItem(this.INBOX_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving inbox items to localStorage:', error);
    }
  }

  private saveNotifications(items: NotificationItem[]): void {
    try {
      localStorage.setItem(
        this.NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
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
    return new Observable((observer) => {
      this.inboxItemsSubject.subscribe((items) => {
        const unreadCount = items.filter((item) => !item.isRead).length;
        observer.next(unreadCount);
      });
    });
  }

  getUnreadNotificationsCount(): Observable<number> {
    return new Observable((observer) => {
      this.notificationsSubject.subscribe((items) => {
        const unreadCount = items.filter((item) => !item.isRead).length;
        observer.next(unreadCount);
      });
    });
  }

  hasUnreadMessages(): Observable<boolean> {
    return new Observable((observer) => {
      this.unreadCountSubject.subscribe((count) => {
        observer.next(count > 0);
      });
    });
  }

  // Method to reset items (for testing purposes)
  resetInboxItems(): void {
    const defaultItems = this.getDefaultInboxItems();
    this.inboxItemsSubject.next(defaultItems);
  }

  resetNotifications(): void {
    const defaultItems = this.getDefaultNotifications();
    this.notificationsSubject.next(defaultItems);
  }
}
