import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
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
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Tab switching
  setActiveTab(tab: string) {
    this.activeTab = tab;

    // Reload organization structure when switching to that tab
    if (tab === 'organization-structure') {
      this.loadOrganizationStructure();
    }

    // Load employees when switching to user management tab
    if (tab === 'user-management') {
      this.loadEmployees();
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
          console.error('Error loading organization structure:', error);
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
            this.filteredEmployees = [...this.employees];

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
          console.error('Error loading employees:', error);
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
    this.applyAdvancedFilters();
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

  // Check if create button should be shown
  get shouldShowCreateButton(): boolean {
    return this.userRole === 'admin' || this.userRole === 'super_admin';
  }

  // Create discipline request (placeholder)
  onCreateDisciplineRequest() {
    console.log('Create discipline request clicked');
    // Implement discipline request creation
  }

  // Handle page change
  onPageChange(page: number) {
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.loadEmployees(page);
  }

  // Convert employees to table data format
  getEmployeeTableData(): TableData[] {
    return this.employees;
  }

  // Get dynamic loading title
  getLoadingTitle(): string {
    if (this.isLoading) {
      return 'Loading Organization Structure';
    } else if (this.isLoadingEmployees) {
      return 'Loading Employees';
    } else if (this.isLoadingPermissions) {
      return 'Loading Permissions';
    } else if (this.isUpdatingPermissions) {
      return 'Updating Permissions';
    } else if (this.isCreatingDepartment) {
      return 'Creating Department';
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
    } else if (this.isUpdatingPermissions) {
      return 'Please wait while we update the permissions...';
    } else if (this.isCreatingDepartment) {
      return 'Please wait while we create the department...';
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
          console.error('Error loading departments:', error);
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
          console.error(
            `Error ${isUpdate ? 'updating' : 'creating'} employee:`,
            error
          );
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
          console.error(
            `Error ${isUpdate ? 'updating' : 'creating'} employee:`,
            error
          );
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
    this.showConfirmPrompt = false;

    // Check if this is for employee deletion
    if (
      this.selectedEmployeeForEdit &&
      this.selectedEmployeeForEdit.id &&
      this.promptConfig?.title === 'Delete Employee'
    ) {
      this.performEmployeeDeletion();
    } else {
      // Default to department creation
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
        console.error('Error deleting employee:', error);
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
          console.error('Error creating department:', error);
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
          console.error('Error loading permissions:', error);
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

    console.log('Sending permission update request:', {
      roleId: roleId,
      permissions: formattedPermissions,
      endpoint: environment.routes.permissions.updateRolePermissions,
    });

    // Call API to update permissions
    const sub = this.apiService
      .updateRolePermissions(roleId, formattedPermissions)
      .subscribe({
        next: (response) => {
          console.log('Permissions updated successfully:', response);
          this.alertService.success('Permissions updated successfully');
          this.isUpdatingPermissions = false;
          // Refresh permissions data
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Error updating permissions:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
          });
          this.alertService.error('Failed to update permissions');
          this.isUpdatingPermissions = false;
        },
      });

    this.subscriptions.push(sub);
  }

  onCancelPermissionUpdate() {
    this.showPermissionUpdateConfirmPrompt = false;
  }
}
