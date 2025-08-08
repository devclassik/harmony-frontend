import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { DisciplineService } from '../../services/discipline.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import {
  DisciplineRecord,
  DisciplineEmployee,
  DisciplineRecordDetailed,
  CreateDisciplineRequest,
  DisciplineType,
} from '../../dto/discipline.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employee-discipline',
  imports: [
    CommonModule,
    ComponentsModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    LoadingOverlayComponent,
    LeaveDetailsComponent,
  ],
  templateUrl: './employee-discipline.component.html',
  styleUrl: './employee-discipline.component.css',
})
export class EmployeeDisciplineComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  showCreateDisciplineRequest: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedDisciplineRecord: DisciplineRecord | null = null;
  selectedDisciplineHistory: any[] = []; // Store discipline history separately
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'approving' | 'rejecting' | 'creating' | null =
    null;
  pendingAction: 'approve' | 'reject' | null = null;

  // Store all disciplines and raw data
  allDisciplines: DisciplineRecord[] = [];

  // Role-based button visibility - only show for HOD/Pastor
  get shouldShowCreateButton(): boolean {
    const userRole = this.authService.getWorkerRole()?.toLowerCase();
    return userRole === 'pastor' || userRole === 'hod';
  }

  // Filter disciplines to show only those for the selected employee
  get selectedEmployeeDisciplines(): DisciplineRecord[] {
    if (!this.selectedDisciplineRecord || !this.allDisciplines) {
      return [];
    }

    // Get the selected employee's ID
    const selectedEmployeeId = this.selectedDisciplineRecord.employee.id;

    // Filter disciplines to only show those for this employee
    return this.allDisciplines.filter(
      (discipline) => discipline.employee.id === selectedEmployeeId
    );
  }

  private subscriptions: Subscription[] = [];

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Approving Discipline...';
      case 'rejecting':
        return 'Rejecting Discipline...';
      case 'loading':
      default:
        return 'Loading Disciplines...';
    }
  }

  get getLoadingMessage(): string {
    switch (this.loadingOperation) {
      case 'approving':
        return 'Please wait while we approve the discipline request.';
      case 'rejecting':
        return 'Please wait while we reject the discipline request.';
      case 'creating':
        return 'Please wait while we create the discipline request.';
      case 'loading':
      default:
        return 'Please wait while we fetch discipline data.';
    }
  }

  constructor(
    private disciplineService: DisciplineService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDisciplines();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'DISCIPLINE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'disciplineType', label: 'TYPE OF DISCIPLINE' },
    { key: 'status', label: 'STATUS' },
    { key: 'duration', label: 'DURATION' },
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

  loadDisciplines() {
    this.isLoading = true;
    this.loadingOperation = 'loading';

    const disciplinesSub = this.disciplineService
      .getAllDisciplines()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.allDisciplines = response.data;
            this.employees = this.transformDisciplinesToTableData(
              response.data
            );
            this.applyFilters();
          } else {
            this.alertService.error('Failed to load disciplines');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error loading disciplines:', error);
          this.alertService.error('Failed to load disciplines');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(disciplinesSub);
  }

  transformDisciplinesToTableData(
    disciplines: DisciplineRecord[]
  ): TableData[] {
    return disciplines.map((discipline) => ({
      id: discipline.id.toString(),
      name: `${discipline.employee.firstName} ${discipline.employee.lastName}`,
      disciplineType: this.formatDisciplineType(discipline.disciplineType),
      status: this.mapDisciplineStatus(discipline.status),
      duration: `${discipline.duration} ${this.formatDurationUnit(
        discipline.durationUnit
      )}`,
      imageUrl: this.formatImageUrl(discipline.employee.photoUrl),
      // Store additional data for later use
      disciplineId: discipline.id,
      employeeId: discipline.employee.id,
      // Store original discipline type for filtering
      originalDisciplineType: discipline.disciplineType,
    }));
  }

  // Helper function to format discipline type
  formatDisciplineType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // Helper function to format duration unit
  formatDurationUnit(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }

  // Helper function to map discipline status
  mapDisciplineStatus(status: string): TableData['status'] {
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

        const discipline = this.allDisciplines.find(
          (p) => p.id.toString() === employee.id
        );
        return discipline && discipline.status === apiStatus;
      });
    }

    if (this.selectedFilter) {
      filtered = filtered.filter(
        (employee) => employee.originalDisciplineType === this.selectedFilter
      );
    }

    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.disciplineType?.toLowerCase().includes(search) ||
          employee.duration?.toLowerCase().includes(search)
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

      // Call the detailed discipline API instead of using existing data
      const disciplineId = parseInt(event.row.id);
      const detailSub = this.disciplineService
        .getDisciplineDetails(disciplineId)
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              console.log('Detailed discipline data:', response.data);

              // Set the detailed discipline record
              this.selectedDisciplineRecord =
                this.convertDetailedToDisciplineRecord(response.data);

              // Convert the detailed employee data to EmployeeDetails format
              this.selectedEmployeeDetails =
                this.convertDetailedEmployeeToEmployeeDetails(
                  response.data.employee
                );

              // Extract discipline history
              this.selectedDisciplineHistory = response.data.history || [];

              // Show the employee details modal
              this.showEmployeeDetails = true;
              console.log(
                'Selected discipline record status:',
                this.selectedDisciplineRecord?.status
              );
            } else {
              this.alertService.error('Failed to load discipline details');
            }
            this.isLoading = false;
            this.loadingOperation = null;
          },
          error: (error) => {
            console.error('Error loading discipline details:', error);
            this.alertService.error('Failed to load discipline details');
            this.isLoading = false;
            this.loadingOperation = null;
          },
        });

      this.subscriptions.push(detailSub);
    }
  }

  // Convert detailed discipline response to DisciplineRecord format
  convertDetailedToDisciplineRecord(
    detailed: DisciplineRecordDetailed
  ): DisciplineRecord {
    return {
      id: detailed.id,
      disciplineId: detailed.disciplineId,
      status: detailed.status as 'PENDING' | 'APPROVED' | 'REJECTED',
      disciplineType: detailed.disciplineType,
      reason: detailed.reason,
      duration: detailed.duration,
      durationUnit: detailed.durationUnit,
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
    if (!this.selectedDisciplineRecord) {
      this.alertService.error('No discipline record selected');
      return;
    }

    const employeeName = `${this.selectedDisciplineRecord.employee.firstName} ${this.selectedDisciplineRecord.employee.lastName}`;

    if (result) {
      // Approve action
      this.pendingAction = 'approve';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to approve the discipline request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      // Reject action
      this.pendingAction = 'reject';
      this.promptConfig = {
        title: 'Confirm',
        text: `Are you sure you want to reject the discipline request for ${employeeName}?`,
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    this.showModal = false;

    if (confirmed && this.selectedDisciplineRecord && this.pendingAction) {
      if (this.pendingAction === 'approve') {
        this.approveDiscipline();
      } else if (this.pendingAction === 'reject') {
        this.rejectDiscipline();
      }
    }

    this.pendingAction = null;
  }

  approveDiscipline() {
    if (!this.selectedDisciplineRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'approving';

    const approveSub = this.disciplineService
      .approveDiscipline(this.selectedDisciplineRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Discipline request approved successfully'
            );
            this.loadDisciplines(); // Reload the disciplines list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to approve discipline request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error approving discipline:', error);
          this.alertService.error('Failed to approve discipline request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(approveSub);
  }

  rejectDiscipline() {
    if (!this.selectedDisciplineRecord) return;

    this.isLoading = true;
    this.loadingOperation = 'rejecting';

    const rejectSub = this.disciplineService
      .rejectDiscipline(this.selectedDisciplineRecord.id)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Discipline request rejected successfully'
            );
            this.loadDisciplines(); // Reload the disciplines list
            this.showEmployeeDetails = false;
          } else {
            this.alertService.error('Failed to reject discipline request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error rejecting discipline:', error);
          this.alertService.error('Failed to reject discipline request');
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

  // Create discipline request methods
  onCreateDisciplineRequest() {
    this.showCreateDisciplineRequest = true;
  }

  onCloseCreateDisciplineRequest() {
    this.showCreateDisciplineRequest = false;
  }

  onCreateDisciplineRequestSubmitted(data: {
    employeeId: number;
    disciplineType: string;
    reason: string;
    duration: number;
    durationUnit: string;
  }) {
    this.isLoading = true;
    this.loadingOperation = 'creating';

    // Convert durationUnit to proper type
    const disciplineData: CreateDisciplineRequest = {
      employeeId: data.employeeId,
      disciplineType: data.disciplineType as any, // Will be validated by backend
      reason: data.reason,
      duration: data.duration,
      durationUnit: data.durationUnit.toUpperCase() as
        | 'DAYS'
        | 'WEEKS'
        | 'MONTHS',
    };

    const createSub = this.disciplineService
      .createDiscipline(disciplineData)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.alertService.success(
              'Discipline request created successfully'
            );
            this.loadDisciplines(); // Reload the disciplines list
            this.showCreateDisciplineRequest = false;
          } else {
            this.alertService.error('Failed to create discipline request');
          }
          this.isLoading = false;
          this.loadingOperation = null;
        },
        error: (error) => {
          console.error('Error creating discipline:', error);
          this.alertService.error('Failed to create discipline request');
          this.isLoading = false;
          this.loadingOperation = null;
        },
      });

    this.subscriptions.push(createSub);
  }
}
