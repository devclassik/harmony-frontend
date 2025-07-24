import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FORM_OPTIONS } from '../../shared/constants/form-options';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { AlertService } from '../../services/alert.service';
import { EmployeeDetails } from '../../dto/employee.dto';
import { finalize } from 'rxjs/operators';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

interface Employee {
  id: number;
  name: string;
  employeeId: string;
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
export class LeaveDetailsComponent implements OnInit, OnChanges {
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
  @Input() isDiscipline: boolean = false; // New input for discipline mode
  @Input() isTransfer: boolean = false;
  @Input() isRetirement: boolean = false; // New input for retirement mode
  @Input() isRetrenchment: boolean = false; // New input for retrenchment mode
  @Input() isDocument: boolean = false; // New input for document mode
  @Input() isEditMode: boolean = false; // New input for edit mode
  @Input() canEdit: boolean = false; // New input for edit permissions
  @Input() selectedMeetingData: any = null; // New input for meeting data
  @Input() isAddEmployee: boolean = false; // New input for add employee mode
  @Input() preFilledEmployeeData: any = null; // New input for pre-filled employee data in edit mode
  @Input() isPermission: boolean = false; // New input for permission mode
  @Input() permissionData: any = null; // New input for permission data
  @Input() isAccommodation: boolean = false; // New input for accommodation mode
  @Input() preFilledAccommodationData: any = null; // New input for pre-filled accommodation data in edit mode
  @Output() close = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  openSection: string | null = null;
  showConfirmModal: boolean = false;

  // Permission-specific properties
  showPermissionInfo = true;

  // Promotion-specific properties
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';
  showEmployeeDropdown: boolean = false;
  searchingEmployees: boolean = false;

  // Retirement-specific properties
  filteredReplacementEmployees: Employee[] = [];
  replacementSearchTerm: string = '';
  showReplacementDropdown: boolean = false;
  searchingReplacementEmployees: boolean = false;

  // Camp Meeting attendee properties
  selectedAttendees: Employee[] = [];

  positions: Position[] = [
    { label: 'Pastor', value: 'PASTOR' },
    { label: 'Senior Pastor', value: 'SENIOR_PASTOR' },
    { label: 'Cleaner', value: 'CLEANER' },
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Overseer', value: 'OVERSEER' },
  ];

  disciplineTypes: Position[] = [
    { label: 'Verbal', value: 'VERBAL' },
    { label: 'Written', value: 'WRITTEN' },
    { label: 'Suspension', value: 'SUSPENSION' },
    { label: 'Termination', value: 'TERMINATION' },
    { label: 'Demotion', value: 'DEMOTION' },
    { label: 'Promotion', value: 'PROMOTION' },
  ];

  transferTypes: Position[] = [
    { label: 'Internal Transfer', value: 'INTERNAL' },
    { label: 'External Transfer', value: 'EXTERNAL' },
    { label: 'Department Transfer', value: 'DEPARTMENT' },
    { label: 'Location Transfer', value: 'LOCATION' },
  ];

  retrenchmentTypes: Position[] = [
    { label: 'Pastor', value: 'PASTOR' },
    { label: 'Senior Pastor', value: 'SENIOR_PASTOR' },
    { label: 'Cleaner', value: 'CLEANER' },
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Overseer', value: 'OVERSEER' },
  ];

  // Add Employee-specific options
  departmentOptions: any[] = [];
  roleOptions: Position[] = [
    { label: 'Pastor', value: 'PASTOR' },
    { label: 'Senior Pastor', value: 'SENIOR_PASTOR' },
    { label: 'Cleaner', value: 'CLEANER' },
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Overseer', value: 'OVERSEER' },
  ];
  employmentTypeOptions: Position[] = [
    { label: 'staff', value: 'STAFF' },
    { label: 'volunteer', value: 'VOLUNTEER' },
  ];

  // Accommodation-specific options
  accommodationTypeOptions: Position[] = [
    { label: 'Hotel', value: 'HOTEL' },
    { label: 'Guest House', value: 'GUEST_HOUSE' },
    { label: 'Hostel', value: 'HOSTEL' },
  ];

