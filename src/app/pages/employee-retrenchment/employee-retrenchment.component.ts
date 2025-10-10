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
  RetrenchmentRecordDetailed,
} from '../../dto/retrenchment.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.development';

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
  selectedStatus = '';
  selectedFilter = '';
  searchValue = '';
  showModal = false;
  showCreateRetrenchmentRequest = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedRetrenchmentRecord: RetrenchmentRecord | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails = false;
  isLoading = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null = null;
  pendingAction: 'approve' | 'reject' | null = null;
  allRetrenchments: RetrenchmentRecord[] = [];

  private subscriptions: Subscription[] = [];

  // --- Cached Getter Values ---
  private _shouldShowCreateButton?: boolean;
  private _shouldShowModalButtons?: boolean;
  private _loadingTitleCache?: string;
  private _loadingMessageCache?: string;
  private _selectedEmployeeRetrenchmentsCache?: RetrenchmentRecord[];
  private lastSelectedEmployeeId?: number;

  constructor(
    private retrenchmentService: RetrenchmentService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRetrenchments();
    this.cacheRoleBasedValues();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  // =====================================================
  // CACHED GETTERS
  // =====================================================

  get shouldShowCreateButton(): boolean {
    if (this._shouldShowCreateButton === undefined) {
      const userRole = this.authService.getWorkerRole()?.toLowerCase();
      this._shouldShowCreateButton = ['pastor', 'hod', 'zonal_pastor', 'district_pastor'].includes(userRole ?? '');
    }
    return this._shouldShowCreateButton;
  }

  get shouldShowModalButtons(): boolean {
    if (this._shouldShowModalButtons === undefined) {
      const userRole = this.authService.getWorkerRole()?.toLowerCase();
      this._shouldShowModalButtons = ['pastor', 'hod', 'zonal_pastor', 'district_pastor'].includes(userRole ?? '');
    }
    return this._shouldShowModalButtons;
  }

  get selectedEmployeeRetrenchments(): RetrenchmentRecord[] {
    if (
      this.selectedRetrenchmentRecord?.employee?.id !== this.lastSelectedEmployeeId
    ) {
      this.lastSelectedEmployeeId = this.selectedRetrenchmentRecord?.employee?.id;
      if (this.lastSelectedEmployeeId && this.allRetrenchments) {
        this._selectedEmployeeRetrenchmentsCache = this.allRetrenchments.filter(
          (r) => r.employee.id === this.lastSelectedEmployeeId
        );
      } else {
        this._selectedEmployeeRetrenchmentsCache = [];
      }
    }
    return this._selectedEmployeeRetrenchmentsCache ?? [];
  }

  get loadingTitle(): string {
    if (this._loadingTitleCache && this.loadingOperation === null) {
      return this._loadingTitleCache;
    }
    const value = {
      approving: 'Approving Retrenchment...',
      rejecting: 'Rejecting Retrenchment...',
      loading: 'Loading Retrenchments...',
      creating: 'Creating Retrenchment...',
    }[this.loadingOperation ?? 'loading'];
    this._loadingTitleCache = value;
    return value;
  }

  get getLoadingMessage(): string {
    if (this._loadingMessageCache && this.loadingOperation === null) {
      return this._loadingMessageCache;
    }
    const value = {
      approving: 'Please wait while we approve the retrenchment request.',
      rejecting: 'Please wait while we reject the retrenchment request.',
      creating: 'Please wait while we create the retrenchment request.',
      loading: 'Please wait while we fetch retrenchment data.',
    }[this.loadingOperation ?? 'loading'];
    this._loadingMessageCache = value;
    return value;
  }

  // =====================================================
  // TABLE SETUP
  // =====================================================

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
    { label: 'All', value: '', icon: 'M12 2C6.48 2 2 6.48...' },
    { label: 'Pastor', value: 'PASTOR', icon: 'M5 13l4 4L19 7' },
    { label: 'Senior Pastor', value: 'SENIOR_PASTOR', icon: 'M5 13l4 4L19 7' },
    { label: 'Cleaner', value: 'CLEANER', icon: 'M5 13l4 4L19 7' },
    { label: 'HOD', value: 'HOD', icon: 'M5 13l4 4L19 7' },
    { label: 'Worker', value: 'WORKER', icon: 'M5 13l4 4L19 7' },
    { label: 'Minister', value: 'MINISTER', icon: 'M5 13l4 4L19 7' },
    { label: 'Overseer', value: 'OVERSEER', icon: 'M5 13l4 4L19 7' },
  ];

  // =====================================================
  // MAIN METHODS
  // =====================================================

  private cacheRoleBasedValues() {
    this._shouldShowCreateButton = undefined;
    this._shouldShowModalButtons = undefined;
  }

  loadRetrenchments() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const retrenchmentsSub = this.retrenchmentService.getAllRetrenchments().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.allRetrenchments = response.data;
          this.employees = this.transformRetrenchmentsToTableData(response.data);
          this.applyFilters();
        } else {
          this.alertService.error('Failed to load retrenchments');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: () => {
        this.alertService.error('Failed to load retrenchments');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });

    this.subscriptions.push(retrenchmentsSub);
  }

  transformRetrenchmentsToTableData(retrenchments: RetrenchmentRecord[]): TableData[] {
    return retrenchments.map((retrenchment) => ({
      id: retrenchment.id.toString(),
      name: `${retrenchment.employee.firstName} ${retrenchment.employee.lastName}`,
      retrenchmentType: this.formatRetrenchmentType(retrenchment.retrenchmentType),
      status: this.mapRetrenchmentStatus(retrenchment.status) as 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'On leave' | 'Retired' | 'On Discipline' | 'Assigned' | 'Unassigned',
      imageUrl: this.formatImageUrl(retrenchment.employee.photoUrl),
      originalData: retrenchment,
    }));
  }

  formatRetrenchmentType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  mapRetrenchmentStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return map[status.toUpperCase()] || 'Pending';
  }

  formatImageUrl(url: string | null): string {
    if (!url) return 'assets/svg/gender.svg';
    if (url.startsWith('http')) return url;
    const baseUrl = environment.hostingAPI;
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
      filtered = filtered.filter((e) => e.status === this.selectedStatus);
    }
    if (this.selectedFilter) {
      filtered = filtered.filter((e) => e.retrenchmentType === this.selectedFilter);
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name?.toLowerCase().includes(search) ||
          e.id.toLowerCase().includes(search) ||
          e.retrenchmentType?.toLowerCase().includes(search) ||
          e.status?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    if (event.action === 'View') this.loadRetrenchmentDetails(event.row);
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
            this.selectedRetrenchmentRecord = this.convertDetailedToRetrenchmentRecord(response.data);
            this.selectedEmployeeDetails = response.data.employee as any;
            this.selectedEmployeeRecord = row;
            this.showEmployeeDetails = true;
          } else {
            this.alertService.error('Failed to load retrenchment details');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: () => {
          this.alertService.error('Failed to load retrenchment details');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(detailsSub);
  }

  convertDetailedToRetrenchmentRecord(d: RetrenchmentRecordDetailed): RetrenchmentRecord {
    return {
      id: d.id,
      retrenchmentId: d.retrenchmentId,
      retrenchmentType: d.retrenchmentType,
      reason: d.reason,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      deletedAt: d.deletedAt,
      employee: d.employee,
    };
  }

  actionButton: MenuItem[] = [{ label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' }];

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
    if (confirmed && this.pendingAction) {
      this.pendingAction === 'approve'
        ? this.approveRetrenchment()
        : this.rejectRetrenchment();
    }
    this.showModal = false;
    this.pendingAction = null;
  }

  approveRetrenchment() {
    if (!this.selectedRetrenchmentRecord) return;
    this.isLoading = true;
    this.loadingOperation = 'approving';
    const sub = this.retrenchmentService
      .approveRetrenchment(this.selectedRetrenchmentRecord.id, { status: 'APPROVED' })
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.alertService.success('Retrenchment approved successfully');
            this.showEmployeeDetails = false;
            this.loadRetrenchments();
          } else this.alertService.error('Approval failed');
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: () => {
          this.alertService.error('Approval failed');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });
    this.subscriptions.push(sub);
  }

  rejectRetrenchment() {
    if (!this.selectedRetrenchmentRecord) return;
    this.isLoading = true;
    this.loadingOperation = 'rejecting';
    const sub = this.retrenchmentService
      .rejectRetrenchment(this.selectedRetrenchmentRecord.id, { status: 'REJECTED' })
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.alertService.success('Retrenchment rejected successfully');
            this.showEmployeeDetails = false;
            this.loadRetrenchments();
          } else this.alertService.error('Rejection failed');
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: () => {
          this.alertService.error('Rejection failed');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });
    this.subscriptions.push(sub);
  }

  onModalClose() {
    this.showModal = false;
    this.pendingAction = null;
  }

  onCreateRetrenchmentRequest() {
    this.showCreateRetrenchmentRequest = true;
  }

  onCloseCreateRetrenchmentRequest() {
    this.showCreateRetrenchmentRequest = false;
  }

  onCreateRetrenchmentRequestSubmitted(data: any) {
    this.isLoading = true;
    this.loadingOperation = 'creating';
    const retrenchmentData = {
      employeeId: parseInt(data.employeeId),
      reason: data.reason,
      retrenchmentType: data.retrenchmentType,
    };
    const sub = this.retrenchmentService.createRetrenchment(retrenchmentData).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.alertService.success('Retrenchment created successfully');
          this.showCreateRetrenchmentRequest = false;
          this.loadRetrenchments();
        } else this.alertService.error('Creation failed');
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: () => {
        this.alertService.error('Creation failed');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });
    this.subscriptions.push(sub);
  }
}
