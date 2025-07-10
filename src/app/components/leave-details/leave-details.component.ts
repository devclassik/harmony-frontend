import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { FORM_OPTIONS } from '../../shared/constants/form-options';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { finalize } from 'rxjs/operators';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-leave-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './leave-details.component.html',
  styleUrl: './leave-details.component.css',
})
export class LeaveDetailsComponent implements OnInit {
  @Input() view: boolean = false;
  @Input() leaveData: any = {};
  @Input() title: string = 'Leave Details';
  @Input() leaveType: string = 'Leave';
  @Input() totalLeaveDays: number = 30;
  @Input() showRequestType: boolean = false;
  @Input() showDuration: boolean = false;
  @Input() showLocation: boolean = false;
  @Input() showEndDate: boolean = true;
  @Input() showSubstitution: boolean = true;
  @Input() showAttendees: boolean = false;
  @Input() showDocuments: boolean = false;
  @Input() isCampMeeting: boolean = false;
  @Input() data: any;
  @Input() mode: 'view' | 'create' = 'view';
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  openSection: string | null = null;
  showConfirmModal: boolean = false;

  constructor(private fileUploadService: FileUploadService) {}

  // Add form data structure for create mode
  formData = {
    requestType: '',
    startDate: '',
    endDate: '',
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

  requestTypes = FORM_OPTIONS.leaveRequestTypes;
  durationUnits = FORM_OPTIONS.leaveDurationUnits;

  ngOnInit(): void {
    // Initialize component
  }

  get currentLeaveDuration(): number {
    // Use the actual duration from the current leave request
    return this.leaveData.currentLeaveDuration || this.daysTaken;
  }

  get currentLeaveDurationUnit(): string {
    // Use the actual duration unit from the current leave request
    return this.leaveData.currentLeaveDurationUnit || 'days';
  }

  get daysRemaining(): number {
    // Use dynamic data from leaveData if available, otherwise fallback to calculation
    if (this.leaveData.remainingLeaveDays !== undefined) {
      return this.leaveData.remainingLeaveDays;
    }

    // Fallback calculation for backward compatibility
    const usedDays = this.calculateUsedDays();
    return this.totalLeaveDays - usedDays;
  }

  get totalDaysForYear(): number {
    // Use dynamic data from leaveData if available, otherwise use input
    return this.leaveData.totalLeaveDays || this.totalLeaveDays;
  }

  get usedDaysThisYear(): number {
    // Use dynamic data from leaveData if available, otherwise calculate
    if (this.leaveData.usedLeaveDays !== undefined) {
      return this.leaveData.usedLeaveDays;
    }

    // Fallback calculation for backward compatibility
    return this.calculateUsedDays();
  }

  get leaveHistoryRecords(): any[] {
    // Use dynamic data from leaveData if available, otherwise return empty array
    return this.leaveData.leaveHistory || [];
  }

  get daysTaken(): number {
    if (
      !this.leaveData.startDate ||
      (!this.leaveData.endDate && !this.leaveData.duration)
    )
      return 0;

    if (this.leaveData.duration) {
      // Parse duration like "1 Week", "2 Months", etc.
      const durationStr = this.leaveData.duration.toLowerCase();
      const match = durationStr.match(/(\d+)\s*(day|week|month|year)s?/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case 'day':
            return value;
          case 'week':
            return value * 7;
          case 'month':
            return value * 30;
          case 'year':
            return value * 365;
          default:
            return 0;
        }
      }
      return 0;
    }

    // Fallback to date calculation
    const startDate = new Date(this.leaveData.startDate);
    const endDate = new Date(this.leaveData.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff;
  }

  private calculateUsedDays(): number {
    // For now, we'll use the current leave request days
    // In a real app, you'd sum all approved leave requests for the year
    return this.daysTaken;
  }

  onClose() {
    this.close.emit();
  }

  // New methods for create mode
  onCancel() {
    if (this.mode === 'create') {
      this.cancel.emit();
    } else {
      this.close.emit();
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.showConfirmModal = true;
    }
  }

  onConfirmSubmit(confirmed: boolean) {
    if (confirmed) {
      this.showConfirmModal = false;

      // Handle submission based on leave type
      if (this.showEndDate && !this.showDuration) {
        // Annual leave - use start date, end date, and reason
        const submissionData = {
          startDate: this.formData.startDate,
          endDate: this.formData.endDate,
          reason: this.formData.reason,
        };
        this.submit.emit(submissionData);
      } else {
        // Leave of absence or sick leave - use duration, location, etc.
        const calculatedDuration = this.calculateDurationInDays(
          this.formData.duration.value,
          this.formData.duration.unit
        );

        // Get URLs from successfully uploaded files
        const fileUrls = this.uploadedFiles
          .filter((file) => file.uploadStatus === 'completed' && file.url)
          .map((file) => file.url!);

        const submissionData = {
          requestType: this.formData.requestType,
          startDate: this.formData.startDate,
          endDate: this.formData.endDate,
          durationUnit: this.formData.duration.unit,
          duration: calculatedDuration,
          location: this.formData.location,
          reason: this.formData.reason,
          leaveNotesUrls: fileUrls,
        };

        console.log('Submitting leave request:', submissionData);
        console.log(
          `Duration: ${this.formData.duration.value} ${this.formData.duration.unit} = ${calculatedDuration} days`
        );
        console.log('File URLs:', fileUrls);

        this.submit.emit(submissionData);
      }
    } else {
      this.showConfirmModal = false;
    }
  }

  onConfirmCancel() {
    this.showConfirmModal = false;
  }

  // Calculate duration in days based on the selected unit
  calculateDurationInDays(value: number, unit: string): number {
    switch (unit.toLowerCase()) {
      case 'days':
        return value;
      case 'weeks':
        return value * 7;
      case 'months':
        return value * 30; // Approximate month as 30 days
      case 'years':
        return value * 365; // Approximate year as 365 days
      default:
        return value;
    }
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
            uploadedFile.url = event.response.data.url;
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
    this.uploadedFiles.splice(index, 1);
  }

  isFormValid(): boolean {
    // Base validation - always required
    if (!this.formData.startDate || !this.formData.reason) {
      return false;
    }

    // Annual leave validation (uses end date instead of duration)
    if (this.showEndDate && !this.showDuration) {
      return !!this.formData.endDate;
    }

    // Leave of absence/sick leave validation
    let isValid = true;

    if (this.showRequestType) {
      isValid = isValid && !!this.formData.requestType;
    }

    if (this.showDuration) {
      isValid = isValid && !!this.formData.duration.value;
    }

    if (this.showLocation) {
      isValid = isValid && !!this.formData.location;
    }

    return isValid;
  }

  get confirmationText(): string {
    if (this.showEndDate && !this.showDuration) {
      return `Are you sure you want to create this ${this.leaveType.toLowerCase()} request?`;
    }
    return `Are you sure you want to create this ${this.leaveType.toLowerCase()} request?`;
  }

  resetForm() {
    this.formData = {
      requestType: '',
      startDate: '',
      endDate: '',
      duration: {
        value: 1,
        unit: 'Days',
      },
      location: '',
      reason: '',
    };
    this.uploadedFiles = [];
  }

  downloadDocument(doc: any) {
    const content = `Document: ${doc.documentName}\nSize: ${doc.size}\nDate: ${doc.date}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.documentName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
