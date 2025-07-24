import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Services
import { ApiService } from '../../services/api.service';
import { EmployeeService } from '../../services/employee.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

// Components
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { ConfirmPromptComponent } from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import {
  TableComponent,
  FilterTab,
  MenuItem,
  TableHeader,
} from '../../components/table/table.component';

// Interfaces
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetails } from '../../dto/employee.dto';
import { EmployeeDetails as Employee } from '../../dto';
import { Template, TemplateType } from '../../dto/template.dto';

interface Organization {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  departments: Department[];
  headDepartment: Department;
}

interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members: Employee[];
  hod?: Employee;
  organization?: { id: number };
}

interface CreateDepartmentRequest {
  name: string;
  organizationId: number;
}

interface Permission {
  id: number;
  feature: string;
  label: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

interface Room {
  id?: number;
  name: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

interface Accommodation {
  id: number;
  name: string;
  type: 'HOTEL' | 'GUEST_HOUSE' | 'HOSTEL';
  isPetAllowed: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  rooms: Room[];
}

interface CreateAccommodationRequest {
  name: string;
  type: 'HOTEL' | 'GUEST_HOUSE' | 'HOSTEL';
  isPetAllowed: boolean;
  rooms: { name: string; capacity: number }[];
}

interface UpdateAccommodationRequest {
  name: string;
  type: 'HOTEL' | 'GUEST_HOUSE' | 'HOSTEL';
  isPetAllowed: boolean;
  rooms: { name: string; capacity: number; id?: number }[];
}

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    LoadingOverlayComponent,
    ConfirmPromptComponent,
    EmployeeDetailsComponent,
    LeaveDetailsComponent,
    TableComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Tab management
  activeTab: string = 'organization-structure';

  // Organization data
  organizations: Organization[] = [];
  isLoading = false;

  // User Management data
  employees: TableData[] = [];
  isLoadingEmployees = false;
  filteredEmployees: TableData[] = [];

  // Filter properties
  selectedDepartmentFilter: string = '';
  selectedRoleFilter: string = '';

  // Available filter options
  availableDepartments: string[] = [];
  availableRoles: string[] = [];

  // Table action menu items
  actionButton: MenuItem[] = [{ label: 'View', action: 'view', icon: 'eye' }];

