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
        class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
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
                {{ document?.documentType }} • {{ document?.date }}
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
          <div class="flex justify-center">
            <div
              class="bg-white shadow-lg"
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

              <!-- Document Preview for other types or when URL is not available -->
              <div
                *ngIf="(!isPDF() && !isImage()) || !getDocumentUrl()"
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
                  *ngIf="getDocumentUrl() && !isPDF() && !isImage()"
                >
                  This document type cannot be previewed directly.
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
              <span>Uploaded: {{ document?.date }}</span>
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

  getDocumentUrl(): string {
    if (!this.document || !this.document.downloadUrl) {
      return '';
    }

    // Use the actual download URL from the API response
    return this.document.downloadUrl;
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
}
