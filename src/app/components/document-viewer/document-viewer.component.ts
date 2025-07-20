import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TableData } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-200"
        >
          <div class="flex items-center gap-3">
            <div
              [class]="getFileIconClass(document?.documentType || '')"
              class="w-10 h-10 rounded-lg flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ document?.documentName }}
              </h2>
              <p class="text-sm text-gray-500">
                {{ document?.documentType }} •
                {{ formatUploadDate(document?.date) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Download Button -->
            <button
              (click)="onDownload()"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>

            <!-- Zoom Out -->
            <button
              (click)="zoomOut()"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <!-- Zoom Level -->
            <span class="text-sm text-gray-600 min-w-[3rem] text-center"
              >{{ zoomLevel }}%</span
            >

            <!-- Zoom In -->
            <button
              (click)="zoomIn()"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>

            <!-- Close Button -->
            <button
              (click)="onClose()"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              title="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Document Content -->
        <div class="flex-1 overflow-auto bg-gray-100 p-4">
          <div class="h-full">
            <div
              class="bg-white shadow-lg h-full"
              [style.transform]="'scale(' + zoomLevel / 100 + ')'"
              [style.transform-origin]="'top center'"
            >
              <!-- PDF Viewer -->
              <div *ngIf="isPDF()" class="w-full">
                <iframe
                  [src]="getSafeDocumentUrl()"
                  class="w-full h-[800px] border-0"
                  title="Document Viewer"
                ></iframe>
              </div>

              <!-- Image Viewer -->
              <div *ngIf="isImage()" class="p-4">
                <img
                  [src]="getSafeDocumentUrl()"
                  [alt]="document?.documentName"
                  class="max-w-full h-auto"
                />
              </div>

              <!-- Video Viewer -->
              <div *ngIf="isVideo()" class="p-4">
                <video
                  [src]="getSafeDocumentUrl()"
                  controls
                  class="max-w-full h-auto"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <!-- Text Document Preview -->
              <div *ngIf="isTextDocument()" class="w-full h-full">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">
                    {{ document?.documentName }}
                  </h3>
                  <div class="flex gap-2">
                    <button
                      (click)="onDownload()"
                      class="bg-[#12C16F] text-white px-3 py-1 rounded hover:bg-[#0ea860] transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <!-- Office Online Preview -->
                <iframe
                  [src]="getOfficeOnlineEmbedUrl()"
                  class="w-full h-full min-h-[600px] border border-gray-200 rounded"
                  title="Office Online Preview"
                  frameborder="0"
                ></iframe>
              </div>

              <!-- Spreadsheet Preview -->
              <div *ngIf="isSpreadsheet()" class="w-full h-full">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">
                    {{ document?.documentName }}
                  </h3>
                  <div class="flex gap-2">
                    <button
                      (click)="onDownload()"
                      class="bg-[#12C16F] text-white px-3 py-1 rounded hover:bg-[#0ea860] transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <!-- Office Online Preview -->
                <iframe
                  [src]="getOfficeOnlineEmbedUrl()"
                  class="w-full h-full min-h-[600px] border border-gray-200 rounded"
                  title="Office Online Preview"
                  frameborder="0"
                ></iframe>
              </div>

              <!-- Presentation Preview -->
              <div *ngIf="isPresentation()" class="w-full h-full">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">
                    {{ document?.documentName }}
                  </h3>
                  <div class="flex gap-2">
                    <button
                      (click)="onDownload()"
                      class="bg-[#12C16F] text-white px-3 py-1 rounded hover:bg-[#0ea860] transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>

                <!-- Office Online Preview -->
                <iframe
                  [src]="getOfficeOnlineEmbedUrl()"
                  class="w-full h-full min-h-[600px] border border-gray-200 rounded"
                  title="Office Online Preview"
                  frameborder="0"
                ></iframe>
              </div>

              <!-- Document Preview for unsupported types or when URL is not available -->
              <div
                *ngIf="!canPreviewDirectly() || !getDocumentUrl()"
                class="p-8 text-center"
              >
                <div
                  [class]="getFileIconClass(document?.documentType || '')"
                  class="w-24 h-24 mx-auto mb-4 rounded-lg flex items-center justify-center"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path
                      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ document?.documentName }}
                </h3>
                <p class="text-gray-600 mb-4">
                  {{ document?.documentType }} Document
                </p>
                <p class="text-sm text-gray-500 mb-6" *ngIf="!getDocumentUrl()">
                  Document URL is not available for preview.
                </p>
                <p
                  class="text-sm text-gray-500 mb-6"
                  *ngIf="getDocumentUrl() && !canPreviewDirectly()"
                >
                  This document type ({{ document?.documentType }}) cannot be
                  previewed directly in the browser.
                </p>
                <button
                  (click)="onDownload()"
                  class="bg-[#12C16F] text-white px-6 py-2 rounded-lg hover:bg-[#0ea860] transition-colors"
                  [disabled]="!getDocumentUrl()"
                  [class.opacity-50]="!getDocumentUrl()"
                  [class.cursor-not-allowed]="!getDocumentUrl()"
                >
                  <span *ngIf="getDocumentUrl()">Download to View</span>
                  <span *ngIf="!getDocumentUrl()">URL Not Available</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer with document info -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between text-sm text-gray-600">
            <div class="flex items-center gap-4">
              <span>Document ID: {{ document?.id }}</span>
              <span>•</span>
              <span>Uploaded: {{ formatUploadDate(document?.date) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span
                [class]="getFileTypeClass(document?.documentType || '')"
                class="px-2 py-1 text-xs font-medium rounded"
              >
                {{ document?.documentType }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class DocumentViewerComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() document: TableData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() download = new EventEmitter<TableData>();

  zoomLevel: number = 100;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['document'] && changes['document'].currentValue) {
      // Reset zoom when document changes
      this.zoomLevel = 100;
    }
  }

  onClose() {
    this.close.emit();
  }

  onDownload() {
    if (this.document) {
      this.download.emit(this.document);
    }
  }

  openInNewTab() {
    const url = this.getDocumentUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  openInGoogleDocs() {
    const url = this.getDocumentUrl();
    if (url) {
      // Google Docs viewer URL
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        url
      )}&embedded=true`;
      window.open(googleDocsUrl, '_blank');
    }
  }

  openInOfficeOnline() {
    const url = this.getDocumentUrl();
    if (url) {
      // Microsoft Office Online viewer URL
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
      window.open(officeUrl, '_blank');
    }
  }

  getGoogleDocsEmbedUrl(): SafeResourceUrl {
    const url = this.getDocumentUrl();
    if (url) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        url
      )}&embedded=true`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsUrl);
    }
    return '';
  }

  getOfficeOnlineEmbedUrl(): SafeResourceUrl {
    const url = this.getDocumentUrl();
    if (url) {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
      )}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(officeUrl);
    }
    return '';
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  zoomIn() {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 25;
    }
  }

  zoomOut() {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 25;
    }
  }

  isPDF(): boolean {
    return this.document?.documentType?.toUpperCase() === 'PDF';
  }

  isImage(): boolean {
    const imageTypes = ['JPG', 'JPEG', 'PNG', 'GIF', 'BMP'];
    return imageTypes.includes(
      this.document?.documentType?.toUpperCase() || ''
    );
  }

  isVideo(): boolean {
    const videoTypes = ['MP4', 'AVI', 'MOV', 'WMV', 'FLV'];
    return videoTypes.includes(
      this.document?.documentType?.toUpperCase() || ''
    );
  }

  isTextDocument(): boolean {
    const textTypes = ['DOC', 'DOCX', 'TXT', 'RTF'];
    return textTypes.includes(this.document?.documentType?.toUpperCase() || '');
  }

  isSpreadsheet(): boolean {
    const spreadsheetTypes = ['XLS', 'XLSX', 'CSV'];
    return spreadsheetTypes.includes(
      this.document?.documentType?.toUpperCase() || ''
    );
  }

  isPresentation(): boolean {
    const presentationTypes = ['PPT', 'PPTX'];
    return presentationTypes.includes(
      this.document?.documentType?.toUpperCase() || ''
    );
  }

  canPreviewDirectly(): boolean {
    return (
      this.isPDF() ||
      this.isImage() ||
      this.isVideo() ||
      this.isTextDocument() ||
      this.isSpreadsheet() ||
      this.isPresentation()
    );
  }

  getDocumentUrl(): string {
    if (!this.document || !this.document.downloadUrl) {
      return '';
    }

    // If the URL is already absolute, use it directly
    if (
      this.document.downloadUrl.startsWith('http://') ||
      this.document.downloadUrl.startsWith('https://')
    ) {
      return this.document.downloadUrl;
    } else {
      // If it's a relative URL, construct the full URL
      // Remove /api/v1 from the base URL since file URLs are typically served from the root
      const baseUrl = 'https://harmoney-backend.onrender.com';
      return `${baseUrl}${this.document.downloadUrl}`;
    }
  }

  getSafeDocumentUrl(): SafeResourceUrl | string {
    const url = this.getDocumentUrl();
    if (!url) {
      return '';
    }

    // Sanitize the URL to make it safe for use in resource contexts
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getFileTypeClass(fileType: string): string {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-100 text-blue-800';
      case 'XLS':
      case 'XLSX':
        return 'bg-green-100 text-green-800';
      case 'PPT':
      case 'PPTX':
        return 'bg-orange-100 text-orange-800';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
        return 'bg-purple-100 text-purple-800';
      case 'MP4':
      case 'AVI':
      case 'MOV':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getFileIconClass(fileType: string): string {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'bg-red-500';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-500';
      case 'XLS':
      case 'XLSX':
        return 'bg-green-500';
      case 'PPT':
      case 'PPTX':
        return 'bg-orange-500';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
        return 'bg-purple-500';
      case 'MP4':
      case 'AVI':
      case 'MOV':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  }

  formatUploadDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'Date not available';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      // Format the date
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Return relative time for recent uploads
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return `${formattedDate} at ${formattedTime}`;
      }
    } catch (error) {
      return 'Date not available';
    }
  }
}
