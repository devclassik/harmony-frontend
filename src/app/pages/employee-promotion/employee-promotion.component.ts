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
import { PromotionService } from '../../services/promotion.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import {
  PromotionRecord,
  PromotionEmployee,
  PromotionRecordDetailed,
} from '../../dto/promotion.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

interface Position {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-employee-promotion',
  imports: [
    CommonModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    LoadingOverlayComponent,
    LeaveDetailsComponent,
  ],
  templateUrl: './employee-promotion.component.html',
  styleUrl: './employee-promotion.component.css',
})
export class EmployeePromotionComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  showCreatePromotionRequest: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedPromotionRecord: PromotionRecord | null = null;
  selectedAppraisalData: any[] = []; // Store appraisal data separately
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAppraisal: boolean = false;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null =
    null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Store all promotions and raw data
  allPromotions: PromotionRecord[] = [];

  // Role-based button visibility - only show for HOD/Pastor
  get shouldShowCreateButton(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    return userRole === 'pastor' || userRole === 'hod';
  }

  // Separate visibility logic for approve/reject buttons in modal
  get shouldShowModalButtons(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    console.log('Current user role for modal buttons:', userRole);
    return userRole === 'pastor' || userRole === 'hod';
  }

  // Filter promotions to show only those for the selected employee
  get selectedEmployeePromotions(): PromotionRecord[] {
    if (!this.selectedPromotionRecord || !this.allPromotions) {
      return [];
    }

    // Get the selected employee's ID
    const selectedEmployeeId = this.selectedPromotionRecord.employee.id;

    // Filter promotions to only show those for this employee
    return this.allPromotions.filter(
      (promotion) => promotion.employee.id === selectedEmployeeId
    );
  }

  private subscriptions: Subscription[] = [];

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Approving Promotion...';
      case 'rejecting':
        return 'Rejecting Promotion...';
      case 'loading':
      default:
        return 'Loading Promotions...';
    }
  }

  get getLoadingMessage(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Please wait while we approve the promotion request.';
      case 'rejecting':
        return 'Please wait while we reject the promotion request.';
      case 'creating':
        return 'Please wait while we create the promotion request.';
      case 'loading':
      default:
        return 'Please wait while we fetch promotion data.';
    }
  }

  constructor(
    private promotionService: PromotionService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPromotions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'PROMOTION ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'role', label: 'NEW ROLE' },
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

  filterTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  positions: Position[] = [
    { label: 'HOD', value: 'HOD', icon: 'M5 13l4 4L19 7' },
    { label: 'Worker', value: 'WORKER', icon: 'M5 13l4 4L19 7' },
    { label: 'Minister', value: 'MINISTER', icon: 'M5 13l4 4L19 7' },
    { label: 'Admin', value: 'ADMIN', icon: 'M5 13l4 4L19 7' },
  ];

  loadPromotions() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const promotionsSub = this.promotionService.getAllPromotions().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.allPromotions = response.data;
          this.employees = this.transformPromotionsToTableData(response.data);
          this.applyFilters();
        } else {
          this.alertService.error('Failed to load promotions');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.alertService.error('Failed to load promotions');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });

    this.subscriptions.push(promotionsSub);
  }

  transformPromotionsToTableData(promotions: PromotionRecord[]): TableData[] {
    return promotions.map((promotion) => ({
      id: promotion.id.toString(),
      name: `${promotion.employee.firstName} ${promotion.employee.lastName}`,
      role: this.formatPosition(promotion.newPosition),
      status: this.mapPromotionStatus(promotion.status),
      imageUrl: this.formatImageUrl(promotion.employee.photoUrl),
      // Store additional data for later use
      promotionId: promotion.id,
      employeeId: promotion.employee.id,
    }));
  }

  // Helper function to format position names
  formatPosition(position: string): string {
    return position
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to map promotion status
  mapPromotionStatus(status: string): TableData['status'] {
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

        const promotion = this.allPromotions.find(
          (p) => p.id.toString() === employee.id
        );
        return promotion && promotion.status === apiStatus;
      });
    }

    if (this.selectedFilter) {
      filtered = filtered.filter((employee) => {
        const promotion = this.allPromotions.find(
          (p) => p.id.toString() === employee.id
        );
        return promotion && promotion.newPosition === this.selectedFilter;
      });
    }

    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.role?.toLowerCase().includes(search)
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

      // Call the detailed promotion API instead of using existing data
      const promotionId = parseInt(event.row.id);
      const detailSub = this.promotionService
        .getPromotionDetails(promotionId)
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              console.log('Detailed promotion data:', response.data);

              // Set the detailed promotion record
              this.selectedPromotionRecord =
                this.convertDetailedToPromotionRecord(response.data);

              // Convert the detailed employee data to EmployeeDetails format
              this.selectedEmployeeDetails =
                this.convertDetailedEmployeeToEmployeeDetails(
                  response.data.employee
                );

              // Extract appraisal data
              this.selectedAppraisalData =
                response.data.employee.appraisals || [];

              // Show the employee details modal
              this.showEmployeeDetails = true;
              console.log(
                'Selected promotion record status:',
                this.selectedPromotionRecord?.status
              );
            } else {
              this.alertService.error('Failed to load promotion details');
            }
            this.isLoading = false;
            this.loadingOperation = null;
          },
          error: (error) => {
            console.error('Error loading promotion details:', error);
            this.alertService.error('Failed to load promotion details');
            this.isLoading = false;
            this.loadingOperation = null;
          },
        });

      this.subscriptions.push(detailSub);
    }
  }

  convertToEmployeeDetails(
    promotionEmployee: PromotionEmployee
  ): EmployeeDetails {
    return {
      id: promotionEmployee.id,
      employeeId: promotionEmployee.employeeId,
      title: promotionEmployee.title,
      firstName: promotionEmployee.firstName,
      lastName: promotionEmployee.lastName,
      middleName: promotionEmployee.middleName,
      gender: promotionEmployee.gender,
      profferedName: promotionEmployee.profferedName,
      primaryPhone: promotionEmployee.primaryPhone,
      primaryPhoneType: promotionEmployee.primaryPhoneType,
      altPhone: promotionEmployee.altPhone,
      altPhoneType: promotionEmployee.altPhoneType,
      dob: promotionEmployee.dob,
      maritalStatus: promotionEmployee.maritalStatus,
      everDivorced: promotionEmployee.everDivorced,
      beenConvicted: promotionEmployee.beenConvicted,
      hasQuestionableBackground: promotionEmployee.hasQuestionableBackground,
      hasBeenInvestigatedForMisconductOrAbuse:
        promotionEmployee.hasBeenInvestigatedForMisconductOrAbuse,
      photoUrl: promotionEmployee.photoUrl,
      altEmail: promotionEmployee.altEmail,
      employeeStatus: promotionEmployee.employeeStatus,
      employmentType: promotionEmployee.employmentType,
      serviceStartDate: promotionEmployee.serviceStartDate,
      retiredDate: promotionEmployee.retiredDate,
      createdAt: promotionEmployee.createdAt,
      updatedAt: promotionEmployee.updatedAt,
      deletedAt: promotionEmployee.deletedAt,
      nationIdNumber: promotionEmployee.nationIdNumber,
      recentCredentialsNameArea: null,
      user: promotionEmployee.user
        ? {
            id: promotionEmployee.user.id,
            email: promotionEmployee.user.email,
            password: promotionEmployee.user.password,
            verifyEmailOTP: promotionEmployee.user.verifyEmailOTP,
            isEmailVerified: promotionEmployee.user.isEmailVerified,
            passwordResetOTP: promotionEmployee.user.passwordResetOTP,
            isLoggedIn: promotionEmployee.user.isLoggedIn,
            createdAt: promotionEmployee.user.createdAt,
            updatedAt: promotionEmployee.user.updatedAt,
            deletedAt: promotionEmployee.user.deletedAt,
            role: {
              id: 0,
              name: 'Employee',
              createdAt: promotionEmployee.user.createdAt,
              updatedAt: promotionEmployee.user.updatedAt,
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
      departments: [], // Not available in promotion data
      homeAddress: null,
      mailingAddress: null,
      departmentHeads: [],
      previousPositions: [],
      spiritualHistory: null,
    };
  }

  // Convert detailed promotion response to PromotionRecord format
  convertDetailedToPromotionRecord(
    detailed: PromotionRecordDetailed
  ): PromotionRecord {
    return {
      id: detailed.id,
      promotionId: detailed.promotionId,
      status: detailed.status as 'PENDING' | 'APPROVED' | 'REJECTED',
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

  // Convert detailed employee data to EmployeeDetails format (with appraisal data)
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
    if (!this.selectedPromotionRecord) {
      this.alertService.error('No promotion record selected');
      return;
    }

    const employeeName = `${this.selectedPromotionRecord.employee.firstName} ${this.selectedPromotionRecord.employee.lastName}`;
    const employeeImage = this.formatImageUrl(
      this.selectedPromotionRecord.employee.photoUrl
    );

    if (result) {
      // Approve action
      this.pendingAction = 'approve';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to approve the promotion request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      // Reject action
      this.pendingAction = 'reject';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to reject the promotion request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    this.showModal = false;

    if (confirmed && this.selectedPromotionRecord && this.pendingAction) {
      if (this.pendingAction === 'approve') {
        this.approvePromotion();
      } else if (this.pendingAction === 'reject') {
        this.rejectPromotion();
      }
    }

    this.pendingAction = null;
  }

  approvePromotion() {
    if (!this.selectedPromotionRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'approving';

    const approveSub = this.promotionService
      .approvePromotion(this.selectedPromotionRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Promotion request approved successfully'
            );
            this.loadPromotions(); // Reload the promotions list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to approve promotion request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error approving promotion:', error);
          this.alertService.error('Failed to approve promotion request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(approveSub);
  }

  rejectPromotion() {
    if (!this.selectedPromotionRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'rejecting';

    const rejectSub = this.promotionService
      .rejectPromotion(this.selectedPromotionRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Promotion request rejected successfully'
            );
            this.loadPromotions(); // Reload the promotions list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to reject promotion request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error rejecting promotion:', error);
          this.alertService.error('Failed to reject promotion request');
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

  // Create promotion request methods
  onCreatePromotionRequest() {
    this.showCreatePromotionRequest = true;
  }

  onCloseCreatePromotionRequest() {
    this.showCreatePromotionRequest = false;
  }

  onCreatePromotionRequestSubmitted(data: {
    employeeId: number;
    newPosition: string;
  }) {
    this.isLoading = true;
    this.loadingOperation = 'creating';

    const createSub = this.promotionService.createPromotion(data).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.alertService.success('Promotion request created successfully');
          this.loadPromotions(); // Reload the promotions list
          this.showCreatePromotionRequest = false;
        } else {
          this.alertService.error('Failed to create promotion request');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: (error) => {
        console.error('Error creating promotion:', error);
        this.alertService.error('Failed to create promotion request');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });

    this.subscriptions.push(createSub);
  }
}
