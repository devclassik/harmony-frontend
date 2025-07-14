import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { ComponentsModule } from '../../components/components.module';
import { TableData } from '../../interfaces/employee.interface';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { AppraisalComponent } from '../../components/appraisal/appraisal.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { EmployeeService } from '../../services/employee.service';
import { AppraisalService } from '../../services/appraisal.service';
import { AlertService } from '../../services/alert.service';
import { EmployeeDetails } from '../../dto/employee.dto';
import { CreateAppraisalRequest } from '../../dto/appraisal.dto';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-employee-records',
  imports: [
    CommonModule,
    ComponentsModule,
    TableComponent,
    ConfirmPromptComponent,
    SuccessModalComponent,
    AppraisalComponent,
    EmployeeDetailsComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './employee-records.component.html',
  styleUrl: './employee-records.component.css',
})
export class EmployeeRecordsComponent implements OnInit {
  showModal: boolean = false;
  successModal: boolean = false;
  showAppraisal: boolean = false;
  showEmployeeDetails: boolean = false;
  selectedEmployeeRecord: TableData | null = null;
  selectedEmployeeDetails: EmployeeDetails | null = null;
  selectedFilter: string = '';
  searchValue: string = '';
  selectedStatus: string = '';
  selectedEmployee: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  isLoading: boolean = false;
  loadingOperation: 'loading' | 'deleting' | null = null;
  allEmployees: EmployeeDetails[] = [];

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalEmployees: number = 0;

  // Dynamic loading properties
  get loadingTitle(): string {
    switch (this.loadingOperation) {
      case 'deleting':
        return 'Deleting Employee...';
      case 'loading':
      default:
        return 'Loading Employees...';
    }
  }

  get loadingMessage(): string {
    switch (this.loadingOperation) {
      case 'deleting':
        return 'Please wait while we remove the employee from the system.';
      case 'loading':
      default:
        return 'Please wait while we fetch employee data.';
    }
  }

  currentAppraisalForm: any = null; // Store the appraisal form data

