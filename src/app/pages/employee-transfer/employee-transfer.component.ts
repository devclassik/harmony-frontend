import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';

import { TransferService } from '../../services/transfer.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { EmployeeDetails } from '../../dto';
import {
  CreateTransferRequest,
  TransferRecord,
  TransferRecordDetailed,
} from '../../dto/transfer.dto';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-employee-transfer',
  imports: [
    CommonModule,
    ComponentsModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    LoadingOverlayComponent,
    LeaveDetailsComponent,
  ],
  templateUrl: './employee-transfer.component.html',
  styleUrl: './employee-transfer.component.css',
})
export class EmployeeTransferComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  showCreateTransferRequest: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedTransferRecord: TransferRecord | null = null;
  selectedTransferHistory: any[] = []; // Store transfer history separately
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null =
    null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Store all Transfers and raw data
  allTransfers: TransferRecord[] = [];

  // Role-based button visibility - only show for HOD/Pastor
  get shouldShowCreateButton(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    return userRole === 'pastor' || userRole === 'hod';
  }

  // Filter Transfers to show only those for the selected employee
  get selectedEmployeeTransfers(): TransferRecord[] {
    if (!this.selectedTransferRecord || !this.allTransfers) {
      return [];
    }

    // Get the selected employee's ID
    const selectedEmployeeId = this.selectedTransferRecord.employee.id;

    // Filter Transfers to only show those for this employee
    return this.allTransfers.filter(
      (transfer) => transfer.employee.id === selectedEmployeeId
    );
  }

  private subscriptions: Subscription[] = [];

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Approving Transfer...';
      case 'rejecting':
        return 'Rejecting Tr...';
      case 'loading':
      default:
        return 'Loading Transfers...';
    }
  }

  get getLoadingMessage(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Please wait while we approve the Transfer request.';
      case 'rejecting':
        return 'Please wait while we reject the Transfer request.';
      case 'creating':
        return 'Please wait while we create the Transfer request.';
      case 'loading':
      default:
        return 'Please wait while we fetch Transfer data.';
    }
  }

  constructor(
    private transferService: TransferService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadTransfers();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'TRANSFER ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'transferType', label: 'TRANSFER TYPE' },
    { key: 'destination', label: 'DESTINATION' },
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
    { label: 'Verbal', value: 'VERBAL', icon: 'M5 13l4 4L19 7' },
    { label: 'Written', value: 'WRITTEN', icon: 'M5 13l4 4L19 7' },
    { label: 'Suspension', value: 'SUSPENSION', icon: 'M5 13l4 4L19 7' },
    { label: 'Termination', value: 'TERMINATION', icon: 'M5 13l4 4L19 7' },
  ];

  loadTransfers() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const transfersSub = this.transferService.getAllTransfers().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.allTransfers = response.data;
          this.employees = this.transformTransfersToTableData(response.data);
          this.applyFilters();
        } else {
          this.alertService.error('Failed to load transfers');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: (error) => {
        console.error('Error loading transfers:', error);
        this.alertService.error('Failed to load transfers');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });

    this.subscriptions.push(transfersSub);
  }

  transformTransfersToTableData(transfers: TransferRecord[]): TableData[] {
    return transfers.map((transfer) => ({
      id: transfer.id.toString(),
      name: `${transfer.employee.firstName} ${transfer.employee.lastName}`,
      transferType: this.formatTransferType(transfer.transferType),
      status: this.mapTransferStatus(transfer.status),
      destination: transfer.destination,
      imageUrl: this.formatImageUrl(transfer.employee.photoUrl),
      // Store additional data for later use
      transferId: transfer.id,
      employeeId: transfer.employee.id,
      // Store original transfer type for filtering
      originalTransferType: transfer.transferType,
    }));
  }

  // Helper function to format Transfer type
  formatTransferType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // Helper function to format duration unit
  formatDurationUnit(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }

  // Helper function to map Transfer status
  mapTransferStatus(status: string): TableData['status'] {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
      case 'APPROVE':
        return 'Approved';
      case 'REJECTED':
      case 'REJECT':
        return 'Rejected';
      default:
        return 'Pending';
    }
  }

  // Helper function to format image URLs
  formatImageUrl(url: string | null | undefined): string {
    if (!url || url === '') {
      return 'assets/svg/gender.svg';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  onStatusTabChange(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
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
        (employee) => employee.transferType === this.selectedFilter
      );
    }

    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.transferType?.toLowerCase().includes(search) ||
          employee.destination?.toLowerCase().includes(search)
      );
    }

    this.filteredEmployees = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log('Menu action event:', event);

    if (event.action === 'View') {
      this.selectedEmployeeRecord = event.row;

      // Set loading state for the detail view
      this.isLoading = true;
      this.loadingOperation = 'loading';

      // Call the detailed Transfer API instead of using existing data
      const transferId = parseInt(event.row.id);
      const detailSub = this.transferService
        .getTransferDetails(transferId)
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              console.log('Detailed Transfer data:', response.data);

              // Set the detailed Transfer record
              this.selectedTransferRecord =
                this.convertDetailedToTransferRecord(response.data);

              // Convert the detailed employee data to EmployeeDetails format
              this.selectedEmployeeDetails =
                this.convertDetailedEmployeeToEmployeeDetails(
                  response.data.employee
                );

              // Extract Transfer history
              this.selectedTransferHistory = response.data.history || [];

              // Show the employee details modal
              this.showEmployeeDetails = true;
              console.log(
                'Selected transfer record status:',
                this.selectedTransferRecord?.status
              );
            } else {
              this.alertService.error('Failed to load transfer details');
            }
            this.isLoading = false;
            this.loadingOperation = null;
          },
          error: (error) => {
            console.error('Error loading transfer details:', error);
            this.alertService.error('Failed to load transfer details');
            this.isLoading = false;
            this.loadingOperation = null;
          },
        });

      this.subscriptions.push(detailSub);
    }
  }

  // Convert detailed Transfer response to TransferRecord format
  convertDetailedToTransferRecord(
    detailed: TransferRecordDetailed
  ): TransferRecord {
    return {
      id: detailed.id,
      transferId: detailed.transferId,
      status: detailed.status as 'PENDING' | 'APPROVED' | 'REJECTED',
      transferType: detailed.transferType,
      reason: detailed.reason,
      destination: detailed.destination,
      newPosition: detailed.newPosition,
      createdAt: detailed.createdAt,
      updatedAt: detailed.updatedAt,
      deletedAt: detailed.deletedAt,
      employee: {
        id: detailed.employee.id,
        employeeId: detailed.employee.employeeId,
        title: detailed.employee.title,
        firstName: detailed.employee.firstName,
        lastName: detailed.employee.lastName,
        middleName: detailed.employee.middleName,
        gender: detailed.employee.gender,
        profferedName: detailed.employee.profferedName,
        primaryPhone: detailed.employee.primaryPhone,
        primaryPhoneType: detailed.employee.primaryPhoneType,
        altPhone: detailed.employee.altPhone,
        altPhoneType: detailed.employee.altPhoneType,
        dob: detailed.employee.dob,
        maritalStatus: detailed.employee.maritalStatus,
        everDivorced: detailed.employee.everDivorced,
        beenConvicted: detailed.employee.beenConvicted,
        hasQuestionableBackground: detailed.employee.hasQuestionableBackground,
        hasBeenInvestigatedForMisconductOrAbuse:
          detailed.employee.hasBeenInvestigatedForMisconductOrAbuse,
        photoUrl: detailed.employee.photoUrl,
        altEmail: detailed.employee.altEmail,
        employeeStatus: detailed.employee.employeeStatus,
        employmentType: detailed.employee.employmentType,
        serviceStartDate: detailed.employee.serviceStartDate,
        retiredDate: detailed.employee.retiredDate,
        createdAt: detailed.employee.createdAt,
        updatedAt: detailed.employee.updatedAt,
        deletedAt: detailed.employee.deletedAt,
        nationIdNumber: detailed.employee.nationIdNumber,
        user: detailed.employee.user,
      },
    };
  }

  // Convert detailed employee data to EmployeeDetails format
  convertDetailedEmployeeToEmployeeDetails(employee: any): EmployeeDetails {
    return {
      id: employee.id,
      employeeId: employee.employeeId,
      title: employee.title,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      gender: employee.gender,
      profferedName: employee.profferedName,
      primaryPhone: employee.primaryPhone,
      primaryPhoneType: employee.primaryPhoneType,
      altPhone: employee.altPhone,
      altPhoneType: employee.altPhoneType,
      dob: employee.dob,
      maritalStatus: employee.maritalStatus,
      everDivorced: employee.everDivorced,
      beenConvicted: employee.beenConvicted,
      hasQuestionableBackground: employee.hasQuestionableBackground,
      hasBeenInvestigatedForMisconductOrAbuse:
        employee.hasBeenInvestigatedForMisconductOrAbuse,
      photoUrl: employee.photoUrl,
      altEmail: employee.altEmail,
      employeeStatus: employee.employeeStatus,
      employmentType: employee.employmentType,
      serviceStartDate: employee.serviceStartDate,
      retiredDate: employee.retiredDate,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      deletedAt: employee.deletedAt,
      nationIdNumber: employee.nationIdNumber,
      recentCredentialsNameArea: null,
      user: employee.user
        ? {
            id: employee.user.id,
            email: employee.user.email,
            password: employee.user.password,
            verifyEmailOTP: employee.user.verifyEmailOTP,
            isEmailVerified: employee.user.isEmailVerified,
            passwordResetOTP: employee.user.passwordResetOTP,
            isLoggedIn: employee.user.isLoggedIn,
            createdAt: employee.user.createdAt,
            updatedAt: employee.user.updatedAt,
            deletedAt: employee.user.deletedAt,
            role: {
              id: 0,
              name: 'Employee',
              createdAt: employee.user.createdAt,
              updatedAt: employee.user.updatedAt,
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

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  actionToPerform(result: boolean) {
    if (!this.selectedTransferRecord) {
      this.alertService.error('No transfer record selected');
      return;
    }

    const employeeName = `${this.selectedTransferRecord.employee.firstName} ${this.selectedTransferRecord.employee.lastName}`;

    if (result) {
      // Approve action
      this.pendingAction = 'approve';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to approve the transfer request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      // Reject action
      this.pendingAction = 'reject';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to reject the transfer request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    this.showModal = false;

    if (confirmed && this.selectedTransferRecord && this.pendingAction) {
      if (this.pendingAction === 'approve') {
        this.approveTransfer();
      } else if (this.pendingAction === 'reject') {
        this.rejectTransfer();
      }
    }

    this.pendingAction = null;
  }

  approveTransfer() {
    if (!this.selectedTransferRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'approving';

    const approveSub = this.transferService
      .approveTransfer(this.selectedTransferRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success('Transfer request approved successfully');
            this.loadTransfers(); // Reload the transfers list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to approve transfer request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error approving transfer:', error);
          this.alertService.error('Failed to approve transfer request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(approveSub);
  }

  rejectTransfer() {
    if (!this.selectedTransferRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'rejecting';

    const rejectSub = this.transferService
      .rejectTransfer(this.selectedTransferRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success('Transfer request rejected successfully');
            this.loadTransfers(); // Reload the transfers list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to reject transfer request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error rejecting transfer:', error);
          this.alertService.error('Failed to reject transfer request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(rejectSub);
  }

  onModalClose() {
    this.showModal = false;
    this.promptConfig = null;
  }

  // Create Transfer request methods
  onCreateTransferRequest() {
    this.showCreateTransferRequest = true;
  }

  onCloseCreateTransferRequest() {
    this.showCreateTransferRequest = false;
  }

  onCreateTransferRequestSubmitted(data: {
    employeeId: number;
    transferType: string;
    reason: string;
    destination: string;
    newPosition: string;
  }) {
    this.isLoading = true;
    this.loadingOperation = 'creating';

    // Convert durationUnit to proper type
    const transferData: CreateTransferRequest = {
      employeeId: data.employeeId,
      transferType: data.transferType as any, // Will be validated by backend
      reason: data.reason,
      destination: data.destination,
      newPosition: data.newPosition,
    };

    const createSub = this.transferService
      .createTransfer(transferData)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success('Transfer request created successfully');
            this.loadTransfers(); // Reload the transfers list
            this.showCreateTransferRequest = false;
          } else {
            this.alertService.error('Failed to create transfer request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error creating transfer:', error);
          this.alertService.error('Failed to create transfer request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(createSub);
  }
}
