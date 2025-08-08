import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { CommonModule } from '@angular/common';
import { TableData } from '../../interfaces/employee.interface';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { RetrenchmentService } from '../../services/retrenchment.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import {
  RetrenchmentRecord,
  RetrenchmentEmployee,
  RetrenchmentRecordDetailed,
} from '../../dto/retrenchment.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-retrenchment',
  imports: [
    CommonModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    LoadingOverlayComponent,
    LeaveDetailsComponent,
  ],
  templateUrl: './employee-retrenchment.component.html',
  styleUrl: './employee-retrenchment.component.css',
})
export class EmployeeRetrenchmentComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  showCreateRetrenchmentRequest: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedRetrenchmentRecord: RetrenchmentRecord | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null =
    null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Store all retrenchments and raw data
  allRetrenchments: RetrenchmentRecord[] = [];

  // Role-based button visibility - only show for HOD/Pastor
  get shouldShowCreateButton(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    return (
      userRole === 'pastor' ||
      userRole === 'hod' ||
      userRole === 'zonal_pastor' ||
      userRole === 'district_pastor'
    );
  }

  // Separate visibility logic for approve/reject buttons in modal
  get shouldShowModalButtons(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    console.log('Current user role for modal buttons:', userRole);
    console.log('Available roles for comparison:', [
      'pastor',
      'hod',
      'zonal_pastor',
      'district_pastor',
    ]);
    const hasPermission =
      userRole === 'pastor' ||
      userRole === 'hod' ||
      userRole === 'zonal_pastor' ||
      userRole === 'district_pastor';
    console.log('Has permission for modal buttons:', hasPermission);
    // Temporarily return true to test functionality
    return true;
  }

  // Filter retrenchments to show only those for the selected employee
  get selectedEmployeeRetrenchments(): RetrenchmentRecord[] {
    if (!this.selectedRetrenchmentRecord || !this.allRetrenchments) {
      return [];
    }

    // Get the selected employee's ID
    const selectedEmployeeId = this.selectedRetrenchmentRecord.employee.id;

    // Filter retrenchments to only show those for this employee
    return this.allRetrenchments.filter(
      (retrenchment) => retrenchment.employee.id === selectedEmployeeId
    );
  }

  private subscriptions: Subscription[] = [];

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Approving Retrenchment...';
      case 'rejecting':
        return 'Rejecting Retrenchment...';
      case 'loading':
      default:
        return 'Loading Retrenchments...';
    }
  }

  get getLoadingMessage(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Please wait while we approve the retrenchment request.';
      case 'rejecting':
        return 'Please wait while we reject the retrenchment request.';
      case 'creating':
        return 'Please wait while we create the retrenchment request.';
      case 'loading':
      default:
        return 'Please wait while we fetch retrenchment data.';
    }
  }

  constructor(
    private retrenchmentService: RetrenchmentService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRetrenchments();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'RETRENCHMENT ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'retrenchmentType', label: 'RETRENCHMENT TYPE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [];
  filteredEmployees: TableData[] = [];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  filterTabs = [
    {
      label: 'All',
      value: '',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    },
    { label: 'Pastor', value: 'PASTOR', icon: 'M5 13l4 4L19 7' },
    { label: 'Senior Pastor', value: 'SENIOR_PASTOR', icon: 'M5 13l4 4L19 7' },
    { label: 'Cleaner', value: 'CLEANER', icon: 'M5 13l4 4L19 7' },
    { label: 'HOD', value: 'HOD', icon: 'M5 13l4 4L19 7' },
    { label: 'Worker', value: 'WORKER', icon: 'M5 13l4 4L19 7' },
    { label: 'Minister', value: 'MINISTER', icon: 'M5 13l4 4L19 7' },
    { label: 'Overseer', value: 'OVERSEER', icon: 'M5 13l4 4L19 7' },
  ];

  loadRetrenchments() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const retrenchmentsSub = this.retrenchmentService
      .getAllRetrenchments()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.allRetrenchments = response.data;
            this.employees = this.transformRetrenchmentsToTableData(
              response.data
            );
            this.applyFilters();
          } else {
            this.alertService.error('Failed to load retrenchments');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error loading retrenchments:', error);
          this.alertService.error('Failed to load retrenchments');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(retrenchmentsSub);
  }

  transformRetrenchmentsToTableData(
    retrenchments: RetrenchmentRecord[]
  ): TableData[] {
    return retrenchments.map((retrenchment) => ({
      id: retrenchment.id.toString(),
      name: `${retrenchment.employee.firstName} ${retrenchment.employee.lastName}`,
      retrenchmentType: this.formatRetrenchmentType(
        retrenchment.retrenchmentType
      ),
      status: this.mapRetrenchmentStatus(retrenchment.status),
      imageUrl: this.formatImageUrl(retrenchment.employee.photoUrl),
      // Store the original retrenchment record for later use
      originalData: retrenchment,
    }));
  }

  formatRetrenchmentType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  mapRetrenchmentStatus(status: string): TableData['status'] {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }

  formatImageUrl(url: string | null): string {
    if (!url || url === '') {
      return 'assets/svg/gender.svg';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

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
      filtered = filtered.filter((employee) => {
        // Convert back to API format for comparison
        const apiStatus =
          this.selectedStatus === 'Pending'
            ? 'PENDING'
            : this.selectedStatus === 'Approved'
            ? 'APPROVED'
            : 'REJECTED';
        return employee.status === this.selectedStatus;
      });
    }
    if (this.selectedFilter) {
      filtered = filtered.filter((employee) => {
        // Filter by retrenchment type
        return employee.retrenchmentType === this.selectedFilter;
      });
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.retrenchmentType?.toLowerCase().includes(search) ||
          employee.status?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      this.loadRetrenchmentDetails(event.row);
    }
  }

  loadRetrenchmentDetails(row: TableData) {
    const retrenchmentId = parseInt(row.id);
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const detailsSub = this.retrenchmentService
      .getRetrenchmentDetails(retrenchmentId)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.selectedRetrenchmentRecord =
              this.convertDetailedToRetrenchmentRecord(response.data);
            this.selectedEmployeeDetails = response.data.employee as any;
            this.selectedEmployeeRecord = row;
            this.showEmployeeDetails = true;
          } else {
            this.alertService.error('Failed to load retrenchment details');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error loading retrenchment details:', error);
          this.alertService.error('Failed to load retrenchment details');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(detailsSub);
  }

  convertDetailedToRetrenchmentRecord(
    detailed: RetrenchmentRecordDetailed
  ): RetrenchmentRecord {
    return {
      id: detailed.id,
      retrenchmentId: detailed.retrenchmentId,
      retrenchmentType: detailed.retrenchmentType,
      reason: detailed.reason,
      status: detailed.status,
      createdAt: detailed.createdAt,
      updatedAt: detailed.updatedAt,
      deletedAt: detailed.deletedAt,
      employee: detailed.employee,
    };
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  actionToPerform(result: boolean) {
    if (!this.selectedRetrenchmentRecord) return;

    this.pendingAction = result ? 'approve' : 'reject';
    this.promptConfig = {
      title: 'Confirm',
      text: result
        ? 'Are you sure you want to approve this retrenchment request?'
        : 'Are you sure you want to reject this retrenchment request?',
      yesButtonText: 'Yes',
      noButtonText: 'No',
    };
    this.showModal = true;
  }

  onModalConfirm(confirmed: boolean) {
    if (confirmed && this.pendingAction && this.selectedRetrenchmentRecord) {
      if (this.pendingAction === 'approve') {
        this.approveRetrenchment();
      } else {
        this.rejectRetrenchment();
      }
    }
    this.showModal = false;
    this.pendingAction = null;
  }

  approveRetrenchment() {
    if (!this.selectedRetrenchmentRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'approving';

    const approveSub = this.retrenchmentService
      .approveRetrenchment(this.selectedRetrenchmentRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retrenchment request approved successfully'
            );
            this.showEmployeeDetails = false;
            this.loadRetrenchments(); // Reload the list
          } else {
            this.alertService.error('Failed to approve retrenchment request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error approving retrenchment:', error);
          this.alertService.error('Failed to approve retrenchment request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(approveSub);
  }

  rejectRetrenchment() {
    if (!this.selectedRetrenchmentRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'rejecting';

    const rejectSub = this.retrenchmentService
      .rejectRetrenchment(this.selectedRetrenchmentRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retrenchment request rejected successfully'
            );
            this.showEmployeeDetails = false;
            this.loadRetrenchments(); // Reload the list
          } else {
            this.alertService.error('Failed to reject retrenchment request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error rejecting retrenchment:', error);
          this.alertService.error('Failed to reject retrenchment request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(rejectSub);
  }

  onModalClose() {
    this.showModal = false;
    this.pendingAction = null;
  }

  onCreateRetrenchmentRequest() {
    this.showCreateRetrenchmentRequest = true;
  }

  onCloseCreateRetrenchmentRequest() {
    console.log('Closing retrenchment request form');
    this.showCreateRetrenchmentRequest = false;
  }

  onCreateRetrenchmentRequestSubmitted(data: any) {
    this.isLoading = true;
    this.loadingOperation = 'creating';

    // Transform the data from leave-details component to match API expectations
    const retrenchmentData = {
      employeeId: parseInt(data.employeeId),
      reason: data.reason,
      retrenchmentType: data.retrenchmentType,
    };

    const createSub = this.retrenchmentService
      .createRetrenchment(retrenchmentData)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retrenchment request created successfully'
            );
            this.showCreateRetrenchmentRequest = false;
            this.loadRetrenchments(); // Reload the list
          } else {
            this.alertService.error('Failed to create retrenchment request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error creating retrenchment:', error);
          this.alertService.error('Failed to create retrenchment request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(createSub);
  }
}
