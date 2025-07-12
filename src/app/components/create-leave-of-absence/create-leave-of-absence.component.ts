import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { FileUploadService } from '../../shared/services/file-upload.service';

@Component({
  selector: 'app-create-leave-of-absence',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-leave-of-absence.component.html',
  styleUrl: './create-leave-of-absence.component.css',
})
export class CreateLeaveOfAbsenceComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Create Leave of Absence Request';
  @Input() subtitle: string = 'Leave of Absence Information';
  @Input() reasonPlaceholder: string =
    'Enter your reason for leave of absence...';
  @Input() confirmText: string =
    'Are you sure you want to create this leave of absence request?';
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;

  constructor(private fileUploadService: FileUploadService) {}

  formData = {
    requestType: '',
    startDate: '',
    duration: {
      value: 1,
      unit: 'Days',
    },
    location: '',
    reason: '',
  };

  // Track uploaded files with progress
  uploadedFiles: {
    name: string;
    size: number;
    file: File;
    uploadStatus: 'uploading' | 'completed' | 'error';
    progress: number;
    url?: string;
  }[] = [];

  requestTypes = [
    'Personal',
    'Sabbatical',
    'Family Emergency',
    'Medical',
    'Educational',
  ];
  durationUnits = ['Days', 'Weeks', 'Months', 'Years'];

  onCancel() {
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.showConfirmModal = true;
    }
  }

  onConfirmSubmit(confirmed: boolean) {
    if (confirmed) {
      // Get URLs from successfully uploaded files
      const fileUrls = this.uploadedFiles
        .filter((file) => file.uploadStatus === 'completed' && file.url)
        .map((file) => file.url!);

      const submissionData = {
        ...this.formData,
        duration: `${this.formData.duration.value} ${this.formData.duration.unit}`,
        documentUrls: fileUrls,
      };
      this.submitted.emit(submissionData);
      this.resetForm();
      this.close.emit();
    }
    this.showConfirmModal = false;
  }

  onConfirmCancel() {
    this.showConfirmModal = false;
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];

    files.forEach((file) => {
      // Validate file
      const validation = this.fileUploadService.validateFile(file);
      if (!validation.isValid) {
        console.error(validation.error);
        return;
      }

      // Add file to uploaded files with initial status
      const uploadedFile: {
        name: string;
        size: number;
        file: File;
        uploadStatus: 'uploading' | 'completed' | 'error';
        progress: number;
        url?: string;
      } = {
        name: file.name,
        size: file.size,
        file: file,
        uploadStatus: 'uploading',
        progress: 0,
      };

      this.uploadedFiles.push(uploadedFile);

      // Start upload immediately
      this.fileUploadService.uploadSingleFileWithProgress(file).subscribe({
        next: (event) => {
          if (event.progress !== undefined) {
            // Update progress
            uploadedFile.progress = event.progress;
          }
          if (event.response) {
            // Upload completed
            uploadedFile.uploadStatus = 'completed';
            uploadedFile.progress = 100;
            uploadedFile.url = event.response.file;
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
          uploadedFile.uploadStatus = 'error';
          uploadedFile.progress = 0;
        },
      });
    });

    // Clear the input
    event.target.value = '';
  }

  removeFile(index: number) {
    const file = this.uploadedFiles[index];

    // If file has a URL (successfully uploaded), call delete API
    if (file.url) {
      console.log('Deleting file from server:', file.url);

      this.fileUploadService.deleteFile(file.url).subscribe({
        next: (response) => {
          console.log('File deleted successfully:', response);
          // Remove from local array after successful deletion
          this.uploadedFiles.splice(index, 1);
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          // Still remove from local array even if server deletion fails
          // This prevents orphaned references in the UI
          this.uploadedFiles.splice(index, 1);
        },
      });
    } else {
      // File not uploaded yet or no URL, just remove from local array
      this.uploadedFiles.splice(index, 1);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.requestType &&
      this.formData.startDate &&
      this.formData.duration.value &&
      this.formData.location &&
      this.formData.reason
    );
  }

  private resetForm() {
    this.formData = {
      requestType: '',
      startDate: '',
      duration: {
        value: 1,
        unit: 'Days',
      },
      location: '',
      reason: '',
    };
    this.uploadedFiles = [];
  }

  // Helper method to get file type icon
  getFileTypeIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'txt':
        return 'text';
      default:
        return 'file';
    }
  }

  // Helper method to get file type color
  getFileTypeColor(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'text-red-600 bg-red-100';
      case 'doc':
      case 'docx':
        return 'text-blue-600 bg-blue-100';
      case 'xls':
      case 'xlsx':
        return 'text-green-600 bg-green-100';
      case 'txt':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Download uploaded file
  downloadFile(file: any) {
    console.log('Download file called with:', file); // Debug log

    if (file.url) {
      try {
        // Ensure we have a valid filename
        const filename = file.name || 'downloaded-file';
        console.log('Downloading file:', filename, 'from URL:', file.url); // Debug log

        // For Firebase storage URLs, we need to handle CORS properly
        if (file.url.includes('firebasestorage.googleapis.com')) {
          // Method 1: Try adding download parameter to Firebase URL
          const downloadUrl = this.getFirebaseDownloadUrl(file.url, filename);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.click();
        } else {
          // Method 2: For other URLs, use fetch and blob
          this.downloadFileViaFetch(file.url, filename);
        }
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback: Just open in new tab
        window.open(file.url, '_blank');
      }
    } else {
      console.error('No URL found for file:', file);
    }
  }

  // Helper method to create Firebase download URL with proper filename
  private getFirebaseDownloadUrl(url: string, filename: string): string {
    try {
      const urlObj = new URL(url);
      // Add response-content-disposition parameter to force download with correct filename
      urlObj.searchParams.set(
        'response-content-disposition',
        `attachment; filename="${filename}"`
      );
      return urlObj.toString();
    } catch (error) {
      console.error('Error creating download URL:', error);
      return url;
    }
  }

  // Alternative download method using fetch
  private async downloadFileViaFetch(url: string, filename: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Fetch download failed:', error);
      // Fallback: Just open in new tab
      window.open(url, '_blank');
    }
  }

  // Preview file (for PDFs and images)
  previewFile(file: any) {
    if (file.url) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') {
        // Open PDF in new tab
        window.open(file.url, '_blank');
      } else {
        // For other files, just download
        this.downloadFile(file);
      }
    }
  }
}
