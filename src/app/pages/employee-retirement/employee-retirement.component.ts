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
import { RetirementService } from '../../services/retirement.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import {
  RetirementRecord,
  RetirementEmployee,
  RetirementRecordDetailed,
} from '../../dto/retirement.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-retirement',
  imports: [
    CommonModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    LoadingOverlayComponent,
    LeaveDetailsComponent,
  ],
  templateUrl: './employee-retirement.component.html',
  styleUrl: './employee-retirement.component.css',
})
export class EmployeeRetirementComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  showCreateRetirementRequest: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedRetirementRecord: RetirementRecord | null = null;
  selectedAppraisalData: any[] = []; // Store appraisal data separately
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAppraisal: boolean = false;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null =
    null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Store all retirements and raw data
  allRetirements: RetirementRecord[] = [];

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

  // Filter retirements to show only those for the selected employee
  get selectedEmployeeRetirements(): RetirementRecord[] {
    if (!this.selectedRetirementRecord || !this.allRetirements) {
      return [];
    }

    // Get the selected employee's ID
    const selectedEmployeeId = this.selectedRetirementRecord.employee.id;

    // Filter retirements to only show those for this employee
    return this.allRetirements.filter(
      (retirement) => retirement.employee.id === selectedEmployeeId
    );
  }

  private subscriptions: Subscription[] = [];

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Approving Retirement...';
      case 'rejecting':
        return 'Rejecting Retirement...';
      case 'loading':
      default:
        return 'Loading Retirements...';
    }
  }

  get getLoadingMessage(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Please wait while we approve the retirement request.';
      case 'rejecting':
        return 'Please wait while we reject the retirement request.';
      case 'creating':
        return 'Please wait while we create the retirement request.';
      case 'loading':
      default:
        return 'Please wait while we fetch retirement data.';
    }
  }

  constructor(
    private retirementService: RetirementService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRetirements();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'RETIREMENT ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'requestDate', label: 'REQUEST DATE' },
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
    { label: 'Minister', value: 'MINISTER', icon: 'M5 13l4 4L19 7' },
    { label: 'Pastor', value: 'PASTOR', icon: 'M5 13l4 4L19 7' },
    { label: 'Zonal Pastor', value: 'ZONAL_PASTOR', icon: 'M5 13l4 4L19 7' },
    {
      label: 'District Pastor',
      value: 'DISTRICT_PASTOR',
      icon: 'M5 13l4 4L19 7',
    },
  ];

  loadRetirements() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const retirementsSub = this.retirementService
      .getAllRetirements()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.allRetirements = response.data;
            this.employees = this.transformRetirementsToTableData(
              response.data
            );
            this.applyFilters();
          } else {
            this.alertService.error('Failed to load retirements');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error loading retirements:', error);
          this.alertService.error('Failed to load retirements');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(retirementsSub);
  }

  transformRetirementsToTableData(
    retirements: RetirementRecord[]
  ): TableData[] {
    return retirements.map((retirement) => ({
      id: retirement.id.toString(),
      name: `${retirement.employee.firstName} ${retirement.employee.lastName}`,
      department: retirement.employee.departments?.[0]?.name || 'N/A',
      requestDate: this.formatDate(retirement.createdAt),
      status: this.mapRetirementStatus(retirement.status),
      imageUrl: this.formatImageUrl(retirement.employee.photoUrl),
      // Store the original retirement record for later use
      originalData: retirement,
    }));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  mapRetirementStatus(status: string): TableData['status'] {
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
            : this.selectedStatus === 'Rejected'
            ? 'REJECTED'
            : this.selectedStatus;

        const retirement = this.allRetirements.find(
          (p) => p.id.toString() === employee.id
        );
        return retirement && retirement.status === apiStatus;
      });
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (employee) => employee.department === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.department?.toLowerCase().includes(search) ||
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
      this.loadRetirementDetails(event.row);
    }
  }

  loadRetirementDetails(row: TableData) {
    const retirementId = parseInt(row.id);
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const detailsSub = this.retirementService
      .getRetirementDetails(retirementId)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.selectedRetirementRecord =
              this.convertDetailedToRetirementRecord(response.data);
            this.selectedEmployeeDetails = response.data.employee as any;
            this.selectedEmployeeRecord = row;
            this.showEmployeeDetails = true;
          } else {
            this.alertService.error('Failed to load retirement details');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error loading retirement details:', error);
          this.alertService.error('Failed to load retirement details');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(detailsSub);
  }

  convertDetailedToRetirementRecord(
    detailed: RetirementRecordDetailed
  ): RetirementRecord {
    return {
      id: detailed.id,
      retirementId: detailed.retirementId,
      reason: detailed.reason,
      status: detailed.status,
      documents: detailed.documents,
      createdAt: detailed.createdAt,
      updatedAt: detailed.updatedAt,
      deletedAt: detailed.deletedAt,
      employee: detailed.employee,
      recommendedReplacement: detailed.recommendedReplacement,
    };
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  actionToPerform(result: boolean) {
    if (!this.selectedRetirementRecord) return;

    this.pendingAction = result ? 'approve' : 'reject';
    this.promptConfig = {
      title: 'Confirm',
      text: result
        ? 'Are you sure you want to approve this retirement request?'
        : 'Are you sure you want to reject this retirement request?',
      yesButtonText: 'Yes',
      noButtonText: 'No',
    };
    this.showModal = true;
  }

  onModalConfirm(confirmed: boolean) {
    if (confirmed && this.pendingAction && this.selectedRetirementRecord) {
      if (this.pendingAction === 'approve') {
        this.approveRetirement();
      } else {
        this.rejectRetirement();
      }
    }
    this.showModal = false;
    this.pendingAction = null;
  }

  approveRetirement() {
    if (!this.selectedRetirementRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'approving';

    const approveSub = this.retirementService
      .approveRetirement(this.selectedRetirementRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retirement request approved successfully'
            );
            this.showEmployeeDetails = false;
            this.loadRetirements(); // Reload the list
          } else {
            this.alertService.error('Failed to approve retirement request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error approving retirement:', error);
          this.alertService.error('Failed to approve retirement request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(approveSub);
  }

  rejectRetirement() {
    if (!this.selectedRetirementRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'rejecting';

    const rejectSub = this.retirementService
      .rejectRetirement(this.selectedRetirementRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retirement request rejected successfully'
            );
            this.showEmployeeDetails = false;
            this.loadRetirements(); // Reload the list
          } else {
            this.alertService.error('Failed to reject retirement request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error rejecting retirement:', error);
          this.alertService.error('Failed to reject retirement request');
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

  onCreateRetirementRequest() {
    this.showCreateRetirementRequest = true;
  }

  onCloseCreateRetirementRequest() {
    console.log('Closing retirement request form');
    this.showCreateRetirementRequest = false;
  }

  onCloseViewRetirementDetails() {
    this.showEmployeeDetails = false;
  }

  onCreateRetirementRequestSubmitted(data: any) {
    this.isLoading = true;
    this.loadingOperation = 'creating';

    // Transform the data from leave-details component to match API expectations
    const retirementData = {
      employeeId: parseInt(data.employeeId),
      recommendedReplacement: parseInt(data.recommendedReplacement),
      reason: data.reason,
      documents: data.documents || [],
    };

    const createSub = this.retirementService
      .createRetirement(retirementData)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Retirement request created successfully'
            );
            this.showCreateRetirementRequest = false;
            this.loadRetirements(); // Reload the list
          } else {
            this.alertService.error('Failed to create retirement request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error creating retirement:', error);
          this.alertService.error('Failed to create retirement request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(createSub);
  }
}
