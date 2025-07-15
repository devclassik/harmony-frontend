import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { TableData } from '../../interfaces/employee.interface';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { CreateLeaveRequestComponent } from '../../components/create-leave-request/create-leave-request.component';
import { AuthService } from '../../services/auth.service';
import { CreateLeaveOfAbsenceComponent } from '../../components/create-leave-of-absence/create-leave-of-absence.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import {
  LeaveService,
  CreateAbsenceRequest,
  LeaveRecord,
} from '../../services/leave.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { FORM_OPTIONS } from '../../shared/constants/form-options';

@Component({
  selector: 'app-leave-of-absence',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    SuccessModalComponent,
    LeaveDetailsComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './leave-of-absence.component.html',
  styleUrl: './leave-of-absence.component.css',
})
export class LeaveOfAbsenceComponent implements OnInit, OnDestroy {
  @ViewChild(LeaveDetailsComponent)
  leaveDetailsComponent!: LeaveDetailsComponent;

  userRole: string | null;
  currentEmployeeId: number | null;
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;
  showCreateRequest = false;
  showAppraisal: boolean = false;
  showFilterTabFromParent: boolean = false;

  // Loading states
  isLoadingLeaves: boolean = false;
  isCreatingLeave: boolean = false;

  // Add mode control for leave-details component
  leaveDetailsMode: 'view' | 'create' = 'view';

  // Real data arrays
  leaveRequests: TableData[] = [];
  filteredLeaveRequests: TableData[] = [];

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private alertService: AlertService
  ) {
    this.userRole = this.authService.getWorkerRole();
    this.currentEmployeeId = this.authService.getCurrentEmployeeId();
  }

  ngOnInit() {
    this.loadLeaveRequests();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Load leave requests from API
  loadLeaveRequests() {
    this.isLoadingLeaves = true;

    const leaveSub = this.leaveService.getAbsenceLeaves().subscribe({
      next: (response) => {
        this.isLoadingLeaves = false;
        if (response.status === 'success' && response.data) {
          let leaves = response.data;

          // Filter by employee ID if not admin
          if (
            this.userRole?.toLowerCase() !== 'admin' &&
            this.currentEmployeeId
          ) {
            leaves = this.leaveService.filterLeavesByEmployee(
              leaves,
              this.currentEmployeeId
            );
          }

          // Transform API data to table format
          this.leaveRequests = this.leaveService.transformToTableData(leaves);
          this.applyLeaveFilters();
        }
      },
      error: (error) => {
        this.isLoadingLeaves = false;
        console.error('Error loading leave requests:', error);
        this.alertService.error(
          'Failed to load leave requests. Please try again.'
        );
      },
    });

    this.subscriptions.push(leaveSub);
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'requestType', label: 'REQUEST TYPE' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  leaveRequestsHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  // Remove mock data - will be populated from API
  employees: TableData[] = [];
  filteredEmployees: TableData[] = [];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  filterTabs = [
    {
      label: 'All',
      value: '',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    },
    ...FORM_OPTIONS.leaveRequestTypes.map((type) => ({
      label: type,
      value: type,
      icon: 'M5 13l4 4L19 7',
    })),
  ];

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
    this.applyLeaveFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
    this.applyLeaveFilters();
  }

  applyFilters() {
    let filtered = this.employees;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (employee) => employee.status === this.selectedStatus
      );
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (employee) => employee.requestType === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          (employee.department &&
            employee.department.toLowerCase().includes(search)) ||
          employee.requestType?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  applyLeaveFilters() {
    let filtered = this.leaveRequests;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (request) => request.status === this.selectedStatus
      );
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (request) => request.requestType === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(search) ||
          request.requestType?.toLowerCase().includes(search) ||
          request.startDate?.toLowerCase().includes(search) ||
          request.name?.toLowerCase().includes(search)
      );
    }
    this.filteredLeaveRequests = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
    this.applyLeaveFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      this.showLeaveDetailsModal();

      // Get the original API data and transform it for the leave-details component
      const originalData = (event.row as any).originalData;
      if (originalData) {
        // Get all leave records from the current data to calculate balance and history
        const allUserLeaves = this.leaveRequests
          .map((req) => (req as any).originalData)
          .filter(Boolean);
        this.selectedLeaveData = this.leaveService.transformForLeaveDetails(
          originalData,
          allUserLeaves
        );
      } else {
        // Fallback to the table data if originalData is not available
        this.selectedLeaveData = event.row;
      }
    }
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  actionToPerform(result: boolean) {
    if (result) {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to approve this promotion request',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this promotion request',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    console.log(confirmed);
    this.showModal = false;
    this.showAppraisal = false;
    this.successModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }

  showLeaveDetailsModal() {
    this.showLeaveDetails = true;
    this.leaveDetailsMode = 'view';
  }

  openCreateRequest() {
    this.showCreateRequest = true;
    this.leaveDetailsMode = 'create';
  }

  onCreateRequestSubmitted(formData: any) {
    if (!this.currentEmployeeId) {
      this.alertService.error(
        'Unable to determine employee ID. Please try logging in again.'
      );
      return;
    }

    // Show loading overlay and close slide panel immediately (like annual leave)
    this.isCreatingLeave = true;
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';

    // Prepare API request
    const createRequest: CreateAbsenceRequest = {
      startDate: formData.startDate,
      duration: formData.duration, // This is already calculated in days
      durationUnit: 'DAYS', // Always use DAYS since duration is calculated in days
      reason: formData.reason,
      location: formData.location || 'Remote',
      leaveNotesUrls: formData.leaveNotesUrls || [],
      employeeId: this.currentEmployeeId,
    };

    // Call API to create leave request
    const createSub = this.leaveService
      .createAbsenceLeave(createRequest)
      .subscribe({
        next: (response) => {
          this.isCreatingLeave = false;
          if (response.status === 'success') {
            // Show success alert
            this.alertService.success(
              'Leave of absence request created successfully!'
            );

            // Reload leave requests to show the new record
            this.loadLeaveRequests();
          }
        },
        error: (error) => {
          this.isCreatingLeave = false;
          console.error('Error creating leave request:', error);
          this.alertService.error(
            'Failed to create leave request. Please try again.'
          );
        },
      });

    this.subscriptions.push(createSub);
  }

  onCloseCreateLeaveRequest() {
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';
  }

  onCloseLeaveDetails() {
    this.showLeaveDetails = false;
    this.leaveDetailsMode = 'view';
  }
}