  constructor(
    private employeeService: EmployeeService,
    private appraisalService: AppraisalService,
    private alertService: AlertService
  ) {}

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'On leave', value: 'On leave' },
    { label: 'On discipline', value: 'On Discipline' },
    { label: 'Retired', value: 'Retired' },
  ];

  filterTabs = [
    {
      label: 'All',
      value: '',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    },
    { label: 'Admin', value: 'Admin', icon: 'M5 13l4 4L19 7' },
    { label: 'HOD', value: 'HOD', icon: 'M5 13l4 4L19 7' },
    { label: 'Minister', value: 'Minister', icon: 'M5 13l4 4L19 7' },
    { label: 'Worker', value: 'Worker', icon: 'M5 13l4 4L19 7' },
  ];

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    {
      label: 'Appraisal',
      action: 'Appraisal',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Delete',
      action: 'Delete',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    },
  ];

  filteredEmployees: TableData[] = this.employees;

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees(page: number = 1) {
    this.isLoading = true;
    this.loadingOperation = 'loading';
    this.employeeService.getAllEmployees(page, this.pageSize).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          // Handle the new nested structure with pagination
          this.allEmployees = response.data.data || [];
          const paginationMeta = response.data.pagination;

          this.employees = this.transformEmployeesToTableData(
            this.allEmployees
          );

          // Update pagination state
          if (paginationMeta) {
            this.currentPage = paginationMeta.page;
            this.totalPages = paginationMeta.totalPages;
            this.totalEmployees = paginationMeta.total;
          }

          this.updateFilterTabs();
          this.applyFilters();
        } else {
          this.alertService.error('Failed to load employees');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.alertService.error('Failed to load employees');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });
  }

  transformEmployeesToTableData(employees: EmployeeDetails[]): TableData[] {
    return employees.map((employee) => ({
      id: employee.employeeId || employee.id.toString(),
      name: `${employee.firstName} ${employee.lastName}`,
      department:
        employee.departments?.length > 0 ? employee.departments[0].name : 'N/A',
      role: employee.user?.role?.name || 'N/A',
      status: this.mapEmployeeStatus(employee.employeeStatus),
      imageUrl: this.formatImageUrl(employee.photoUrl),
    }));
  }

  // Helper function to properly format image URLs
  formatImageUrl(url: string | null): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return 'assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  mapEmployeeStatus(status: string | null): TableData['status'] {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'on leave':
      case 'leave':
        return 'On leave';
      case 'retired':
        return 'Retired';
      case 'on discipline':
      case 'discipline':
        return 'On Discipline';
      default:
        return 'Active';
    }
  }

  updateFilterTabs() {
    // Get unique roles from loaded employees
    const uniqueRoles = [
      ...new Set(
        this.employees
          .map((emp) => emp.role)
          .filter((role) => role && role !== 'N/A')
      ),
    ];

    // Update filter tabs with actual roles from API
    this.filterTabs = [
      {
        label: 'All',
        value: '',
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
      },
      ...uniqueRoles.map((role) => ({
        label: role!,
        value: role!,
        icon: 'M5 13l4 4L19 7',
      })),
    ];
  }

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onSearch(value: string) {
    this.searchValue = value;
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
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);
    if (event.action === 'Delete') {
      this.selectedEmployee = event.row;
      this.promptConfig = {
        title: 'Delete',
        text: `Are you sure you want to delete ${event.row.name}?`,
        imageUrl: event.row.imageUrl || 'assets/svg/profilePix.svg',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
    if (event.action === 'Appraisal') {
      this.selectedEmployee = event.row;
      this.showAppraisalModal();
    }
    if (event.action === 'View') {
      this.selectedEmployeeRecord = event.row;
      this.fetchEmployeeDetails(event.row);
    }
  }

  deleteEmployee(employee: TableData) {
    if (!employee.id) {
      this.alertService.error('Employee ID not found');
      return;
    }

    // First, try to find the employee in the already loaded data
    const fullEmployeeData = this.allEmployees.find(
      (emp) =>
        emp.employeeId === employee.id ||
        emp.id.toString() === employee.id ||
        `${emp.firstName} ${emp.lastName}` === employee.name
    );

    let employeeId: number;

    if (fullEmployeeData) {
      // Use the actual employee ID from the loaded data
      employeeId = fullEmployeeData.id;
    } else {
      // Try to extract a valid employee ID from the table data
      // Handle different ID formats
      if (employee.id.includes(' - ')) {
        employeeId = parseInt(employee.id.split(' - ')[0]);
      } else if (employee.id.includes('-')) {
        employeeId = parseInt(employee.id.split('-')[0]);
      } else {
        employeeId = parseInt(employee.id);
      }

      // Check if we got a valid ID
      if (isNaN(employeeId)) {
        this.alertService.error('Invalid employee ID format');
        return;
      }
    }

    this.isLoading = true;
    this.loadingOperation = 'deleting';
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: (response) => {
        this.alertService.success('Employee deleted successfully');
        this.loadEmployees(this.currentPage); // Reload the current page
        this.isLoading = false;
        this.loadingOperation = null;
        this.successModal = true;
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.alertService.error('Failed to delete employee');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });
  }

  onModalConfirm(confirmed: boolean) {
    this.showModal = false;
    this.showAppraisal = false;

    if (confirmed && this.selectedEmployee) {
      // Check if this is a delete confirmation
      if (this.promptConfig?.title === 'Delete') {
        this.deleteEmployee(this.selectedEmployee);
      } else if (this.promptConfig?.title === 'Confirm') {
        // This is an appraisal confirmation
        this.submitAppraisal(this.selectedEmployee);
      }
    }

    // Only show success modal after the actual operation
    // The success modal will be shown in the API response handlers
  }

  onModalClose() {
    this.showModal = false;
  }

  showAppraisalModal() {
    this.showAppraisal = true;
  }

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  fetchEmployeeDetails(employee: TableData) {
    if (!employee.id) {
      this.alertService.error('Employee ID not found');
      return;
    }

    // Find the actual employee data from the already loaded employees
    const fullEmployeeData = this.allEmployees.find(
      (emp) =>
        emp.employeeId === employee.id ||
        emp.id.toString() === employee.id ||
        `${emp.firstName} ${emp.lastName}` === employee.name
    );

    if (fullEmployeeData) {
      // Use the already loaded data instead of making another API call
      this.selectedEmployeeDetails = fullEmployeeData;
      this.showEmployeeDetailsModal();
      return;
    }

    // Only make API call if we don't have the data already
    // Try to extract a valid employee ID
    let employeeId: number;

    // Handle different ID formats
    if (employee.id.includes(' - ')) {
      employeeId = parseInt(employee.id.split(' - ')[0]);
    } else if (employee.id.includes('-')) {
      employeeId = parseInt(employee.id.split('-')[0]);
    } else {
      employeeId = parseInt(employee.id);
    }

    // Check if we got a valid ID
    if (isNaN(employeeId)) {
      this.alertService.error('Invalid employee ID format');
      return;
    }

    this.isLoading = true;
    this.loadingOperation = 'loading';
    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.selectedEmployeeDetails = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          this.showEmployeeDetailsModal();
        } else {
          this.alertService.error('Failed to load employee details');
        }
        this.isLoading = false;
        this.loadingOperation = null;
      },
      error: (error) => {
        console.error('Error fetching employee details:', error);
        this.alertService.error('Failed to load employee details');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });
  }

  handleAppraisal(form: any) {
    console.log(form);
    this.currentAppraisalForm = form; // Store the form data
    this.promptConfig = {
      title: 'Confirm',
      text: `Are you sure you want to submit this appraisal for ${this.selectedEmployee?.name}?`,
      imageUrl: this.selectedEmployee?.imageUrl || 'assets/svg/profilePix.svg',
      yesButtonText: 'Yes',
      noButtonText: 'No',
    };
    this.showModal = true;
  }

  submitAppraisal(employee: TableData) {
    if (!employee.id) {
      this.alertService.error('Employee ID not found');
      return;
    }

    if (!this.currentAppraisalForm) {
      this.alertService.error('Appraisal form data not found');
      return;
    }

    // First, try to find the employee in the already loaded data
    const fullEmployeeData = this.allEmployees.find(
      (emp) =>
        emp.employeeId === employee.id ||
        emp.id.toString() === employee.id ||
        `${emp.firstName} ${emp.lastName}` === employee.name
    );

    let employeeId: number;

    if (fullEmployeeData) {
      // Use the actual employee ID from the loaded data
      employeeId = fullEmployeeData.id;
    } else {
      // Try to extract a valid employee ID from the table data
      // Handle different ID formats
      if (employee.id.includes(' - ')) {
        employeeId = parseInt(employee.id.split(' - ')[0]);
      } else if (employee.id.includes('-')) {
        employeeId = parseInt(employee.id.split('-')[0]);
      } else {
        employeeId = parseInt(employee.id);
      }

      // Check if we got a valid ID
      if (isNaN(employeeId)) {
        this.alertService.error('Invalid employee ID format');
        return;
      }
    }

    this.isLoading = true;
    this.loadingOperation = 'loading';

    // Map period to dates
    const getPeriodDates = (period: string) => {
      const currentYear = new Date().getFullYear();
      switch (period) {
        case 'Apr-Jul':
          return {
            startDate: `${currentYear}-04-01`,
            endDate: `${currentYear}-07-31`,
          };
        case 'Aug-Nov':
          return {
            startDate: `${currentYear}-08-01`,
            endDate: `${currentYear}-11-30`,
          };
        case 'Dec-Mar':
          return {
            startDate: `${currentYear}-12-01`,
            endDate: `${currentYear + 1}-03-31`,
          };
        default:
          return {
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-12-31`,
          };
      }
    };

    // Map criteria names to API format
    const mapCriteriaToApi = (
      criteria: string
    ): 'ATTENDANCE' | 'EVANGELISM' | 'VOLUNTARY_WORK' => {
      switch (criteria.toLowerCase()) {
        case 'attendance':
          return 'ATTENDANCE';
        case 'evangelism':
          return 'EVANGELISM';
        case 'voluntary work':
          return 'VOLUNTARY_WORK';
        default:
          return 'ATTENDANCE'; // fallback
      }
    };

    // Use actual form data
    const dates = getPeriodDates(this.currentAppraisalForm.period);
    const appraisalData: CreateAppraisalRequest = {
      startDate: dates.startDate,
      endDate: dates.endDate,
      averageScore: parseFloat(this.currentAppraisalForm.average) || 0,
      scores: this.currentAppraisalForm.details.map((detail: any) => ({
        criterial: mapCriteriaToApi(detail.criteria),
        score: parseInt(detail.score) || 0,
      })),
    };

    this.appraisalService.submitAppraisal(employeeId, appraisalData).subscribe({
      next: (response) => {
        this.alertService.success('Appraisal submitted successfully');
        this.isLoading = false;
        this.loadingOperation = null;
        this.currentAppraisalForm = null; // Clear the form data
      },
      error: (error) => {
        console.error('Error submitting appraisal:', error);
        this.alertService.error('Failed to submit appraisal');
        this.isLoading = false;
        this.loadingOperation = null;
      },
    });
  }

  onPageChange(page: number) {
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.loadEmployees(page);
  }
}
