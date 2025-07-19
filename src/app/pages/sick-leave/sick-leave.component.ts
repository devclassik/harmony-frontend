import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import {
  LeaveService,
  CreateSickLeaveRequest,
} from '../../services/leave.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { AlertService } from '../../services/alert.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sick-leave',
  imports: [
    ConfirmPromptComponent,
    EmployeeDetailsComponent,
    TableComponent,
    CommonModule,
    LeaveDetailsComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './sick-leave.component.html',
  styleUrl: './sick-leave.component.css',
})
export class SickLeaveComponent implements OnInit, OnDestroy {
  userRole: string | null;
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAppraisal: boolean = false;
  showFilterTabFromParent: boolean = false;
  showCreateRequest = false;
  showSickLeaveDetails: boolean = false;
  selectedSickLeaveData: any = null;
  selectedSickLeaveRecord: any = null;
  isLoading: boolean = false;
  isCreating: boolean = false;
  isApprovingLeave: boolean = false;
  isRejectingLeave: boolean = false;
  currentUserId: number | null = null;
  leaveDetailsMode: 'view' | 'create' = 'view';

  // Properties for approve/reject functionality
  selectedLeaveForAction: any = null;
  pendingAction: 'approve' | 'reject' | null = null;

  private subscriptions: Subscription[] = [];

