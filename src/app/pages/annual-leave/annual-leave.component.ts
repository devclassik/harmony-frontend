import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { SubstitutionComponent } from '../../components/substitution/substitution.component';
import { AuthService } from '../../services/auth.service';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import {
  LeaveService,
  CreateLeaveRequest,
  LeaveRecord,
} from '../../services/leave.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { EmployeeDetails } from '../../dto/employee.dto';

@Component({
  selector: 'app-annual-leave',
  imports: [
    CommonModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    SuccessModalComponent,
    SubstitutionComponent,
    LeaveDetailsComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './annual-leave.component.html',
  styleUrl: './annual-leave.component.css',
})
export class AnnualLeaveComponent implements OnInit, OnDestroy {
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
  showAnnualLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;
  showCreateLeaveRequest: boolean = false;
  showAppraisal: boolean = false;
  showSubstitution: boolean = false;
  showFilterTabFromParent: boolean = false;

  // Loading states
  isLoadingLeaves: boolean = false;
  isCreatingLeave: boolean = false;
  isApprovingLeave: boolean = false;
  isRejectingLeave: boolean = false;

  // Add mode control for leave-details component
  leaveDetailsMode: 'view' | 'create' = 'view';

  // View state
  currentView: 'table' | 'calendar' = 'table';

  // Store selected leave for approval/rejection
  selectedLeaveForAction: any = null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Real data arrays
  leaveRequests: TableData[] = [];
  filteredLeaveRequests: TableData[] = [];

  // Calendar events for display
  leaveCalendarEvents: any[] = [];

  // Admin role properties for accordion view
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedLeaveRecord: LeaveRecord | null = null;
  selectedEmployeeLeaves: LeaveRecord[] = [];
  selectedLeaveHistory: any[] = [];

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

    const leaveSub = this.leaveService.getAnnualLeaves().subscribe({
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

          // Apply filters (this will also filter calendar events)
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
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
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
    { label: 'Weekly', value: 'Weekly', icon: 'M5 13l4 4L19 7' },
    { label: 'Monthly', value: 'Monthly', icon: 'M5 13l4 4L19 7' },
    {
      label: 'Yearly',
      value: 'Yearly',
      icon: 'M5 13l4 4L19 7',
    },
  ];

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
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
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          (employee.department &&
            employee.department.toLowerCase().includes(search)) ||
          employee.role?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;

    // Apply filters to leave requests as well
    this.applyLeaveFilters();
  }

  applyLeaveFilters() {
    let filtered = this.leaveRequests;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (request) => request.status === this.selectedStatus
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(search) ||
          request.startDate?.toLowerCase().includes(search) ||
          request.endDate?.toLowerCase().includes(search) ||
          request.name?.toLowerCase().includes(search)
      );
    }
    this.filteredLeaveRequests = filtered;

    // Also filter calendar events based on the same criteria
    this.applyCalendarFilters();
  }

  applyCalendarFilters() {
    // Get the original leave data that matches the current filters
    const filteredOriginalData = this.leaveRequests
      .map((req) => (req as any).originalData)
      .filter(Boolean)
      .filter((leave: any) => {
        // Apply status filter
        if (this.selectedStatus && this.selectedStatus !== '') {
          const leaveStatus = this.transformStatus(leave.status);
          if (leaveStatus !== this.selectedStatus) {
            return false;
          }
        }

        // Apply search filter
        if (this.searchValue) {
          const search = this.searchValue.toLowerCase();
          const employeeName =
            `${leave.employee.firstName} ${leave.employee.lastName}`.toLowerCase();
          const leaveId = leave.id.toString().toLowerCase();
          const startDate = leave.startDate.toLowerCase();

          if (
            !employeeName.includes(search) &&
            !leaveId.includes(search) &&
            !startDate.includes(search)
          ) {
            return false;
          }
        }

        return true;
      });

    // Transform filtered data to calendar events
    this.leaveCalendarEvents =
      this.leaveService.transformToCalendarEvents(filteredOriginalData);
  }

  // Helper method to transform status for filtering
  private transformStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      // Check if user is admin/HOD/pastor
      const isAdminRole =
        this.userRole?.toLowerCase() === 'admin' ||
        this.userRole?.toLowerCase() === 'hod' ||
        this.userRole?.toLowerCase() === 'pastor';

      if (isAdminRole) {
        // For admin roles, show employee details with accordion view
        this.showEmployeeDetailsModal();
        this.selectedEmployeeRecord = event.row;
        this.selectedLeaveRecord = (event.row as any).originalData;

        // Set selectedLeaveData for the employee details component
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

        // Get employee details and leave history
        if (this.selectedLeaveRecord && this.selectedLeaveRecord.employee) {
          this.loadEmployeeDetails(this.selectedLeaveRecord.employee.id);
          this.loadEmployeeLeaveHistory(this.selectedLeaveRecord.employee.id);
        }
      } else {
        // For worker/minister, show regular leave details
        this.showAnnualLeaveDetailsModal();

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
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  // View change handler
  onViewChange(viewType: string) {
    this.currentView = viewType as 'table' | 'calendar';
  }

  // Calendar event click handler
  handleCalendarEventClick = (info: any) => {
    const leaveData = info.event.extendedProps?.originalData;

    if (leaveData) {
      // Check if user is admin/HOD/pastor
      const isAdminRole =
        this.userRole?.toLowerCase() === 'admin' ||
        this.userRole?.toLowerCase() === 'hod' ||
        this.userRole?.toLowerCase() === 'pastor';

      if (isAdminRole) {
        // For admin roles, show employee details with accordion view
        this.showEmployeeDetailsModal();

        // Find the corresponding table row data
        const tableRow = this.leaveRequests.find(
          (req) => (req as any).originalData?.id === leaveData.id
        );

        if (tableRow) {
          this.selectedEmployeeRecord = tableRow;
          this.selectedLeaveRecord = leaveData;

          // Set selectedLeaveData for the employee details component
          const allUserLeaves = this.leaveRequests
            .map((req) => (req as any).originalData)
            .filter(Boolean);
          this.selectedLeaveData = this.leaveService.transformForLeaveDetails(
            leaveData,
            allUserLeaves
          );

          // Get employee details and leave history
          if (this.selectedLeaveRecord && this.selectedLeaveRecord.employee) {
            this.loadEmployeeDetails(this.selectedLeaveRecord.employee.id);
            this.loadEmployeeLeaveHistory(this.selectedLeaveRecord.employee.id);
          }
        }
      } else {
        // For worker/minister, show regular leave details
        this.showAnnualLeaveDetailsModal();

        // Get all leave records from the current data to calculate balance and history
        const allUserLeaves = this.leaveRequests
          .map((req) => (req as any).originalData)
          .filter(Boolean);
        this.selectedLeaveData = this.leaveService.transformForLeaveDetails(
          leaveData,
          allUserLeaves
        );
      }
    }
  };

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  showAnnualLeaveDetailsModal() {
    this.showAnnualLeaveDetails = true;
    this.leaveDetailsMode = 'view';
  }

  actionToPerform(result: boolean) {
    this.pendingAction = result ? 'approve' : 'reject';
    this.selectedLeaveForAction =
      this.selectedLeaveRecord || this.selectedLeaveData;

    if (result) {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to approve this leave request?',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this leave request?',
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
    // this.successModal = true;
    confirmed ? this.onSubstitutionModalEvent() : '';
  }

  onSubstitutionModalEvent() {
    this.showSubstitution = this.showSubstitution ? false : true;
  }

  onModalClose() {
    this.showModal = false;
  }

  handleSubstitution(form: any) {
    if (!this.selectedLeaveForAction) {
      this.alertService.error('No leave request selected for action.');
      this.showSubstitution = false;
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

    this.showSubstitution = false;

    // Call the appropriate API method with substitution data
    const apiCall = isApproving
      ? this.leaveService.approveLeave(leaveId, form)
      : this.leaveService.rejectLeave(leaveId);

    const actionSub = apiCall.subscribe({
      next: (response) => {
        // Reset loading states
        this.isApprovingLeave = false;
        this.isRejectingLeave = false;

        if (response.status === 'success') {
          // Show success message
          const action = isApproving ? 'approved' : 'rejected';
          this.alertService.success(
            `Annual leave request ${action} successfully!`
          );

          // Close employee details modal
          this.showEmployeeDetails = false;

          // Reload leave requests to show updated status
          this.loadLeaveRequests();
        }
      },
      error: (error) => {
        // Reset loading states
        this.isApprovingLeave = false;
        this.isRejectingLeave = false;

        console.error(
          `Error ${isApproving ? 'approving' : 'rejecting'} leave request:`,
          error
        );
        const action = isApproving ? 'approving' : 'rejecting';
        this.alertService.error(
          `Failed to ${action} leave request. Please try again.`
        );
      },
    });

    this.subscriptions.push(actionSub);
  }

  onShowListClick(event: string) {
    event === 'list'
      ? (this.showFilterTabFromParent = false)
      : (this.showFilterTabFromParent = true);
  }

  onCreateLeaveRequest() {
    // Use the leave-details component in create mode instead of modal
    this.showCreateLeaveRequest = true;
    this.leaveDetailsMode = 'create';
  }

  onCreateLeaveRequestSubmitted(formData: any) {
    if (!this.currentEmployeeId) {
      this.alertService.error(
        'Unable to determine employee ID. Please try logging in again.'
      );
      return;
    }

    // Show loading overlay and close slide panel
    this.isCreatingLeave = true;
    this.showCreateLeaveRequest = false;
    this.leaveDetailsMode = 'view';

    // Prepare API request
    const createRequest: CreateLeaveRequest = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      employeeId: this.currentEmployeeId,
    };

    // Call API to create leave request
    const createSub = this.leaveService
      .createAnnualLeave(createRequest)
      .subscribe({
        next: (response) => {
          this.isCreatingLeave = false;
          if (response.status === 'success') {
            // Show success alert
            this.alertService.success('Leave request created successfully!');

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
    this.showCreateLeaveRequest = false;
    this.leaveDetailsMode = 'view';
  }

  onCloseAnnualLeaveDetails() {
    this.showAnnualLeaveDetails = false;
    this.leaveDetailsMode = 'view';
  }

  // Load employee details for accordion view
  loadEmployeeDetails(employeeId: number) {
    // For now, we'll use the employee data from the leave record
    // In a real implementation, you might want to fetch detailed employee info
    const leaveRecord = this.selectedLeaveRecord;
    if (leaveRecord && leaveRecord.employee) {
      this.selectedEmployeeDetails = {
        id: leaveRecord.employee.id,
        employeeId: leaveRecord.employee.employeeId,
        title: leaveRecord.employee.title || null,
        firstName: leaveRecord.employee.firstName,
        lastName: leaveRecord.employee.lastName,
        middleName: leaveRecord.employee.middleName || null,
        gender: leaveRecord.employee.gender || null,
        profferedName: leaveRecord.employee.profferedName || null,
        primaryPhone: leaveRecord.employee.primaryPhone || null,
        primaryPhoneType: leaveRecord.employee.primaryPhoneType || null,
        altPhone: leaveRecord.employee.altPhone || null,
        altPhoneType: leaveRecord.employee.altPhoneType || null,
        dob: leaveRecord.employee.dob || null,
        maritalStatus: leaveRecord.employee.maritalStatus || null,
        nationIdNumber: null,
        everDivorced: leaveRecord.employee.everDivorced,
        beenConvicted: leaveRecord.employee.beenConvicted,
        hasQuestionableBackground:
          leaveRecord.employee.hasQuestionableBackground,
        hasBeenInvestigatedForMisconductOrAbuse:
          leaveRecord.employee.hasBeenInvestigatedForMisconductOrAbuse,
        photoUrl: leaveRecord.employee.photoUrl || null,
        altEmail: leaveRecord.employee.altEmail || null,
        employeeStatus: leaveRecord.employee.employeeStatus || null,
        employmentType: leaveRecord.employee.employmentType || null,
        serviceStartDate: leaveRecord.employee.serviceStartDate || null,
        retiredDate: leaveRecord.employee.retiredDate || null,
        recentCredentialsNameArea: null,
        createdAt: leaveRecord.employee.createdAt,
        updatedAt: leaveRecord.employee.updatedAt,
        deletedAt: leaveRecord.employee.deletedAt || null,
        user: leaveRecord.employee.user
          ? {
              id: leaveRecord.employee.user.id,
              email: leaveRecord.employee.user.email,
              password: leaveRecord.employee.user.password,
              verifyEmailOTP: leaveRecord.employee.user.verifyEmailOTP,
              isEmailVerified: leaveRecord.employee.user.isEmailVerified,
              passwordResetOTP:
                leaveRecord.employee.user.passwordResetOTP || null,
              isLoggedIn: leaveRecord.employee.user.isLoggedIn,
              createdAt: leaveRecord.employee.user.createdAt,
              updatedAt: leaveRecord.employee.user.updatedAt,
              deletedAt: leaveRecord.employee.user.deletedAt || null,
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

  // Load employee leave history for accordion view
  loadEmployeeLeaveHistory(employeeId: number) {
    // Filter leaves for this specific employee
    this.selectedEmployeeLeaves = this.leaveRequests
      .map((req) => (req as any).originalData)
      .filter(
        (leave: any) =>
          leave && leave.employee && leave.employee.id === employeeId
      );

    // Transform to history format
    this.selectedLeaveHistory = this.leaveService.getLeaveHistory(
      this.selectedEmployeeLeaves
    );
  }
}
