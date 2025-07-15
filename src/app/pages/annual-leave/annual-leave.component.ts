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
    { key: 'name', label: 'NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
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
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
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

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  showAnnualLeaveDetailsModal() {
    this.showAnnualLeaveDetails = true;
    this.leaveDetailsMode = 'view';
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
    console.log(form);
    this.promptConfig = {
      title: 'Confirm',
      text: 'Are you sure you want to submit this appraisal?',
      yesButtonText: 'Yes',
      noButtonText: 'No',
    };
    this.showModal = true;
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
}