  constructor(
    private fileUploadService: FileUploadService,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
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
    // Discipline-specific fields
    disciplineType: '',
    // Transfer-specific fields
    transferType: '',
    destination: '',
    // Retirement-specific fields
    recommendedReplacement: '',
    replacementName: '',
    requestDate: '',
    // Retrenchment-specific fields
    retrenchmentType: '',
    // Document-specific fields
    documentName: '',
    downloadUrl: '',
    fileType: '',
    // Camp Meeting-specific fields
    agenda: '',
    attendees: [] as number[],
    // Add Employee-specific fields
    newEmployeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
    role: '',
    employmentType: '',
    employeeLocation: '',
    // Accommodation-specific fields
    accommodationName: '',
    accommodationType: '',
    isPetAllowed: false,
    rooms: [{ name: '', capacity: undefined as any }],
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
    // Removed loadEmployees() call - we now search employees dynamically via API

    // Populate form data if in edit mode
    if (this.isEditMode && this.leaveData) {
      this.populateFormData();
    }

    // Populate form data if pre-filled employee data is provided
    if (this.isAddEmployee && this.preFilledEmployeeData) {
      this.populateEmployeeFormData();
    }

    // Populate form data if pre-filled accommodation data is provided
    if (this.isAccommodation) {
      if (this.preFilledAccommodationData) {
        this.populateAccommodationFormData();
      } else {
        // Reset accommodation form for create mode
        this.resetAccommodationForm();
      }
    }

    // Load departments if in add employee mode
    if (this.isAddEmployee) {
      this.loadDepartments();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if leaveData or isEditMode changed
    if (
      (changes['leaveData'] || changes['isEditMode']) &&
      this.isEditMode &&
      this.leaveData
    ) {
      this.populateFormData();
    }

    // Check if pre-filled employee data changed
    if (
      changes['preFilledEmployeeData'] &&
      this.isAddEmployee &&
      this.preFilledEmployeeData
    ) {
      this.populateEmployeeFormData();
    }

    // Check if pre-filled accommodation data changed
    if (changes['preFilledAccommodationData'] && this.isAccommodation) {
      if (this.preFilledAccommodationData) {
        this.populateAccommodationFormData();
      } else {
        // Reset accommodation form when no pre-filled data (create mode)
        this.resetAccommodationForm();
      }
    }
  }

  // Populate form data from existing data for edit mode
  populateFormData() {
    if (!this.leaveData) return;

    console.log('Populating form data for edit mode:', this.leaveData);

    // For camp meetings
    if (this.isCampMeeting) {
      this.formData.agenda = this.leaveData.agenda || '';

      // Format date for HTML date input (YYYY-MM-DD)
      if (this.leaveData.startDate) {
        const date = new Date(this.leaveData.startDate);
        this.formData.startDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } else {
        this.formData.startDate = '';
      }

      // Handle attendees - they come as objects with id property
      if (this.leaveData.attendees && this.leaveData.attendees.length > 0) {
        // Extract attendee IDs and populate selectedAttendees for display
        this.formData.attendees = this.leaveData.attendees.map(
          (attendee: any) => attendee.id
        );
        this.selectedAttendees = this.leaveData.attendees.map(
          (attendee: any) => ({
            id: attendee.id,
            name: `${attendee.firstName} ${attendee.lastName}`,
            employeeId: attendee.employeeId || attendee.id.toString(),
            currentPosition: attendee.user?.role?.name || 'N/A',
          })
        );
      } else {
        this.formData.attendees = [];
        this.selectedAttendees = [];
      }
    }

    // For other leave types
    else {
      this.formData.requestType = this.leaveData.requestType || '';
      this.formData.startDate = this.leaveData.startDate || '';
      this.formData.endDate = this.leaveData.endDate || '';
      this.formData.reason = this.leaveData.reason || '';
      this.formData.location = this.leaveData.location || '';

      // Handle duration
      if (this.leaveData.duration) {
        const durationStr = this.leaveData.duration.toString();
        const match = durationStr.match(/(\d+)\s*(day|week|month|year)s?/i);
        if (match) {
          this.formData.duration.value = parseInt(match[1]);
          this.formData.duration.unit =
            match[2].charAt(0).toUpperCase() + match[2].slice(1) + 's';
        }
      }

      // Handle specific types
      if (this.isPromotion) {
        this.formData.employeeId = this.leaveData.employeeId?.toString() || '';
        this.formData.employeeName = this.leaveData.employeeName || '';
        this.formData.newPosition = this.leaveData.newPosition || '';
      }

      if (this.isDiscipline) {
        this.formData.employeeId = this.leaveData.employeeId?.toString() || '';
        this.formData.employeeName = this.leaveData.employeeName || '';
        this.formData.disciplineType = this.leaveData.disciplineType || '';
      }

      if (this.isTransfer) {
        this.formData.employeeId = this.leaveData.employeeId?.toString() || '';
        this.formData.employeeName = this.leaveData.employeeName || '';
        this.formData.transferType = this.leaveData.transferType || '';
        this.formData.destination = this.leaveData.destination || '';
        this.formData.newPosition = this.leaveData.newPosition || '';
      }

      if (this.isRetirement) {
        this.formData.employeeId = this.leaveData.employeeId?.toString() || '';
        this.formData.employeeName = this.leaveData.employeeName || '';
        this.formData.recommendedReplacement =
          this.leaveData.recommendedReplacement?.toString() || '';
        this.formData.replacementName = this.leaveData.replacementName || '';
        this.formData.requestDate = this.leaveData.requestDate || '';
        this.formData.destination = this.leaveData.destination || '';
      }

      if (this.isRetrenchment) {
        this.formData.employeeId = this.leaveData.employeeId?.toString() || '';
        this.formData.employeeName = this.leaveData.employeeName || '';
        this.formData.retrenchmentType = this.leaveData.retrenchmentType || '';
      }
    }

    console.log('Final form data after population:', this.formData);
  }

  // Populate employee form data for Add Employee mode
  populateEmployeeFormData() {
    if (!this.preFilledEmployeeData) return;

    console.log('Populating employee form data:', this.preFilledEmployeeData);

    this.formData.newEmployeeId =
      this.preFilledEmployeeData.employeeId ||
      this.preFilledEmployeeData.id?.toString() ||
      '';
    this.formData.firstName = this.preFilledEmployeeData.firstName || '';
    this.formData.lastName = this.preFilledEmployeeData.lastName || '';
    this.formData.email =
      this.preFilledEmployeeData.email ||
      this.preFilledEmployeeData.altEmail ||
      '';
    this.formData.departmentId =
      this.preFilledEmployeeData.departmentId?.toString() || '';
    this.formData.role = this.preFilledEmployeeData.role || '';
    this.formData.employmentType =
      this.preFilledEmployeeData.employmentType || '';
    this.formData.employeeLocation = this.preFilledEmployeeData.location || '';

    console.log('Employee form data populated:', this.formData);
  }

  // Populate accommodation form data for Accommodation mode
  populateAccommodationFormData() {
    if (!this.preFilledAccommodationData) return;

    console.log(
      'Populating accommodation form data:',
      this.preFilledAccommodationData
    );

    this.formData.accommodationName =
      this.preFilledAccommodationData.name || '';
    this.formData.accommodationType =
      this.preFilledAccommodationData.type || 'HOTEL';
    this.formData.isPetAllowed =
      this.preFilledAccommodationData.isPetAllowed || false;
    this.formData.rooms = this.preFilledAccommodationData.rooms?.map(
      (room: any) => ({
        name: room.name || '',
        capacity: room.capacity || 1,
        id: room.id,
      })
    ) || [{ name: '', capacity: 1 }];

    console.log('Accommodation form data populated:', this.formData);
  }

  resetAccommodationForm() {
    console.log('Resetting accommodation form for create mode');

    this.formData.accommodationName = '';
    this.formData.accommodationType = ''; // Empty instead of 'HOTEL'
    this.formData.isPetAllowed = false;
    this.formData.rooms = [{ name: '', capacity: undefined as any }]; // undefined instead of 1

    console.log('Accommodation form reset:', this.formData);
  }

  // Add Employee methods
  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.departmentOptions = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
        this.departmentOptions = [];
      },
    });
  }

  // Promotion methods
  onEmployeeSearch(event: any) {
    this.searchTerm = event.target.value;
    this.showEmployeeDropdown = true;

    if (this.searchTerm.length > 2) {
      // Only search when user has typed at least 3 characters
      this.searchingEmployees = true;
      this.employeeService.searchEmployeesByName(this.searchTerm).subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.filteredEmployees = response.data.map(
              (emp: EmployeeDetails) => ({
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`,
                employeeId: emp.employeeId || emp.id.toString(),
                currentPosition: emp.user?.role?.name || 'N/A',
              })
            );
          } else {
            this.filteredEmployees = [];
          }
          this.searchingEmployees = false;
        },
        error: (error) => {
          console.error('Error searching employees:', error);
          this.filteredEmployees = [];
          this.searchingEmployees = false;
        },
      });
    } else if (this.searchTerm.length === 0) {
      this.filteredEmployees = [];
    }
  }

  // Handle Enter key press for employee search (for camp meeting attendees)
  onEmployeeSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onEmployeeSearch({ target: { value: this.searchTerm } });
    }
  }

  // Handle Enter key press for replacement employee search
  onReplacementSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onReplacementSearch({
        target: { value: this.replacementSearchTerm },
      });
    }
  }

  selectEmployee(employee: Employee) {
    if (this.isCampMeeting && this.mode === 'create') {
      // For camp meeting create mode, add to attendees
      if (!this.selectedAttendees.some((a) => a.id === employee.id)) {
        this.selectedAttendees.push(employee);
        this.formData.attendees.push(employee.id);
      }
      this.searchTerm = '';
      this.filteredEmployees = [];
      this.showEmployeeDropdown = false;
    } else {
      // For other modes, set as selected employee
      this.formData.employeeId = employee.id.toString();
      this.formData.employeeName = employee.name;
      this.searchTerm = employee.name;
      this.showEmployeeDropdown = false;
      this.filteredEmployees = [];
    }
  }

  onEmployeeInputBlur() {
    setTimeout(() => {
      this.showEmployeeDropdown = false;
    }, 200);
  }

  removeAttendee(attendeeId: number) {
    this.selectedAttendees = this.selectedAttendees.filter(
      (a) => a.id !== attendeeId
    );
    this.formData.attendees = this.formData.attendees.filter(
      (id) => id !== attendeeId
    );
  }

  // Retirement-specific methods
  onReplacementSearch(event: any) {
    this.replacementSearchTerm = event.target.value;
    this.showReplacementDropdown = true;

    if (this.replacementSearchTerm.length > 2) {
      this.searchingReplacementEmployees = true;
      this.employeeService
        .searchEmployeesByName(this.replacementSearchTerm)
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              this.filteredReplacementEmployees = response.data.map(
                (emp: EmployeeDetails) => ({
                  id: emp.id,
                  name: `${emp.firstName} ${emp.lastName}`,
                  employeeId: emp.employeeId || emp.id.toString(),
                  currentPosition: emp.user?.role?.name || 'N/A',
                })
              );
            } else {
              this.filteredReplacementEmployees = [];
            }
            this.searchingReplacementEmployees = false;
          },
          error: (error) => {
            console.error('Error searching replacement employees:', error);
            this.filteredReplacementEmployees = [];
            this.searchingReplacementEmployees = false;
          },
        });
    } else if (this.replacementSearchTerm.length === 0) {
      this.filteredReplacementEmployees = [];
    }
  }

  selectReplacementEmployee(employee: Employee) {
    this.formData.recommendedReplacement = employee.id.toString();
    this.formData.replacementName = employee.name;
    this.replacementSearchTerm = employee.name;
    this.showReplacementDropdown = false;
  }

  onReplacementInputBlur() {
    setTimeout(() => {
      this.showReplacementDropdown = false;
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

  togglePermissionInfo() {
    this.showPermissionInfo = !this.showPermissionInfo;
  }

  onEdit() {
    console.log('Edit button clicked');
    this.edit.emit(this.selectedMeetingData);
  }

  onDelete() {
    console.log('Delete button clicked');
    this.delete.emit(this.selectedMeetingData);
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

      // Handle camp meeting submission
      if (this.isCampMeeting && this.mode === 'create') {
        const submissionData = {
          agenda: this.formData.agenda,
          startDate: this.formData.startDate,
          endDate: this.formData.startDate, // Use same date as start date since no end date
          attendees: this.formData.attendees,
        };
        this.submit.emit(submissionData);
        this.resetForm();
        this.close.emit();
        return;
      }

      // Handle promotion submission
      if (this.isPromotion) {
        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          newPosition: this.formData.newPosition,
        };
        this.submit.emit(submissionData);
        this.close.emit();
        return;
      }

      // Handle discipline submission
      if (this.isDiscipline) {
        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          disciplineType: this.formData.disciplineType,
          reason: this.formData.reason,
          duration: this.formData.duration.value,
          durationUnit: this.formData.duration.unit.toUpperCase(),
        };
        this.submit.emit(submissionData);
        this.close.emit();
        return;
      }

      // Handle transfer submission
      if (this.isTransfer) {
        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          newPosition: this.formData.newPosition,
          reason: this.formData.reason,
          destination: this.formData.destination,
          transferType: this.formData.transferType,
        };
        this.submit.emit(submissionData);
        this.close.emit();
        return;
      }

      // Handle retirement submission
      if (this.isRetirement) {
        // Get URLs from successfully uploaded files
        const fileUrls = this.uploadedFiles
          .filter((file) => file.uploadStatus === 'completed' && file.url)
          .map((file) => file.url!);

        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          recommendedReplacement: parseInt(
            this.formData.recommendedReplacement
          ),
          reason: this.formData.reason,
          requestDate: this.formData.requestDate,
          destination: this.formData.destination,
          documents: fileUrls,
        };
        this.submit.emit(submissionData);
        this.close.emit();
        return;
      }

      // Handle retrenchment submission
      if (this.isRetrenchment) {
        const submissionData = {
          employeeId: parseInt(this.formData.employeeId),
          reason: this.formData.reason,
          retrenchmentType: this.formData.retrenchmentType,
        };
        this.submit.emit(submissionData);
        this.close.emit();
        return;
      }

      // Handle document submission
      if (this.isDocument) {
        // Get the uploaded file URL
        const uploadedFile = this.uploadedFiles.find(
          (file) => file.uploadStatus === 'completed'
        );
        if (uploadedFile && uploadedFile.url) {
          const submissionData = {
            name: this.formData.documentName,
            downloadUrl: uploadedFile.url,
            fileType: this.getFileTypeFromFileName(uploadedFile.name),
          };
          this.submit.emit(submissionData);
          this.resetForm();
          this.close.emit();
          return;
        }
      }

      // Handle Add Employee submission
      if (this.isAddEmployee) {
        const submissionData = {
          employeeId: this.formData.newEmployeeId,
          firstName: this.formData.firstName,
          lastName: this.formData.lastName,
          email: this.formData.email,
          departmentId: this.formData.departmentId,
          role: this.formData.role,
          employmentType: this.formData.employmentType,
          location: this.formData.employeeLocation,
        };
        this.submit.emit(submissionData);
        this.resetForm();
        this.close.emit();
        return;
      }

      // Handle Accommodation submission
      if (this.isAccommodation) {
        const submissionData = {
          accommodationName: this.formData.accommodationName,
          accommodationType: this.formData.accommodationType,
          isPetAllowed: this.formData.isPetAllowed,
          rooms: this.formData.rooms,
        };
        this.submit.emit(submissionData);
        this.close.emit();
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
        this.close.emit();
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
        this.close.emit();
      }
    } else {
      this.showConfirmModal = false;
    }
  }

  onConfirmCancel() {
    this.showConfirmModal = false;
  }

  // Accommodation methods
  addRoom() {
    this.formData.rooms.push({ name: '', capacity: 1 });
  }

  removeRoom(index: number) {
    if (this.formData.rooms.length > 1) {
      this.formData.rooms.splice(index, 1);
    }
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
    // Add Employee validation
    if (this.isAddEmployee) {
      return !!(
        this.formData.newEmployeeId &&
        this.formData.firstName &&
        this.formData.lastName &&
        this.formData.email &&
        this.formData.departmentId &&
        this.formData.role &&
        this.formData.employmentType &&
        this.formData.employeeLocation
      );
    }

    // Accommodation validation
    if (this.isAccommodation) {
      return !!(
        this.formData.accommodationName &&
        this.formData.accommodationType &&
        this.formData.rooms.every((room) => room.name && room.capacity > 0)
      );
    }

    // Camp Meeting validation
    if (this.isCampMeeting && this.mode === 'create') {
      return !!(
        this.formData.startDate &&
        this.formData.agenda &&
        this.formData.attendees.length > 0
      );
    }

    // Promotion validation
    if (this.isPromotion) {
      return !!(this.formData.employeeId && this.formData.newPosition);
    }
    if (this.isDiscipline) {
      return !!(this.formData.employeeId && this.formData.disciplineType);
    }
    if (this.isTransfer) {
      return !!(
        this.formData.employeeId &&
        this.formData.transferType &&
        this.formData.newPosition &&
        this.formData.destination &&
        this.formData.reason
      );
    }
    if (this.isRetirement) {
      return !!(
        this.formData.employeeId &&
        this.formData.recommendedReplacement &&
        this.formData.reason
      );
    }
    if (this.isRetrenchment) {
      return !!(
        this.formData.employeeId &&
        this.formData.retrenchmentType &&
        this.formData.reason
      );
    }
    if (this.isDocument) {
      return !!(
        this.formData.documentName &&
        this.uploadedFiles.length > 0 &&
        this.uploadedFiles.some((file) => file.uploadStatus === 'completed')
      );
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
    if (this.isAddEmployee) {
      return `Are you sure you want to create this employee "${this.formData.firstName} ${this.formData.lastName}"?`;
    }
    if (this.isAccommodation) {
      return `Are you sure you want to ${
        this.isEditMode ? 'update' : 'create'
      } this accommodation "${this.formData.accommodationName}"?`;
    }
    if (this.isCampMeeting && this.mode === 'create') {
      return `Are you sure you want to create this camp meeting?`;
    }
    if (this.isTransfer) {
      return `Are you sure you want to create this transfer request for ${this.formData.employeeName}?`;
    }
    if (this.isPromotion) {
      return `Are you sure you want to create this promotion request for ${this.formData.employeeName}?`;
    }
    if (this.isDiscipline) {
      return `Are you sure you want to create this discipline request for ${this.formData.employeeName}?`;
    }
    if (this.isRetirement) {
      return `Are you sure you want to create this retirement request for ${this.formData.employeeName}?`;
    }
    if (this.isRetrenchment) {
      return `Are you sure you want to create this retrenchment request for ${this.formData.employeeName}?`;
    }
    if (this.isDocument) {
      return `Are you sure you want to create this document "${this.formData.documentName}"?`;
    }
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
      // Discipline-specific fields
      disciplineType: '',
      // Transfer-specific fields
      transferType: '',
      destination: '',
      // Retirement-specific fields
      recommendedReplacement: '',
      replacementName: '',
      requestDate: '',
      // Retrenchment-specific fields
      retrenchmentType: '',
      // Document-specific fields
      documentName: '',
      downloadUrl: '',
      fileType: '',
      // Camp Meeting-specific fields
      agenda: '',
      attendees: [],
      // Add Employee-specific fields
      newEmployeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      departmentId: '',
      role: '',
      employmentType: '',
      employeeLocation: '',
      // Accommodation-specific fields
      accommodationName: '',
      accommodationType: 'HOTEL',
      isPetAllowed: false,
      rooms: [{ name: '', capacity: 1 }],
    };
    this.uploadedFiles = [];
    this.searchTerm = '';
    this.filteredEmployees = [];
    this.showEmployeeDropdown = false;
    this.replacementSearchTerm = '';
    this.filteredReplacementEmployees = [];
    this.showReplacementDropdown = false;
    this.selectedAttendees = [];
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

  // Helper method to get file type from filename
  private getFileTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOC';
      case 'xls':
      case 'xlsx':
        return 'XLS';
      case 'jpg':
      case 'jpeg':
        return 'JPG';
      case 'png':
        return 'PNG';
      case 'mp4':
        return 'MP4';
      case 'avi':
        return 'AVI';
      case 'mov':
        return 'MOV';
      default:
        return 'FILE';
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

      // Create a document object for the viewer
      const documentData = {
        id: file.name,
        documentName: file.name,
        documentType: this.getFileTypeFromFileName(file.name),
        downloadUrl: file.url,
        date: new Date().toLocaleDateString(),
      };

      // For PDFs and images, open in new tab for preview
      if (
        extension === 'pdf' ||
        ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)
      ) {
        window.open(file.url, '_blank');
      } else {
        // For other files, trigger download
        this.downloadFile(file);
      }
    }
  }
}