  // Employee details properties for accordion view
  selectedEmployeeDetails: any = null;
  selectedEmployeeSickLeaves: any[] = [];
  selectedSickLeaveHistory: any[] = [];

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private alertService: AlertService
  ) {
    this.userRole = this.authService.getWorkerRole();
    this.currentUserId = this.authService.getCurrentEmployeeId();
  }

  ngOnInit(): void {
    this.loadSickLeaves();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadSickLeaves(): void {
    this.isLoading = true;
    this.leaveService
      .getSickLeaves()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          const allSickLeaves = response.data;

          // Filter leaves based on user role
          if (this.userRole?.toLowerCase() !== 'admin' && this.currentUserId) {
            // Workers see only their own sick leaves
            this.sickLeaveRequests = this.transformToTableData(
              this.leaveService.filterLeavesByEmployee(
                allSickLeaves,
                this.currentUserId
              )
            );
          } else {
            // Admins see all sick leaves
            this.employees = this.transformToTableData(allSickLeaves);
          }

          this.applyFilters();
          this.applySickLeaveFilters();
        },
        error: (error) => {
          console.error('Error loading sick leaves:', error);
          // You might want to show an error message to the user
        },
      });
  }

  transformToTableData(leaves: any[]): TableData[] {
    return leaves.map((leave) => {
      // Calculate end date
      const startDate = new Date(leave.startDate);
      const endDate = new Date(startDate);

      if (leave.durationUnit === 'Days') {
        endDate.setDate(startDate.getDate() + leave.duration - 1);
      } else if (leave.durationUnit === 'Weeks') {
        endDate.setDate(startDate.getDate() + leave.duration * 7 - 1);
      } else if (leave.durationUnit === 'Months') {
        endDate.setMonth(startDate.getMonth() + leave.duration);
        endDate.setDate(endDate.getDate() - 1);
      }

      return {
        id: leave.id.toString(),
        name: leave.employee
          ? `${leave.employee.firstName} ${leave.employee.lastName}`
          : 'N/A',
        startDate: leave.startDate,
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        duration: `${leave.duration} ${leave.durationUnit}`,
        status: this.transformStatus(leave.status) as any,
        requestType: leave.type,
        substitution: 'N/A', // This would come from API if available
        imageUrl: this.formatImageUrl(leave.employee?.photoUrl),
        // Additional data for details view
        reason: leave.reason,
        location: leave.location,
        leaveNotesUrls: leave.leaveNotesUrls || [],
        employeeId: leave.employee?.employeeId,
        // Store original data for detail view
        originalData: leave,
      };
    });
  }

  // Helper function to properly format image URLs
  formatImageUrl(url: string | null): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return 'assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Transform status from API format to display format
  transformStatus(status: string): string {
    if (!status) return 'Unknown';

    // Convert from API format (PENDING, APPROVED, REJECTED) to display format
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        // Capitalize first letter for any other status
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'duration', label: 'DURATION' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  sickLeaveRequestsHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [];
  sickLeaveRequests: TableData[] = [];

  filteredEmployees: TableData[] = [];
  filteredSickLeaveRequests: TableData[] = [];

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
    { label: 'Sabbatical', value: 'Sabbatical', icon: 'M5 13l4 4L19 7' },
    { label: 'Personal', value: 'Personal', icon: 'M5 13l4 4L19 7' },
  ];

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
    this.applySickLeaveFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
    this.applySickLeaveFilters();
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
        (employee) => employee.role === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee?.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          (employee.department &&
            employee.department.toLowerCase().includes(search)) ||
          employee.role?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
    this.applySickLeaveFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      if (
        this.userRole?.toLowerCase() === 'worker' ||
        this.userRole?.toLowerCase() === 'minister'
      ) {
        this.showSickLeaveDetailsModal();

        // Get the original API data and transform it for the leave-details component
        const originalData = (event.row as any).originalData;
        if (originalData) {
          // Get all leave records from the current data to calculate balance and history
          const allUserLeaves = this.sickLeaveRequests
            .map((req) => (req as any).originalData)
            .filter(Boolean);
          this.selectedSickLeaveData =
            this.leaveService.transformForLeaveDetails(
              originalData,
              allUserLeaves
            );
        } else {
          // Fallback to the table data if originalData is not available
          this.selectedSickLeaveData = event.row;
        }
      } else {
        // For admin roles, show employee details with accordion view
        this.showEmployeeDetailsModal();
        this.selectedEmployeeRecord = event.row;
        this.selectedSickLeaveRecord = (event.row as any).originalData;

        // Set selectedSickLeaveData for the employee details component
        const originalData = (event.row as any).originalData;
        if (originalData) {
          // Get all sick leave records from the current data to calculate balance and history
          const allUserSickLeaves = this.employees
            .map((req) => (req as any).originalData)
            .filter(Boolean);
          this.selectedSickLeaveData =
            this.leaveService.transformForLeaveDetails(
              originalData,
              allUserSickLeaves
            );
        } else {
          // Fallback to the table data if originalData is not available
          this.selectedSickLeaveData = event.row;
        }

        // Get employee details and sick leave history
        if (
          this.selectedSickLeaveRecord &&
          this.selectedSickLeaveRecord.employee
        ) {
          this.loadEmployeeDetails(this.selectedSickLeaveRecord.employee.id);
          this.loadEmployeeSickLeaveHistory(
            this.selectedSickLeaveRecord.employee.id
          );
        }
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
    this.pendingAction = result ? 'approve' : 'reject';
    this.selectedLeaveForAction =
      this.selectedSickLeaveRecord || this.selectedSickLeaveData;

    if (result) {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to approve this sick leave request?',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this sick leave request?',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    if (!confirmed) {
      this.showModal = false;
      return;
    }

    if (!this.selectedLeaveForAction) {
      this.alertService.error('No sick leave request selected for action.');
      this.showModal = false;
      return;
    }

    const leaveId = this.selectedLeaveForAction.id;
    const isApproving = this.pendingAction === 'approve';

    // Set loading state
    if (isApproving) {
      this.isApprovingLeave = true;
    } else {
      this.isRejectingLeave = true;
    }

    this.showModal = false;

    // Call the appropriate API method
    const apiCall = isApproving
      ? this.leaveService.approveSickLeave(leaveId)
      : this.leaveService.rejectSickLeave(leaveId);

    const actionSub = apiCall.subscribe({
      next: (response) => {
        // Reset loading states
        this.isApprovingLeave = false;
        this.isRejectingLeave = false;

        if (response.status === 'success') {
          // Show success message
          const action = isApproving ? 'approved' : 'rejected';
          this.alertService.success(
            `Sick leave request ${action} successfully!`
          );

          // Close employee details modal
          this.showEmployeeDetails = false;

          // Reload sick leaves to show updated status
          this.loadSickLeaves();
        }
      },
      error: (error) => {
        // Reset loading states
        this.isApprovingLeave = false;
        this.isRejectingLeave = false;

        console.error(
          `Error ${
            isApproving ? 'approving' : 'rejecting'
          } sick leave request:`,
          error
        );
        const action = isApproving ? 'approving' : 'rejecting';
        this.alertService.error(
          `Failed to ${action} sick leave request. Please try again.`
        );
      },
    });

    this.subscriptions.push(actionSub);
  }

  onModalClose() {
    this.showModal = false;
  }

  showSickLeaveDetailsModal() {
    this.leaveDetailsMode = 'view';
    this.showSickLeaveDetails = true;
  }

  openCreateRequest() {
    this.leaveDetailsMode = 'create';
    this.selectedSickLeaveData = null; // Clear any existing data
    this.showCreateRequest = true;
  }

  onCloseCreateSickLeaveRequest() {
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';
  }

  onCloseSickLeaveDetails() {
    this.showSickLeaveDetails = false;
    this.leaveDetailsMode = 'view';
  }

  onCreateRequestSubmitted(formData: any) {
    console.log('Sick Leave request submitted:', formData);

    if (!this.currentUserId) {
      this.alertService.error(
        'Unable to determine employee ID. Please try logging in again.'
      );
      return;
    }

    // Show loading overlay and close slide panel immediately (like leave of absence)
    this.isCreating = true;
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';

    const sickLeaveRequest: CreateSickLeaveRequest = {
      startDate: formData.startDate,
      duration: formData.duration, // This is already calculated in days
      durationUnit: 'DAYS', // Always use DAYS since duration is calculated in days
      reason: formData.reason,
      location: formData.location || 'Remote',
      leaveNotesUrls: formData.leaveNotesUrls || [],
      employeeId: this.currentUserId,
    };

    this.leaveService
      .createSickLeave(sickLeaveRequest)
      .pipe(
        finalize(() => {
          this.isCreating = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Sick leave created successfully:', response);
          if (response.status === 'success') {
            // Show success alert
            this.alertService.success(
              'Sick leave request created successfully!'
            );

            // Reload sick leaves to show the new request
            this.loadSickLeaves();
          }
        },
        error: (error) => {
          console.error('Error creating sick leave:', error);
          this.alertService.error(
            'Failed to create sick leave request. Please try again.'
          );
        },
      });
  }

  applySickLeaveFilters() {
    let filtered = this.sickLeaveRequests;
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
          request.endDate?.toLowerCase().includes(search)
      );
    }
    this.filteredSickLeaveRequests = filtered;
  }

  // Load employee details for accordion view
  loadEmployeeDetails(employeeId: number) {
    // For now, we'll use the employee data from the sick leave record
    const sickLeaveRecord = this.selectedSickLeaveRecord;
    if (sickLeaveRecord && sickLeaveRecord.employee) {
      this.selectedEmployeeDetails = {
        id: sickLeaveRecord.employee.id,
        employeeId: sickLeaveRecord.employee.employeeId,
        title: sickLeaveRecord.employee.title || null,
        firstName: sickLeaveRecord.employee.firstName,
        lastName: sickLeaveRecord.employee.lastName,
        middleName: sickLeaveRecord.employee.middleName || null,
        gender: sickLeaveRecord.employee.gender || null,
        profferedName: sickLeaveRecord.employee.profferedName || null,
        primaryPhone: sickLeaveRecord.employee.primaryPhone || null,
        primaryPhoneType: sickLeaveRecord.employee.primaryPhoneType || null,
        altPhone: sickLeaveRecord.employee.altPhone || null,
        altPhoneType: sickLeaveRecord.employee.altPhoneType || null,
        dob: sickLeaveRecord.employee.dob || null,
        maritalStatus: sickLeaveRecord.employee.maritalStatus || null,
        nationIdNumber: null,
        everDivorced: sickLeaveRecord.employee.everDivorced,
        beenConvicted: sickLeaveRecord.employee.beenConvicted,
        hasQuestionableBackground:
          sickLeaveRecord.employee.hasQuestionableBackground,
        hasBeenInvestigatedForMisconductOrAbuse:
          sickLeaveRecord.employee.hasBeenInvestigatedForMisconductOrAbuse,
        photoUrl: sickLeaveRecord.employee.photoUrl || null,
        altEmail: sickLeaveRecord.employee.altEmail || null,
        employeeStatus: sickLeaveRecord.employee.employeeStatus || null,
        employmentType: sickLeaveRecord.employee.employmentType || null,
        serviceStartDate: sickLeaveRecord.employee.serviceStartDate || null,
        retiredDate: sickLeaveRecord.employee.retiredDate || null,
        recentCredentialsNameArea: null,
        createdAt: sickLeaveRecord.employee.createdAt,
        updatedAt: sickLeaveRecord.employee.updatedAt,
        deletedAt: sickLeaveRecord.employee.deletedAt || null,
        user: sickLeaveRecord.employee.user
          ? {
              id: 1,
              email: sickLeaveRecord.employee.user.email,
              password: sickLeaveRecord.employee.user.password,
              verifyEmailOTP: sickLeaveRecord.employee.user.verifyEmailOTP,
              isEmailVerified: sickLeaveRecord.employee.user.isEmailVerified,
              passwordResetOTP:
                sickLeaveRecord.employee.user.passwordResetOTP || null,
              isLoggedIn: sickLeaveRecord.employee.user.isLoggedIn,
              createdAt: sickLeaveRecord.employee.user.createdAt,
              updatedAt: sickLeaveRecord.employee.user.updatedAt,
              deletedAt: sickLeaveRecord.employee.user.deletedAt || null,
              role: {
                id: 1,
                name: 'Worker',
                createdAt: '',
                updatedAt: '',
                deletedAt: null,
                permissions: [],
              },
            }
          : null,
        spouse: null,
        children: [],
        payrolls: [],
        documents: [],
        credentials: [],
        departments: [],
        homeAddress: null,
        mailingAddress: null,
        departmentHeads: [],
        previousPositions: [],
        spiritualHistory: null,
      };
    }
  }

  // Load employee sick leave history for accordion view
  loadEmployeeSickLeaveHistory(employeeId: number) {
    // For sick leave view, we only show sick leave history
    // Filter sick leave requests for this specific employee
    this.selectedEmployeeSickLeaves = this.employees
      .map((req) => (req as any).originalData)
      .filter(
        (leave: any) =>
          leave && leave.employee && leave.employee.id === employeeId
      );

    // Transform to history format
    this.selectedSickLeaveHistory = this.leaveService.getLeaveHistory(
      this.selectedEmployeeSickLeaves
    );

    // Ensure we have at least the current sick leave request for the history section to show
    if (
      this.selectedSickLeaveRecord &&
      this.selectedEmployeeSickLeaves.length === 0
    ) {
      this.selectedEmployeeSickLeaves = [this.selectedSickLeaveRecord];
    }
  }
}