  // Table configuration
  tableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'email', label: 'EMAIL ADDRESS' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'action', label: 'ACTION' },
  ];

  // Filter and status tabs
  filterTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'On Leave', value: 'On leave' },
    { label: 'Retired', value: 'Retired' },
  ];

  // Role options for employee creation
  roleOptions = [
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Pastor', value: 'PASTOR' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  // Employment type options
  employmentTypeOptions = [
    { label: 'hod', value: 'HOD' },
    { label: 'member', value: 'MEMBER' },
  ];

  // Accommodation type options
  accommodationTypeOptions = [
    { label: 'Hotel', value: 'HOTEL' },
    { label: 'Guest House', value: 'GUEST_HOUSE' },
    { label: 'Hostel', value: 'HOSTEL' },
  ];

  templateTypeOptions = [
    { label: 'Transfer Approval', value: 'TRANSFER_APPROVAL' },
    { label: 'Transfer Request', value: 'TRANSFER_REQUEST' },
    { label: 'Transfer Decline', value: 'TRANSFER_DECLINE' },
    { label: 'Sick Leave Approval', value: 'SICK_LEAVE_APPROVAL' },
    { label: 'Sick Leave Request', value: 'SICK_LEAVE_REQUEST' },
    { label: 'Sick Leave Decline', value: 'SICK_LEAVE_DECLINE' },
    { label: 'Annual Leave Approval', value: 'ANNUAL_LEAVE_APPROVAL' },
    { label: 'Annual Leave Request', value: 'ANNUAL_LEAVE_REQUEST' },
    { label: 'Annual Leave Decline', value: 'ANNUAL_LEAVE_DECLINE' },
    { label: 'Absence Leave Approval', value: 'ABSENCE_LEAVE_APPROVAL' },
    { label: 'Absence Leave Request', value: 'ABSENCE_LEAVE_REQUEST' },
    { label: 'Absence Leave Decline', value: 'ABSENCE_LEAVE_DECLINE' },
    { label: 'Promotion Approval', value: 'PROMOTION_APPROVAL' },
    { label: 'Promotion Request', value: 'PROMOTION_REQUEST' },
    { label: 'Promotion Decline', value: 'PROMOTION_DECLINE' },
    { label: 'Retirement Approval', value: 'RETIREMENT_APPROVAL' },
    { label: 'Retirement Request', value: 'RETIREMENT_REQUEST' },
    { label: 'Retirement Decline', value: 'RETIREMENT_DECLINE' },
    { label: 'Retrenchment Approval', value: 'RETRENCHMENT_APPROVAL' },
    { label: 'Retrenchment Request', value: 'RETRENCHMENT_REQUEST' },
    { label: 'Retrenchment Decline', value: 'RETRENCHMENT_DECLINE' },
    { label: 'Discipline', value: 'DISCIPLINE' },
  ];

  getCurrentDataCount(): number {
    return this.filteredEmployees.length;
  }

  // Search and filter states
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalEmployees: number = 0;

  // Create department modal
  showCreateDepartmentModal = false;
  isCreatingDepartment = false;
  showConfirmPrompt = false;
  promptConfig: any = null;

  // View team modal (using employee-details pattern)
  showTeamDetails = false;
  selectedTeamData: TableData | null = null;
  selectedTeamDepartment: Department | null = null;

  // User details modal (using employee-details pattern)
  showUserDetails = false;
  selectedUserData: TableData | null = null;
  selectedUserEmployee: EmployeeDetails | null = null;

  // Add Employee modal
  showAddEmployeeModal = false;
  isAddingEmployee = false;
  showAddEmployeeConfirmPrompt = false;
  isEditMode = false;
  selectedEmployeeForEdit: any = null;
  departmentOptions: any[] = [];
  isLoadingDepartments = false;

  // Access Control data
  permissions: Permission[] = [];
  isLoadingPermissions = false;
  isUpdatingPermissions = false;
  permissionsTableData: TableData[] = [];

  // Permission details modal
  showPermissionDetails = false;
  selectedPermissionData: any = null;
  showPermissionUpdateConfirmPrompt = false;

  // Accommodation properties
  accommodations: Accommodation[] = [];
  isLoadingAccommodations = false;
  isCreatingAccommodation = false;
  isUpdatingAccommodation = false;
  isDeletingAccommodation = false;
  accommodationsTableData: TableData[] = [];
  showCreateAccommodationModal = false;
  showAccommodationDetails = false;
  selectedAccommodationData: any = null;
  showAccommodationDeleteConfirmPrompt = false;

  // Template properties
  templates: Template[] = [];
  isLoadingTemplates = false;
  isCreatingTemplate = false;
  isUpdatingTemplate = false;
  isDeletingTemplate = false;
  templatesTableData: TableData[] = [];
  showCreateTemplateModal = false;
  showTemplateDetails = false;
  selectedTemplateData: any = null;
  showTemplateDeleteConfirmPrompt = false;

  // Access Control table configuration
  permissionsTableHeader: TableHeader[] = [
    { key: 'id', label: 'PERMISSION ID' },
    { key: 'role', label: 'ROLE' },
    { key: 'features', label: 'FEATURES' },
    { key: 'action', label: 'ACTION' },
  ];

  permissionsActionButton: MenuItem[] = [
    { label: 'View', action: 'view', icon: 'eye' },
  ];

  // Accommodation table configuration
  accommodationTableHeader: TableHeader[] = [
    { key: 'id', label: 'ACCOMMODATION ID' },
    { key: 'accommodationName', label: 'ACCOMMODATION NAME' },
    { key: 'accommodationType', label: 'ACCOMMODATION TYPE' },
    { key: 'accommodationRoomCount', label: 'NUMBER OF ROOMS' },
    { key: 'action', label: 'ACTION' },
  ];

  accommodationActionButton: MenuItem[] = [
    { label: 'View', action: 'view', icon: 'eye' },
  ];

  // Template table configuration
  templateTableHeader: TableHeader[] = [
    { key: 'id', label: 'TEMPLATE ID' },
    { key: 'templateType', label: 'TEMPLATE TYPE' },
    { key: 'action', label: 'ACTION' },
  ];

  templateActionButton: MenuItem[] = [
    { label: 'View', action: 'view', icon: 'eye' },
  ];

  // Form data for new department
  newDepartment = {
    name: '',
    organizationId: null as number | null,
  };

  // Form data for new employee
  newEmployee = {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: null as number | null,
    role: '',
    employmentType: '',
    location: '',
  };

  // Form data for new accommodation
  newAccommodation: {
    name: string;
    type: 'HOTEL' | 'GUEST_HOUSE' | 'HOSTEL';
    isPetAllowed: boolean;
    rooms: { name: string; capacity: number; id?: number }[];
  } = {
    name: '',
    type: 'HOTEL',
    isPetAllowed: false,
    rooms: [{ name: '', capacity: 1 }],
  };

  // Form data for new template
  newTemplate: {
    type: TemplateType;
    downloadUrl: string;
  } = {
    type: 'TRANSFER_APPROVAL' as TemplateType,
    downloadUrl: '',
  };

  // Removed HOD selection - using default values

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // User role for permissions
  userRole: string | null;

  constructor(
    private apiService: ApiService,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getWorkerRole();
  }

  ngOnInit() {
    this.userRole = this.authService.getWorkerRole();
    this.loadOrganizationStructure();
    this.loadEmployees();
    this.loadPermissions();
    this.loadAccommodations();
    this.loadTemplates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Tab switching
  setActiveTab(tab: string) {
    this.activeTab = tab;

    // Clear search when switching tabs
    this.searchValue = '';

    // Reload organization structure when switching to that tab
    if (tab === 'organization-structure') {
      this.loadOrganizationStructure();
    }

    // Load employees when switching to user management tab
    if (tab === 'user-management') {
      this.loadEmployees();
    }

    // Load accommodations when switching to accommodation tab
    if (tab === 'accommodation') {
      this.loadAccommodations();
    }

    // Load templates when switching to letter template tab
    if (tab === 'letter-template') {
      this.loadTemplates();
    }
  }

  // Load organization structure from API
  loadOrganizationStructure() {
    this.isLoading = true;

    const sub = this.apiService
      .get('/organization')
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            this.organizations = response.data;

            // Set the first organization as default for new departments
            if (this.organizations.length > 0) {
              this.newDepartment.organizationId = this.organizations[0].id;
            }
          }
        },
        error: (error) => {
          this.alertService.error(
            'Failed to load organization structure. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Load employees for user management
  loadEmployees(page: number = 1) {
    this.isLoadingEmployees = true;

    const sub = this.employeeService
      .getAllEmployees(page, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoadingEmployees = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            // Handle the new nested structure with pagination
            const employeesArray = response.data.data || [];
            const paginationMeta = response.data.pagination;

            this.employees = this.transformEmployeeToTableData(employeesArray);

            // Apply search filter if there's a search value
            if (this.searchValue) {
              this.applyEmployeeSearch();
            } else {
              this.filteredEmployees = [...this.employees];
            }

            // Update pagination state
            if (paginationMeta) {
              this.currentPage = paginationMeta.page;
              this.totalPages = paginationMeta.totalPages;
              this.totalEmployees = paginationMeta.total;
            }

            this.updateFilterOptions();
            this.applyAdvancedFilters();
          }
        },
        error: (error) => {
          this.alertService.error(
            'Failed to load employees. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Transform employee data to TableData format
  transformEmployeeToTableData(employees: Employee[]): TableData[] {
    // Safety check: ensure employees is an array
    if (!Array.isArray(employees)) {
      return [];
    }

    return employees.map((employee) => ({
      id: employee.employeeId,
      name: this.getEmployeeFullName(employee),
      department: employee.departments?.[0]?.name || 'N/A',
      email: employee.user?.email || employee.altEmail || 'N/A',
      role: employee.user?.role?.name || employee.title || 'N/A',
      imageUrl: this.formatImageUrl(employee.photoUrl || null),
      originalData: employee,
    }));
  }

  // Update available filter options from employee data
  updateFilterOptions() {
    // Get unique departments
    const departments = new Set<string>();
    const roles = new Set<string>();

    this.employees.forEach((employee) => {
      // Add department
      if (employee.department && employee.department !== 'N/A') {
        departments.add(employee.department);
      }

      // Add role/title
      if (employee.role && employee.role !== 'N/A') {
        roles.add(employee.role);
      }
    });

    this.availableDepartments = Array.from(departments).sort();
    this.availableRoles = Array.from(roles).sort();
  }

  // Apply filters to employees
  applyFilters() {
    this.filteredEmployees = this.employees.filter((employee) => {
      const departmentMatch =
        !this.selectedDepartmentFilter ||
        employee.department === this.selectedDepartmentFilter;

      const roleMatch =
        !this.selectedRoleFilter || employee.role === this.selectedRoleFilter;

      return departmentMatch && roleMatch;
    });
  }

  // Filter change handlers
  onDepartmentFilterChange() {
    this.applyFilters();
  }

  onRoleFilterChange() {
    this.applyFilters();
  }

  // Clear all filters
  clearFilters() {
    this.selectedDepartmentFilter = '';
    this.selectedRoleFilter = '';
    this.applyFilters(); // This will call calculatePagination()
  }

  // View employee details (for User Management tab)
  viewEmployee(employee: Employee) {
    // Convert Employee to EmployeeDetails format
    this.selectedUserEmployee = {
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
      nationIdNumber: employee.nationIdNumber,
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
      recentCredentialsNameArea: employee.recentCredentialsNameArea,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      deletedAt: employee.deletedAt,
      user: employee.user,
      spouse: employee.spouse,
      children: employee.children,
      payrolls: employee.payrolls,
      documents: employee.documents,
      credentials: employee.credentials,
      departments: employee.departments,
      homeAddress: employee.homeAddress,
      mailingAddress: employee.mailingAddress,
      departmentHeads: employee.departmentHeads,
      previousPositions: employee.previousPositions,
      spiritualHistory: employee.spiritualHistory,
    } as EmployeeDetails;

    this.selectedUserData = {
      id: employee.employeeId,
      name: this.getEmployeeFullName(employee),
      department: employee.departments?.[0]?.name || 'N/A',
      email: employee.user?.email || employee.altEmail || 'N/A',
      role: employee.user?.role?.name || employee.title || 'N/A',
      status: 'Active' as const,
      imageUrl: this.formatImageUrl(employee.photoUrl || null),
      originalData: employee,
    };

    this.showUserDetails = true;
  }

  // Handle table actions
  handleTableAction(event: { action: string; row: TableData }) {
    if (event.action === 'view') {
      const originalEmployee = (event.row as any).originalData;
      if (originalEmployee) {
        this.viewEmployee(originalEmployee);
      }
    }
  }

  // Table event handlers
  onMenuAction(event: { action: string; row: TableData }) {
    this.handleTableAction(event);
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyAdvancedFilters();
  }

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyAdvancedFilters();
  }

  onSearch(value: string) {
    this.searchValue = value;

    if (this.activeTab === 'user-management') {
      this.applyEmployeeSearch();
    } else if (this.activeTab === 'accommodation') {
      this.applyAccommodationSearch();
    } else if (this.activeTab === 'letter-template') {
      this.applyTemplateSearch();
    }
  }

  // Apply advanced filters (status, filter tabs, search)
  applyAdvancedFilters() {
    this.filteredEmployees = this.employees.filter((employee) => {
      // Status filter
      const statusMatch =
        !this.selectedStatus || employee.status === this.selectedStatus;

      // Filter tab (department/role)
      const filterMatch =
        !this.selectedFilter ||
        employee.department === this.selectedFilter ||
        employee.role === this.selectedFilter;

      // Search filter
      const searchMatch =
        !this.searchValue ||
        (employee.name &&
          employee.name
            .toLowerCase()
            .includes(this.searchValue.toLowerCase())) ||
        (employee.id &&
          employee.id.toLowerCase().includes(this.searchValue.toLowerCase())) ||
        (employee.department &&
          employee.department
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()));

      return statusMatch && filterMatch && searchMatch;
    });
  }

  // Apply search filter for accommodations
  applyAccommodationSearch() {
    if (!this.searchValue) {
      this.accommodationsTableData = this.transformAccommodationToTableData(
        this.accommodations
      );
      return;
    }

    const search = this.searchValue.toLowerCase();
    const filteredAccommodations = this.accommodations.filter(
      (accommodation) => {
        return (
          accommodation.name.toLowerCase().includes(search) ||
          accommodation.id.toString().includes(search) ||
          accommodation.type.toLowerCase().includes(search) ||
          accommodation.rooms.length.toString().includes(search)
        );
      }
    );

    this.accommodationsTableData = this.transformAccommodationToTableData(
      filteredAccommodations
    );
  }

  // Apply search filter for employees
  applyEmployeeSearch() {
    if (!this.searchValue) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    const search = this.searchValue.toLowerCase();
    const filteredEmployees = this.employees.filter((employee) => {
      return (
        (employee.name && employee.name.toLowerCase().includes(search)) ||
        (employee.id && employee.id.toLowerCase().includes(search)) ||
        (employee.department &&
          employee.department.toLowerCase().includes(search)) ||
        (employee.role && employee.role.toLowerCase().includes(search)) ||
        (employee.email && employee.email.toLowerCase().includes(search))
      );
    });

    this.filteredEmployees = filteredEmployees;
  }

  // Check if create button should be shown
  get shouldShowCreateButton(): boolean {
    return this.userRole === 'admin' || this.userRole === 'super_admin';
  }

  // Create discipline request (placeholder)
  onCreateDisciplineRequest() {
    // Implement discipline request creation
  }

  // Handle page change
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadEmployees(page);
  }

  // Convert employees to table data format
  getEmployeeTableData(): TableData[] {
    return this.filteredEmployees;
  }

  // Get dynamic loading title
  getLoadingTitle(): string {
    if (this.isLoading) {
      return 'Loading Organization Structure';
    } else if (this.isLoadingEmployees) {
      return 'Loading Employees';
    } else if (this.isLoadingPermissions) {
      return 'Loading Permissions';
    } else if (this.isLoadingAccommodations) {
      return 'Loading Accommodations';
    } else if (this.isLoadingTemplates) {
      return 'Loading Templates';
    } else if (this.isUpdatingPermissions) {
      return 'Updating Permissions';
    } else if (this.isCreatingDepartment) {
      return 'Creating Department';
    } else if (this.isCreatingAccommodation) {
      return 'Creating Accommodation';
    } else if (this.isUpdatingAccommodation) {
      return 'Updating Accommodation';
    } else if (this.isDeletingAccommodation) {
      return 'Deleting Accommodation';
    } else if (this.isCreatingTemplate) {
      return 'Creating Template';
    } else if (this.isUpdatingTemplate) {
      return 'Updating Template';
    } else if (this.isDeletingTemplate) {
      return 'Deleting Template';
    } else if (this.isAddingEmployee) {
      return 'Adding Employee';
    }
    return 'Loading...';
  }

  // Get dynamic loading message
  getLoadingMessage(): string {
    if (this.isLoading) {
      return 'Please wait while we fetch the organization data...';
    } else if (this.isLoadingEmployees) {
      return 'Please wait while we fetch employee data...';
    } else if (this.isLoadingPermissions) {
      return 'Please wait while we fetch permissions data...';
    } else if (this.isLoadingAccommodations) {
      return 'Please wait while we fetch accommodation data...';
    } else if (this.isLoadingTemplates) {
      return 'Please wait while we fetch template data...';
    } else if (this.isUpdatingPermissions) {
      return 'Please wait while we update the permissions...';
    } else if (this.isCreatingDepartment) {
      return 'Please wait while we create the department...';
    } else if (this.isCreatingAccommodation) {
      return 'Please wait while we create the accommodation...';
    } else if (this.isUpdatingAccommodation) {
      return 'Please wait while we update the accommodation...';
    } else if (this.isDeletingAccommodation) {
      return 'Please wait while we delete the accommodation...';
    } else if (this.isCreatingTemplate) {
      return 'Please wait while we create the template...';
    } else if (this.isUpdatingTemplate) {
      return 'Please wait while we update the template...';
    } else if (this.isDeletingTemplate) {
      return 'Please wait while we delete the template...';
    } else if (this.isAddingEmployee) {
      return 'Please wait while we add the employee...';
    }
    return 'Please wait...';
  }

  // Open create department modal
  openCreateDepartmentModal() {
    this.showCreateDepartmentModal = true;
    this.resetNewDepartmentForm();
  }

  // Close create department modal
  closeCreateDepartmentModal() {
    this.showCreateDepartmentModal = false;
    this.resetNewDepartmentForm();
  }

  // Open view team details (for Organization Structure tab)
  openViewTeamModal(department: Department) {
    this.selectedTeamData = {
      id: department.hod?.employeeId || department.hod?.id?.toString() || '',
      name: department.hod
        ? this.getEmployeeFullName(department.hod)
        : 'No HOD Assigned',
      department: department.name,
      role: department.hod?.title || 'Head of Department',
      status: 'Active' as const,
      imageUrl: this.formatImageUrl(department.hod?.photoUrl || null),
      originalData: department.hod,
    };
    this.selectedTeamDepartment = department;
    this.showTeamDetails = true;
  }

  // Close view team details
  closeViewTeamModal() {
    this.showTeamDetails = false;
    this.selectedTeamData = null;
    this.selectedTeamDepartment = null;
  }

  closeUserDetailsModal() {
    this.showUserDetails = false;
    this.selectedUserData = null;
    this.selectedUserEmployee = null;
  }

  // Edit employee from user details modal
  editEmployeeFromDetails() {
    if (this.selectedUserEmployee) {
      this.selectedEmployeeForEdit = this.selectedUserEmployee;
      this.isEditMode = true;
      this.showUserDetails = false; // Close the details modal
      this.showAddEmployeeModal = true; // Open the edit modal
      this.loadDepartments();
      this.populateEmployeeFormFromDetails(this.selectedUserEmployee);
    }
  }

  // Delete employee from user details modal
  deleteEmployeeFromDetails() {
    if (this.selectedUserEmployee) {
      const employeeId = this.selectedUserEmployee.id;
      const employeeName = `${this.selectedUserEmployee.firstName} ${this.selectedUserEmployee.lastName}`;

      // Show confirmation prompt
      this.promptConfig = {
        title: 'Delete Employee',
        text: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
        yesButtonText: 'Delete',
        noButtonText: 'Cancel',
      };
      this.showConfirmPrompt = true;

      // Store the employee ID for deletion
      this.selectedEmployeeForEdit = { id: employeeId, name: employeeName };
    }
  }

  // Add Employee methods
  openAddEmployeeModal() {
    this.showAddEmployeeModal = true;
    this.isEditMode = false;
    this.selectedEmployeeForEdit = null;
    this.resetNewEmployeeForm();
    this.loadDepartments();
  }

  // Edit Employee
  editEmployee(employeeRow: TableData) {
    const originalEmployee = (employeeRow as any).originalData;
    if (originalEmployee) {
      this.selectedEmployeeForEdit = originalEmployee;
      this.isEditMode = true;
      this.showAddEmployeeModal = true;
      this.loadDepartments();
      this.populateEmployeeForm(originalEmployee);
    }
  }

  // Delete Employee
  deleteEmployee(employeeRow: TableData) {
    const originalEmployee = (employeeRow as any).originalData;
    if (originalEmployee) {
      const employeeId = originalEmployee.id;
      const employeeName = `${originalEmployee.firstName} ${originalEmployee.lastName}`;

      // Show confirmation prompt
      this.promptConfig = {
        title: 'Delete Employee',
        text: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
        yesButtonText: 'Delete',
        noButtonText: 'Cancel',
      };
      this.showConfirmPrompt = true;

      // Store the employee ID for deletion
      this.selectedEmployeeForEdit = { id: employeeId, name: employeeName };
    }
  }

  // Populate employee form for editing
  populateEmployeeForm(employee: any) {
    this.newEmployee = {
      employeeId: employee.employeeId || employee.id.toString(),
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      departmentId: employee.departments?.[0]?.id || null,
      role: employee.user?.role?.name || '',
      employmentType: employee.employmentType || '',
      location: employee.location || '',
    };
  }

  // Populate employee form for editing from EmployeeDetails
  populateEmployeeFormFromDetails(employeeDetails: EmployeeDetails) {
    this.newEmployee = {
      employeeId: employeeDetails.employeeId || employeeDetails.id.toString(),
      firstName: employeeDetails.firstName || '',
      lastName: employeeDetails.lastName || '',
      email: employeeDetails.altEmail || employeeDetails.user?.email || '',
      departmentId: employeeDetails.departments?.[0]?.id || null,
      role: employeeDetails.user?.role?.name || employeeDetails.title || '',
      employmentType: employeeDetails.employmentType || '',
      location: '', // Location might not be in EmployeeDetails, so default to empty
    };
  }

  closeAddEmployeeModal() {
    this.showAddEmployeeModal = false;
    this.isEditMode = false;
    this.selectedEmployeeForEdit = null;
    this.resetNewEmployeeForm();
  }

  resetNewEmployeeForm() {
    this.newEmployee = {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      departmentId: null,
      role: '',
      employmentType: '',
      location: '',
    };
  }

  loadDepartments() {
    this.isLoadingDepartments = true;

    const sub = this.apiService
      .get('/department')
      .pipe(
        finalize(() => {
          this.isLoadingDepartments = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            this.departmentOptions = response.data;
          }
        },
        error: (error) => {
          this.alertService.error(
            'Failed to load departments. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  submitAddEmployee() {
    if (
      !this.newEmployee.employeeId ||
      !this.newEmployee.firstName ||
      !this.newEmployee.lastName ||
      !this.newEmployee.email ||
      !this.newEmployee.departmentId ||
      !this.newEmployee.role ||
      !this.newEmployee.employmentType ||
      !this.newEmployee.location
    ) {
      this.alertService.error('Please fill in all required fields.');
      return;
    }

    this.showAddEmployeeConfirmPrompt = true;
  }

  onConfirmAddEmployee() {
    this.showAddEmployeeConfirmPrompt = false;
    this.createEmployee();
  }

  onCancelAddEmployee() {
    this.showAddEmployeeConfirmPrompt = false;
  }

  createEmployee() {
    this.isAddingEmployee = true;

    const request = {
      employeeId: this.newEmployee.employeeId,
      firstName: this.newEmployee.firstName,
      lastName: this.newEmployee.lastName,
      email: this.newEmployee.email,
      departmentId: this.newEmployee.departmentId,
      role: this.newEmployee.role,
      employmentType: this.newEmployee.employmentType,
      location: this.newEmployee.location,
    };

    // Determine if this is create or update
    const isUpdate = this.isEditMode && this.selectedEmployeeForEdit?.id;
    const endpoint = isUpdate
      ? `/employee/${this.selectedEmployeeForEdit.id}`
      : '/employee';
    const method = isUpdate ? 'put' : 'post';
    const successMessage = isUpdate
      ? 'Employee updated successfully!'
      : 'Employee created successfully!';

    const sub = this.apiService[method](endpoint, request)
      .pipe(
        finalize(() => {
          this.isAddingEmployee = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.alertService.success(successMessage);
            this.closeAddEmployeeModal();
            this.loadEmployees(this.currentPage); // Reload the employee list
          } else {
            this.alertService.error(
              response.message ||
                `Failed to ${isUpdate ? 'update' : 'create'} employee.`
            );
          }
        },
        error: (error) => {
          this.alertService.error(
            `Failed to ${
              isUpdate ? 'update' : 'create'
            } employee. Please try again.`
          );
        },
      });

    this.subscriptions.push(sub);
  }

  onAddEmployeeSubmitted(employeeData: any) {
    this.isAddingEmployee = true;

    // Determine if this is create or update
    const isUpdate = this.isEditMode && this.selectedEmployeeForEdit?.id;
    const endpoint = isUpdate
      ? `/employee/${this.selectedEmployeeForEdit.id}`
      : '/employee';
    const method = isUpdate ? 'put' : 'post';
    const successMessage = isUpdate
      ? 'Employee updated successfully!'
      : 'Employee created successfully!';

    const sub = this.apiService[method](endpoint, employeeData)
      .pipe(
        finalize(() => {
          this.isAddingEmployee = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.alertService.success(successMessage);
            this.closeAddEmployeeModal();
            this.loadEmployees(this.currentPage); // Reload the employee list
          } else {
            this.alertService.error(
              response.message ||
                `Failed to ${isUpdate ? 'update' : 'create'} employee.`
            );
          }
        },
        error: (error) => {
          this.alertService.error(
            `Failed to ${
              isUpdate ? 'update' : 'create'
            } employee. Please try again.`
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Create employee details object for the accordion component
  createEmployeeDetailsFromDepartment(
    department: Department | null
  ): EmployeeDetails | null {
    if (!department?.hod) return null;

    const hod = department.hod;
    return {
      id: hod.id,
      employeeId: hod.employeeId,
      title: hod.title,
      firstName: hod.firstName,
      lastName: hod.lastName,
      middleName: hod.middleName,
      gender: hod.gender,
      profferedName: hod.profferedName,
      primaryPhone: hod.primaryPhone,
      primaryPhoneType: hod.primaryPhoneType,
      altPhone: hod.altPhone,
      altPhoneType: hod.altPhoneType,
      dob: hod.dob,
      maritalStatus: hod.maritalStatus,
      everDivorced: hod.everDivorced,
      beenConvicted: hod.beenConvicted,
      hasQuestionableBackground: hod.hasQuestionableBackground,
      hasBeenInvestigatedForMisconductOrAbuse:
        hod.hasBeenInvestigatedForMisconductOrAbuse,
      photoUrl: hod.photoUrl,
      altEmail: hod.altEmail,
      employeeStatus: hod.employeeStatus,
      employmentType: hod.employmentType,
      serviceStartDate: hod.serviceStartDate,
      retiredDate: hod.retiredDate,
      createdAt: hod.createdAt,
      updatedAt: hod.updatedAt,
      deletedAt: hod.deletedAt,
      departments: [department],
      user: null,
      teamMembers: department.members,
      departmentName: department.name,
    } as any;
  }

  // Reset new department form
  resetNewDepartmentForm() {
    this.newDepartment = {
      name: '',
      organizationId:
        this.organizations.length > 0 ? this.organizations[0].id : null,
    };
  }

  // Submit create department (shows confirm prompt)
  submitCreateDepartment() {
    if (!this.newDepartment.name) {
      this.alertService.error('Please enter a department name.');
      return;
    }

    // Set organizationId from the first organization (Director's organization)
    this.newDepartment.organizationId = this.organizations[0]?.id || null;

    if (!this.newDepartment.organizationId) {
      this.alertService.error('No organization found. Please try again.');
      return;
    }

    // Set prompt config for department creation
    this.promptConfig = {
      title: 'Create Department',
      text: `Are you sure you want to create the department "${this.newDepartment.name}"?`,
      yesButtonText: 'Yes, Create',
      noButtonText: 'Cancel',
    };

    this.showConfirmPrompt = true;
  }

  // Handle confirm create/delete
  onConfirmCreate() {
    // Check if this is for template deletion first
    if (this.promptConfig?.title === 'Delete Template') {
      // Get the template data from the prompt config
      const templateToDelete = this.promptConfig.templateData;
      // Set loading state immediately before closing prompt
      this.isDeletingTemplate = true;
      this.showConfirmPrompt = false;
      this.performTemplateDeletion(templateToDelete);
    }
    // Check if this is for employee deletion
    else if (
      this.selectedEmployeeForEdit &&
      this.selectedEmployeeForEdit.id &&
      this.promptConfig?.title === 'Delete Employee'
    ) {
      this.showConfirmPrompt = false;
      this.performEmployeeDeletion();
    }
    // Check if this is for accommodation deletion
    else if (
      this.selectedEmployeeForEdit &&
      this.selectedEmployeeForEdit.id &&
      this.promptConfig?.title === 'Delete Accommodation'
    ) {
      this.showConfirmPrompt = false;
      this.performAccommodationDeletion();
    } else {
      // Default to department creation
      this.showConfirmPrompt = false;
      this.createDepartment();
    }
  }

  // Perform employee deletion
  performEmployeeDeletion() {
    if (!this.selectedEmployeeForEdit?.id) {
      this.alertService.error('No employee selected for deletion');
      return;
    }

    const employeeId = this.selectedEmployeeForEdit.id;
    const employeeName = this.selectedEmployeeForEdit.name;

    const sub = this.apiService.delete(`/employee/${employeeId}`).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.alertService.success(
            `Employee "${employeeName}" deleted successfully!`
          );
          this.selectedEmployeeForEdit = null;
          this.loadEmployees(this.currentPage); // Reload current page
        } else {
          this.alertService.error(
            response.message || 'Failed to delete employee. Please try again.'
          );
        }
      },
      error: (error) => {
        this.alertService.error(
          error.error?.message || 'Failed to delete employee. Please try again.'
        );
      },
    });

    this.subscriptions.push(sub);
  }

  // Handle cancel create
  onCancelCreate() {
    this.showConfirmPrompt = false;
  }

  // Create new department
  createDepartment() {
    this.isCreatingDepartment = true;

    const request: CreateDepartmentRequest = {
      name: this.newDepartment.name,
      organizationId: this.newDepartment.organizationId!,
    };

    const sub = this.apiService
      .post('/department', request)
      .pipe(finalize(() => (this.isCreatingDepartment = false)))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.alertService.success(
              `Department "${this.newDepartment.name}" created successfully!`
            );
            this.closeCreateDepartmentModal();
            this.loadOrganizationStructure(); // Reload to show new department
          } else {
            this.alertService.error(
              response.message ||
                'Failed to create department. Please try again.'
            );
          }
        },
        error: (error) => {
          this.alertService.error(
            error.error?.message ||
              'Failed to create department. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Get employee full name
  getEmployeeFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  // Check if user can create departments
  get canCreateDepartment(): boolean {
    return (
      this.userRole?.toLowerCase() === 'admin' ||
      this.userRole?.toLowerCase() === 'hod'
    );
  }

  // Handle image loading errors
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
      const fallback = target.nextElementSibling as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  }

  // Format image URL to handle relative paths
  formatImageUrl(url: string | null): string {
    if (!url) return '';

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Check if employee has a valid photo URL
  hasValidPhotoUrl(employee: Employee | undefined): boolean {
    return !!(employee?.photoUrl && employee.photoUrl.trim() !== '');
  }

  // Get default image based on gender
  getDefaultImage(employee: Employee | undefined): string {
    if (!employee || !employee.gender) {
      return 'assets/svg/male.svg'; // Default to male if no gender specified
    }

    const gender = employee.gender.toLowerCase();
    if (gender === 'female' || gender === 'f') {
      return 'assets/svg/female.svg';
    } else {
      return 'assets/svg/male.svg';
    }
  }

  // Get all departments from all organizations (excluding Director departments and duplicates)
  getAllDepartments(): Department[] {
    const allDepartments = this.organizations.flatMap(
      (org) => org.departments || []
    );
    const headDepartmentIds = this.organizations
      .map((org) => org.headDepartment?.id)
      .filter((id) => id !== undefined);

    // Filter out head departments and remove duplicates based on ID
    const uniqueDepartments = allDepartments.filter(
      (dept, index, self) =>
        !headDepartmentIds.includes(dept.id) &&
        self.findIndex((d) => d.id === dept.id) === index
    );

    return uniqueDepartments;
  }

  // Get the single Director (first head department from first organization)
  getDirector(): Employee | undefined {
    return this.organizations[0]?.headDepartment?.hod;
  }

  // Get Director department name
  getDirectorDepartmentName(): string {
    return (
      this.organizations[0]?.headDepartment?.name ||
      'Director Superintendent Admin'
    );
  }

  // Get Director team count
  getDirectorTeamCount(): number {
    return this.organizations[0]?.headDepartment?.members?.length || 0;
  }

  loadPermissions() {
    this.isLoadingPermissions = true;

    const sub = this.apiService
      .get(environment.routes.permissions.getAll)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.permissions = response.data;
            this.permissionsTableData = this.transformPermissionToTableData(
              this.permissions
            );
          } else {
            this.alertService.error('Failed to load permissions');
          }
        },
        error: (error) => {
          this.alertService.error('Failed to load permissions');
        },
        complete: () => {
          this.isLoadingPermissions = false;
        },
      });

    this.subscriptions.push(sub);
  }

  transformPermissionToTableData(permissions: Permission[]): TableData[] {
    // Group permissions by role
    const roleGroups = new Map<string, Permission[]>();

    permissions.forEach((permission) => {
      const roleName = permission.role.name;
      if (!roleGroups.has(roleName)) {
        roleGroups.set(roleName, []);
      }
      roleGroups.get(roleName)!.push(permission);
    });

    // Create table data with grouped permissions
    return Array.from(roleGroups.entries()).map(
      ([roleName, rolePermissions]) => {
        // Get all unique features for this role and sort them
        const features = [
          ...new Set(rolePermissions.map((p) => p.feature)),
        ].sort();

        return {
          id: rolePermissions[0].role.id.toString(),
          role: roleName,
          features: features.join(', '),
          originalData: {
            roleName: roleName,
            roleId: rolePermissions[0].role.id,
            permissions: rolePermissions,
            features: features,
          },
        };
      }
    );
  }

  viewPermission(permission: TableData) {
    const originalData = permission.originalData as any;
    this.selectedPermissionData = {
      roleName: originalData.roleName,
      roleId: originalData.roleId,
      permissions: originalData.permissions,
    };
    this.showPermissionDetails = true;
  }

  closePermissionDetails() {
    this.showPermissionDetails = false;
    this.selectedPermissionData = null;
  }

  handlePermissionTableAction(event: { action: string; row: TableData }) {
    if (event.action === 'view') {
      this.viewPermission(event.row);
    }
  }

  // Permission update methods
  onPermissionUpdateSubmitted(permissionData: any) {
    // Store the permission data for confirmation
    this.selectedPermissionData = permissionData;
    this.showPermissionUpdateConfirmPrompt = true;
  }

  onConfirmPermissionUpdate() {
    this.showPermissionUpdateConfirmPrompt = false;
    this.isUpdatingPermissions = true;

    // Format permissions data according to API structure
    const formattedPermissions: any = {};

    this.selectedPermissionData.permissions.forEach((permission: any) => {
      formattedPermissions[permission.feature] = {};

      if (permission.canView !== undefined) {
        formattedPermissions[permission.feature].canView = permission.canView;
      }
      if (permission.canCreate !== undefined) {
        formattedPermissions[permission.feature].canCreate =
          permission.canCreate;
      }
      if (permission.canEdit !== undefined) {
        formattedPermissions[permission.feature].canEdit = permission.canEdit;
      }
      if (permission.canDelete !== undefined) {
        formattedPermissions[permission.feature].canDelete =
          permission.canDelete;
      }
    });

    // Get role ID from permission data
    const roleId = this.selectedPermissionData.roleId;

    // Call API to update permissions
    const sub = this.apiService
      .updateRolePermissions(roleId, formattedPermissions)
      .subscribe({
        next: (response) => {
          this.alertService.success('Permissions updated successfully');
          this.isUpdatingPermissions = false;
          // Refresh permissions data
          this.loadPermissions();
        },
        error: (error) => {
          this.alertService.error('Failed to update permissions');
          this.isUpdatingPermissions = false;
        },
      });

    this.subscriptions.push(sub);
  }

  onCancelPermissionUpdate() {
    this.showPermissionUpdateConfirmPrompt = false;
  }

  // Accommodation methods
  loadAccommodations() {
    this.isLoadingAccommodations = true;

    const sub = this.apiService.getAccommodations().subscribe({
      next: (response) => {
        this.accommodations = response.data || [];
        // Apply search filter if there's a search value
        if (this.searchValue) {
          this.applyAccommodationSearch();
        } else {
          this.accommodationsTableData = this.transformAccommodationToTableData(
            this.accommodations
          );
        }
        this.isLoadingAccommodations = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load accommodations');
        this.isLoadingAccommodations = false;
      },
    });

    this.subscriptions.push(sub);
  }

  transformAccommodationToTableData(
    accommodations: Accommodation[]
  ): TableData[] {
    return accommodations.map((accommodation) => ({
      id: accommodation.id.toString(),
      accommodationName: accommodation.name,
      accommodationType: accommodation.type.replace('_', ' '),
      accommodationRoomCount: accommodation.rooms.length.toString(),
      totalCapacity: accommodation.rooms
        .reduce((sum, room) => sum + room.capacity, 0)
        .toString(),
      petAllowed: accommodation.isPetAllowed ? 'Yes' : 'No',
      originalData: accommodation,
    }));
  }

  openCreateAccommodationModal() {
    this.showCreateAccommodationModal = true;
    this.isEditMode = false; // Ensure we're in create mode
    this.resetNewAccommodationForm();
  }

  closeCreateAccommodationModal() {
    this.showCreateAccommodationModal = false;
    this.isEditMode = false; // Reset edit mode
    this.selectedAccommodationData = null; // Clear selected data
    this.resetNewAccommodationForm();
  }

  resetNewAccommodationForm() {
    this.newAccommodation = {
      name: '',
      type: '' as any,
      isPetAllowed: false,
      rooms: [{ name: '', capacity: undefined as any }],
    };
  }

  addRoom() {
    this.newAccommodation.rooms.push({ name: '', capacity: undefined as any });
  }

  removeRoom(index: number) {
    if (this.newAccommodation.rooms.length > 1) {
      this.newAccommodation.rooms.splice(index, 1);
    }
  }

  submitCreateAccommodation() {
    // Validate form
    if (!this.newAccommodation.name || !this.newAccommodation.name.trim()) {
      this.alertService.error('Accommodation name is required');
      return;
    }

    if (
      this.newAccommodation.rooms.some(
        (room) => !room.name || !room.name.trim()
      )
    ) {
      this.alertService.error('All rooms must have a name');
      return;
    }

    if (this.newAccommodation.rooms.some((room) => room.capacity <= 0)) {
      this.alertService.error('All rooms must have a capacity greater than 0');
      return;
    }

    this.isCreatingAccommodation = true;

    const payload: CreateAccommodationRequest = {
      name: this.newAccommodation.name ? this.newAccommodation.name.trim() : '',
      type: this.newAccommodation.type,
      isPetAllowed: this.newAccommodation.isPetAllowed,
      rooms: this.newAccommodation.rooms.map((room) => ({
        name: room.name ? room.name.trim() : '',
        capacity: room.capacity,
      })),
    };

    const sub = this.apiService.createAccommodation(payload).subscribe({
      next: (response) => {
        this.alertService.success('Accommodation created successfully');
        this.isCreatingAccommodation = false;
        this.closeCreateAccommodationModal();
        this.loadAccommodations(); // Refresh the list
      },
      error: (error) => {
        let errorMessage = 'Failed to create accommodation';
        if (error.status === 502) {
          errorMessage =
            'Server is temporarily unavailable. Please try again later.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create accommodations.';
        }

        this.alertService.error(errorMessage);
        this.isCreatingAccommodation = false;
      },
    });

    this.subscriptions.push(sub);
  }

  viewAccommodation(accommodation: TableData) {
    this.selectedAccommodationData = accommodation.originalData;
    this.showAccommodationDetails = true;
  }

  closeAccommodationDetails() {
    this.showAccommodationDetails = false;
    this.selectedAccommodationData = null;
  }

  handleAccommodationTableAction(event: { action: string; row: TableData }) {
    if (event.action === 'view') {
      this.viewAccommodation(event.row);
    } else if (event.action === 'edit') {
      this.editAccommodation(event.row);
    } else if (event.action === 'delete') {
      this.deleteAccommodation(event.row);
    }
  }

  editAccommodation(accommodationRow: TableData) {
    this.selectedAccommodationData = accommodationRow.originalData;
    this.newAccommodation = {
      name: this.selectedAccommodationData.name,
      type: this.selectedAccommodationData.type,
      isPetAllowed: this.selectedAccommodationData.isPetAllowed,
      rooms: this.selectedAccommodationData.rooms.map((room: Room) => ({
        name: room.name,
        capacity: room.capacity,
        id: room.id,
      })),
    };
    this.showCreateAccommodationModal = true;
    this.isEditMode = true;
  }

  deleteAccommodation(accommodationRow: TableData) {
    const accommodation = accommodationRow.originalData;
    const accommodationId = accommodation.id;
    const accommodationName = accommodation.name;

    // Store the accommodation ID for deletion
    this.selectedEmployeeForEdit = {
      id: accommodationId,
      name: accommodationName,
    };

    // Show accommodation delete confirmation prompt
    this.showAccommodationDeleteConfirmPrompt = true;
  }

  editAccommodationFromDetails() {
    if (this.selectedAccommodationData) {
      // Populate form for editing
      this.newAccommodation = {
        name: this.selectedAccommodationData.name,
        type: this.selectedAccommodationData.type,
        isPetAllowed: this.selectedAccommodationData.isPetAllowed,
        rooms: this.selectedAccommodationData.rooms.map((room: Room) => ({
          name: room.name,
          capacity: room.capacity,
          id: room.id,
        })),
      };
      this.showAccommodationDetails = false;
      this.showCreateAccommodationModal = true;
      this.isEditMode = true;
    }
  }

  deleteAccommodationFromDetails() {
    if (this.selectedAccommodationData) {
      const accommodationId = this.selectedAccommodationData.id;
      const accommodationName = this.selectedAccommodationData.name;

      // Store the accommodation ID for deletion
      this.selectedEmployeeForEdit = {
        id: accommodationId,
        name: accommodationName,
      };

      // Show accommodation delete confirmation prompt
      this.showAccommodationDeleteConfirmPrompt = true;
    }
  }

  performAccommodationDeletion() {
    if (this.selectedEmployeeForEdit) {
      // Close the confirmation prompt immediately when starting the deletion
      this.showAccommodationDeleteConfirmPrompt = false;

      // Close the accommodation details slide-out
      this.closeAccommodationDetails();

      this.isDeletingAccommodation = true;

      const sub = this.apiService
        .deleteAccommodation(this.selectedEmployeeForEdit.id)
        .subscribe({
          next: (response) => {
            this.alertService.success('Accommodation deleted successfully');
            this.isDeletingAccommodation = false;
            this.selectedEmployeeForEdit = null;
            this.loadAccommodations(); // Refresh the list
          },
          error: (error) => {
            this.alertService.error('Failed to delete accommodation');
            this.isDeletingAccommodation = false;
          },
        });

      this.subscriptions.push(sub);
    }
  }

  updateAccommodation() {
    if (!this.selectedAccommodationData) return;

    // Validate form
    if (!this.newAccommodation.name || !this.newAccommodation.name.trim()) {
      this.alertService.error('Accommodation name is required');
      return;
    }

    if (
      this.newAccommodation.rooms.some(
        (room) => !room.name || !room.name.trim()
      )
    ) {
      this.alertService.error('All rooms must have a name');
      return;
    }

    if (this.newAccommodation.rooms.some((room) => room.capacity <= 0)) {
      this.alertService.error('All rooms must have a capacity greater than 0');
      return;
    }

    this.isUpdatingAccommodation = true;

    const payload: UpdateAccommodationRequest = {
      name: this.newAccommodation.name ? this.newAccommodation.name.trim() : '',
      type: this.newAccommodation.type,
      isPetAllowed: this.newAccommodation.isPetAllowed,
      rooms: this.newAccommodation.rooms.map((room) => ({
        name: room.name ? room.name.trim() : '',
        capacity: room.capacity,
        ...(room.id && { id: room.id }),
      })),
    };

    const sub = this.apiService
      .updateAccommodation(this.selectedAccommodationData.id, payload)
      .subscribe({
        next: (response) => {
          this.alertService.success('Accommodation updated successfully');
          this.isUpdatingAccommodation = false;
          this.closeCreateAccommodationModal();
          this.loadAccommodations(); // Refresh the list
        },
        error: (error) => {
          let errorMessage = 'Failed to update accommodation';
          if (error.status === 502) {
            errorMessage =
              'Server is temporarily unavailable. Please try again later.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.status === 403) {
            errorMessage =
              'You do not have permission to update this accommodation.';
          }

          this.alertService.error(errorMessage);
          this.isUpdatingAccommodation = false;
        },
      });

    this.subscriptions.push(sub);
  }

  onAccommodationSubmitted(accommodationData: any) {
    // Update the form data from the leave-details component
    // Map the form field names to the expected API field names
    this.newAccommodation = {
      name: accommodationData.accommodationName || accommodationData.name,
      type: accommodationData.accommodationType || accommodationData.type,
      isPetAllowed: accommodationData.isPetAllowed,
      rooms: accommodationData.rooms || [],
    };

    if (this.isEditMode) {
      this.updateAccommodation();
    } else {
      this.submitCreateAccommodation();
    }
  }

  onDepartmentSubmitted(departmentData: any) {
    // Update the form data from the leave-details component
    this.newDepartment = {
      name: departmentData.departmentName || departmentData.name,
      organizationId:
        this.organizations.length > 0 ? this.organizations[0].id : 1,
    };

    if (this.isEditMode) {
      // Handle edit mode if needed
      this.submitCreateDepartment();
    } else {
      this.submitCreateDepartment();
    }
  }

  // Template methods
  loadTemplates() {
    this.isLoadingTemplates = true;

    const sub = this.apiService.getTemplates().subscribe({
      next: (response) => {
        this.templates = response.data || [];
        // Apply search filter if there's a search value
        if (this.searchValue) {
          this.applyTemplateSearch();
        } else {
          this.templatesTableData = this.transformTemplateToTableData(
            this.templates
          );
        }
        this.isLoadingTemplates = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load templates');
        this.isLoadingTemplates = false;
      },
    });

    this.subscriptions.push(sub);
  }

  transformTemplateToTableData(templates: Template[]): TableData[] {
    return templates.map((template) => ({
      id: template.id.toString(),
      templateType: template.type.replace(/_/g, ' '),
      originalData: template,
    }));
  }

  // Apply search filter for templates
  applyTemplateSearch() {
    if (!this.searchValue) {
      this.templatesTableData = this.transformTemplateToTableData(
        this.templates
      );
      return;
    }

    const search = this.searchValue.toLowerCase();
    const filteredTemplates = this.templates.filter((template) => {
      return (
        template.id.toString().includes(search) ||
        template.type.toLowerCase().includes(search)
      );
    });

    this.templatesTableData =
      this.transformTemplateToTableData(filteredTemplates);
  }

  openCreateTemplateModal() {
    this.showCreateTemplateModal = true;
    this.isEditMode = false;
    this.resetNewTemplateForm();
  }

  closeCreateTemplateModal() {
    this.showCreateTemplateModal = false;
    this.isEditMode = false;
    this.selectedTemplateData = null;
    this.resetNewTemplateForm();
  }

  resetNewTemplateForm() {
    this.newTemplate = {
      type: 'TRANSFER_APPROVAL' as TemplateType,
      downloadUrl: '',
    };
  }

  viewTemplate(template: TableData) {
    this.selectedTemplateData = template.originalData;
    this.showTemplateDetails = true;
  }

  closeTemplateDetails() {
    this.showTemplateDetails = false;
    this.selectedTemplateData = null;
  }

  handleTemplateTableAction(event: { action: string; row: TableData }) {
    if (event.action === 'view') {
      this.viewTemplate(event.row);
    }
  }

  editTemplate(templateRow: TableData) {
    this.selectedTemplateData = templateRow.originalData;
    this.isEditMode = true;
    this.populateTemplateForm(templateRow.originalData);
    this.showCreateTemplateModal = true;

    // Close the template details modal if it's open, but don't reset selectedTemplateData
    if (this.showTemplateDetails) {
      this.showTemplateDetails = false;
    }
  }

  deleteTemplate(templateRow: TableData) {
    this.selectedTemplateData = templateRow.originalData;
    this.promptConfig = {
      title: 'Delete Template',
      text: `Are you sure you want to delete this template? This action cannot be undone.`,
      yesButtonText: 'Delete',
      noButtonText: 'Cancel',
    };
    this.showConfirmPrompt = true;
  }

  editTemplateFromDetails() {
    if (this.selectedTemplateData) {
      this.editTemplate({
        id: this.selectedTemplateData.id.toString(),
        templateType: this.selectedTemplateData.type,
        originalData: this.selectedTemplateData,
      } as TableData);
      // Don't close template details here - let the edit modal handle it
    }
  }

  deleteTemplateFromDetails() {
    if (this.selectedTemplateData) {
      // Store the template data in the prompt config so it's preserved
      this.promptConfig = {
        title: 'Delete Template',
        text: `Are you sure you want to delete this template? This action cannot be undone.`,
        yesButtonText: 'Delete',
        noButtonText: 'Cancel',
        templateData: this.selectedTemplateData, // Store the template data here
      };
      this.showConfirmPrompt = true;
    }
  }

  performTemplateDeletion(templateData?: any) {
    const templateToDelete = templateData || this.selectedTemplateData;

    if (templateToDelete) {
      // Loading state is already set in onConfirmCreate()
      // Close the template details slide-out
      this.closeTemplateDetails();

      const sub = this.apiService
        .deleteTemplate(templateToDelete.id)
        .subscribe({
          next: (response) => {
            this.alertService.success('Template deleted successfully');
            this.isDeletingTemplate = false;
            this.selectedTemplateData = null;
            this.loadTemplates(); // Refresh the list
          },
          error: (error) => {
            this.alertService.error('Failed to delete template');
            this.isDeletingTemplate = false;
          },
        });

      this.subscriptions.push(sub);
    }
  }

  populateTemplateForm(template: Template) {
    this.newTemplate = {
      type: template.type,
      downloadUrl: template.downloadUrl,
    };
  }

  onTemplateSubmitted(templateData: any) {
    // Update the form data from the leave-details component
    this.newTemplate = {
      type: templateData.templateType || templateData.type,
      downloadUrl: templateData.downloadUrl || templateData.documentUrl,
    };

    if (this.isEditMode) {
      this.updateTemplate();
    } else {
      this.submitCreateTemplate();
    }
  }

  submitCreateTemplate() {
    if (!this.newTemplate.type || !this.newTemplate.downloadUrl) {
      this.alertService.error('Template type and document are required');
      return;
    }

    this.isCreatingTemplate = true;

    const payload = {
      type: this.newTemplate.type,
      downloadUrl: this.newTemplate.downloadUrl,
    };

    const sub = this.apiService.createTemplate(payload).subscribe({
      next: (response) => {
        this.alertService.success('Template created successfully');
        this.isCreatingTemplate = false;
        this.closeCreateTemplateModal();
        this.loadTemplates();
      },
      error: (error) => {
        let errorMessage = 'Failed to create template';
        if (error.status === 502) {
          errorMessage =
            'Server is temporarily unavailable. Please try again later.';
        } else if (error.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to create templates.';
        }

        this.alertService.error(errorMessage);
        this.isCreatingTemplate = false;
      },
    });

    this.subscriptions.push(sub);
  }

  updateTemplate() {
    if (!this.selectedTemplateData) return;

    if (!this.newTemplate.type || !this.newTemplate.downloadUrl) {
      this.alertService.error('Template type and document are required');
      return;
    }

    this.isUpdatingTemplate = true;

    const payload = {
      type: this.newTemplate.type,
      downloadUrl: this.newTemplate.downloadUrl,
    };

    const sub = this.apiService
      .updateTemplate(this.selectedTemplateData.id, payload)
      .subscribe({
        next: (response) => {
          this.alertService.success('Template updated successfully');
          this.isUpdatingTemplate = false;
          this.closeCreateTemplateModal();
          this.loadTemplates();
        },
        error: (error) => {
          let errorMessage = 'Failed to update template';
          if (error.status === 502) {
            errorMessage =
              'Server is temporarily unavailable. Please try again later.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
          } else if (error.status === 403) {
            errorMessage =
              'You do not have permission to update this template.';
          }

          this.alertService.error(errorMessage);
          this.isUpdatingTemplate = false;
        },
      });

    this.subscriptions.push(sub);
  }
}
