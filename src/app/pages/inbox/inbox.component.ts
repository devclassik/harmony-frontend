import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  InboxItem,
} from '../../services/notification.service';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { TableData } from '../../interfaces/employee.interface';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { Subscription } from 'rxjs';

interface Attachment {
  name: string;
  size: string;
  type: string;
  url: string;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, DocumentViewerComponent, ClickOutsideDirective],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css',
})
export class InboxComponent implements OnInit, OnDestroy {
  selectedItem: number | null = null;
  inboxItems: InboxItem[] = [];
  filteredItems: InboxItem[] = [];
  unreadCount: number = 0;
  showDocumentPreview: boolean = false;
  selectedAttachment: Attachment | null = null;
  selectedDocumentData: TableData | null = null;
  showFilterDropdown: boolean = false;
  currentFilter: 'all' | 'unread' | 'recent' | 'oldest' = 'all';

  private subscriptions: Subscription[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    // Subscribe to inbox items
    this.subscriptions.push(
      this.notificationService.getInboxItems().subscribe((items) => {
        this.inboxItems = items;
        this.applyFilter();
      })
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe((count) => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  selectItem(itemId: number) {
    this.selectedItem = itemId;
    // Mark item as read using the service
    this.notificationService.markInboxItemAsRead(itemId);
  }

  goBack() {
    this.selectedItem = null;
  }

  getSelectedItem(): InboxItem | undefined {
    return this.filteredItems.find((item) => item.id === this.selectedItem);
  }

  getSelectedItemIndex(): number {
    if (!this.selectedItem) return 0;
    const index = this.filteredItems.findIndex(
      (item) => item.id === this.selectedItem
    );
    return index + 1;
  }

  hasPrevious(): boolean {
    if (!this.selectedItem) return false;
    const currentIndex = this.filteredItems.findIndex(
      (item) => item.id === this.selectedItem
    );
    return currentIndex > 0;
  }

  hasNext(): boolean {
    if (!this.selectedItem) return false;
    const currentIndex = this.filteredItems.findIndex(
      (item) => item.id === this.selectedItem
    );
    return currentIndex < this.filteredItems.length - 1;
  }

  selectPrevious() {
    if (!this.hasPrevious()) return;
    const currentIndex = this.filteredItems.findIndex(
      (item) => item.id === this.selectedItem
    );
    const previousItem = this.filteredItems[currentIndex - 1];
    this.selectItem(previousItem.id);
  }

  selectNext() {
    if (!this.hasNext()) return;
    const currentIndex = this.filteredItems.findIndex(
      (item) => item.id === this.selectedItem
    );
    const nextItem = this.filteredItems[currentIndex + 1];
    this.selectItem(nextItem.id);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  hasAttachments(): boolean {
    // Show attachments for promotion-related messages
    const item = this.getSelectedItem();
    return item?.subject.toLowerCase().includes('promotion') || false;
  }

  getAttachments(): Attachment[] {
    const item = this.getSelectedItem();
    if (!item || !this.hasAttachments()) return [];

    return [
      {
        name: 'Promotion Letter',
        size: '245 KB',
        type: 'PDF',
        url: '/assets/documents/promotion-letter.pdf',
      },
      {
        name: 'Promotion Letter',
        size: '245 KB',
        type: 'PDF',
        url: '/assets/documents/promotion-letter-2.pdf',
      },
    ];
  }

  downloadAttachment(attachment: Attachment) {
    // Create a simple text file download for demonstration
    const content = `${attachment.name}\n\nThis is a sample ${
      attachment.type
    } document for ${
      this.getSelectedItem()?.subject
    }.\n\nGenerated on: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${attachment.name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  viewAttachment(attachment: Attachment) {
    // Convert attachment to TableData format for the document viewer
    this.selectedDocumentData = {
      id: Date.now().toString(), // Generate a temporary ID as string
      documentName: attachment.name,
      documentType: attachment.type,
      date: this.getCurrentDate(),
      status: 'Active',
    };
    this.showDocumentPreview = true;
  }

  closeDocumentPreview() {
    this.showDocumentPreview = false;
    this.selectedDocumentData = null;
  }

  onDocumentDownload(doc: TableData) {
    // Create a simple text file download for demonstration
    const content = `${doc.documentName}\n\nThis is a sample ${
      doc.documentType
    } document for ${
      this.getSelectedItem()?.subject
    }.\n\nGenerated on: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.documentName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }

  getSelectedItemTitle(): string {
    const item = this.inboxItems.find((item) => item.id === this.selectedItem);
    return item ? item.subject : '';
  }

  getSelectedItemContent(): string {
    const content: { [key: number]: string } = {
      1: 'The promotion request placed by your head of department for the position of zonal pastor on the 25th of July 2024 was approved by the admin. Please find attached your promotion letter.',
      2: 'Your accommodation request has been processed and approved. You have been assigned to Building A, Room 204. The accommodation includes all necessary amenities and utilities. Please report to the accommodation office to collect your keys and complete the check-in process.',
      3: 'Your May 2024 paystub is now available for download. This includes your salary, allowances, and deductions for the month. Please review the document and contact payroll if you have any questions or discrepancies.',
      4: 'Your accommodation request has been processed and approved. You have been assigned to Building B, Room 105. The accommodation includes all necessary amenities and utilities. Please report to the accommodation office to collect your keys and complete the check-in process.',
      5: 'The promotion request placed by your head of department for the position of Team Lead on the 20th of July 2024 was approved by the admin. Please find attached your promotion letter.',
      6: 'The promotion request placed by your head of department for the position of Project Manager on the 18th of July 2024 was approved by the admin. Please find attached your promotion letter.',
    };
    return content[this.selectedItem!] || '';
  }

  applyFilter() {
    let filtered = [...this.inboxItems];

    switch (this.currentFilter) {
      case 'unread':
        filtered = filtered.filter((item) => !item.isRead);
        break;
      case 'recent':
        // Sort by most recent (you can customize this logic based on actual timestamp)
        filtered = filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        // Sort by oldest
        filtered = filtered.sort((a, b) => a.id - b.id);
        break;
      default:
        // 'all' - no additional filtering, but sort by recent as default
        filtered = filtered.sort((a, b) => b.id - a.id);
        break;
    }

    this.filteredItems = filtered;
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectFilter(filter: 'all' | 'unread' | 'recent' | 'oldest') {
    this.currentFilter = filter;
    this.applyFilter();
    this.showFilterDropdown = false;
  }

  getFilterLabel(): string {
    switch (this.currentFilter) {
      case 'unread':
        return 'Unread';
      case 'recent':
        return 'Recent';
      case 'oldest':
        return 'Oldest';
      default:
        return 'All';
    }
  }
}
