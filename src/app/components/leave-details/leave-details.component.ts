import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OnInit } from '@angular/core';
import { FORM_OPTIONS } from '../../shared/constants/form-options';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { EmployeeService } from '../../services/employee.service';
import { AlertService } from '../../services/alert.service';
import { EmployeeDetails } from '../../dto/employee.dto';
import { finalize } from 'rxjs/operators';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  department?: string;
  currentPosition?: string;
}

interface Position {
  label: string;
  value: string;
}

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
  @Input() isPromotion: boolean = false; // New input for promotion mode
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  openSection: string | null = null;
  showConfirmModal: boolean = false;

  // Promotion-specific properties
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  showEmployeeDropdown: boolean = false;
  searchingEmployees: boolean = false;

  positions: Position[] = [
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Pastor', value: 'PASTOR' },
    { label: 'Zonal Pastor', value: 'ZONAL_PASTOR' },
    { label: 'District Pastor', value: 'DISTRICT_PASTOR' },
  ];

  constructor(
    private fileUploadService: FileUploadService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

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
    // Promotion-specific fields
    employeeId: '',
    employeeName: '',
    newPosition: '',
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

  ngOnInit() {
    if (this.isPromotion && this.mode === 'create') {
      this.loadEmployees();
    }
  }

  // Promotion methods
  loadEmployees() {
    this.searchingEmployees = true;
    this.employeeService.getAllEmployees(1, 50).subscribe({
      next: (response) => {
        if (
          response.status === 'success' &&
          response.data &&
          response.data.data
        ) {
          this.employees = response.data.data.map((emp: EmployeeDetails) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            employeeId: emp.employeeId || emp.id.toString(),
            department: emp.departments?.[0]?.name || 'N/A',
            currentPosition: emp.user?.role?.name || 'N/A',
          }));
          this.filteredEmployees = this.employees;
        }
        this.searchingEmployees = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load employees');
        this.searchingEmployees = false;
      },
    });
  }

  onEmployeeSearch(event: any) {
    this.searchTerm = event.target.value;
    this.showEmployeeDropdown = true;

    if (this.searchTerm.length > 0) {
      this.filteredEmployees = this.employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = this.employees.slice(0, 5);
    }
  }

  selectEmployee(employee: Employee) {
    this.formData.employeeId = employee.id.toString();
    this.formData.employeeName = employee.name;
    this.searchTerm = employee.name;
    this.showEmployeeDropdown = false;
  }

  onEmployeeInputBlur() {
    setTimeout(() => {
      this.showEmployeeDropdown = false;
    }, 200);
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

      // Handle promotion submission
      if (this.isPromotion) {
        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          newPosition: this.formData.newPosition,
        };
        this.submit.emit(submissionData);
        return;
      }

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
    // Promotion validation
    if (this.isPromotion) {
      return !!(this.formData.employeeId && this.formData.newPosition);
    }

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
      // Promotion-specific fields
      employeeId: '',
      employeeName: '',
      newPosition: '',
    };
    this.uploadedFiles = [];
  }

  downloadDocument(doc: any) {
    console.log('Download document called with:', doc); // Debug log

    // Try to find the actual download URL
    let downloadUrl = '';
    let filename = 'document';

    if (doc.downloadUrl) {
      downloadUrl = doc.downloadUrl;
      filename = doc.documentName || doc.name || 'document';
    } else if (doc.url) {
      downloadUrl = doc.url;
      filename = doc.name || doc.documentName || 'document';
    } else {
      console.error('No download URL found for document:', doc);
      return;
    }

    console.log(
      'Downloading from URL:',
      downloadUrl,
      'with filename:',
      filename
    ); // Debug log

    // Use the same download logic as uploadFile
    try {
      if (downloadUrl.includes('firebasestorage.googleapis.com')) {
        // Method 1: Try adding download parameter to Firebase URL
        const firebaseDownloadUrl = this.getFirebaseDownloadUrl(
          downloadUrl,
          filename
        );
        const link = document.createElement('a');
        link.href = firebaseDownloadUrl;
        link.target = '_blank';
        link.click();
      } else {
        // Method 2: For other URLs, use fetch and blob
        this.downloadFileViaFetch(downloadUrl, filename);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: Just open in new tab
      window.open(downloadUrl, '_blank');
    }
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
