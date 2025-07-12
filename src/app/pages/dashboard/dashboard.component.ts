import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { AlertService } from '../../services/alert.service';
import { AnalyticsService } from '../../services/analytics.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardGreetingsComponent } from '../../components/dashboard-greetings/dashboard-greetings.component';
import { DashboardInformationComponent } from '../../components/dashboard-information/dashboard-information.component';
import { ComponentsModule } from '../../components/components.module';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import {
  MenuItem,
  TableComponent,
} from '../../components/table/table.component';
import { TableData, EmployeeInfo } from '../../interfaces/employee.interface';
import { DoughnutChartComponent } from '../../components/doughnut-chart/doughnut-chart.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { WelcomeScreenAnimationComponent } from '../../components/welcome-screen-animation/welcome-screen-animation.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { EmployeeDetails } from '../../dto/employee.dto';
import {
  AnalyticsOverview,
  LeaveStatistics,
  EmployeeDemographics,
} from '../../dto/analytics.dto';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    DashboardGreetingsComponent,
    DashboardInformationComponent,
    BarChartComponent,
    TableComponent,
    DoughnutChartComponent,
    LeaveDetailsComponent,
    WelcomeScreenAnimationComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  workerRole: string | null;
  currentWorker: any;
  currentEmployeeId: number | null;
  showLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;
  showWelcomeAnimation: boolean = false;
  isLoadingProfile: boolean = false;
  isLoadingLeaveRequests: boolean = false;
  isLoadingAnalytics: boolean = false;
  isLoadingEmployees: boolean = false;
  employeeData: EmployeeDetails | null = null;
  analyticsData: AnalyticsOverview | null = null;
  leaveStatisticsData: LeaveStatistics | null = null;
  demographicsData: EmployeeDemographics | null = null;
  selectedYear: number = new Date().getFullYear();
  currentYear: number = new Date().getFullYear();
  workerName: string = 'Worker';

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalEmployees: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService
  ) {
    this.workerRole = this.authService.getWorkerRole();

    console.log('workerRole', this.workerRole);
    this.currentWorker = this.authService.getCurrentWorker();
    this.currentEmployeeId = this.authService.getCurrentEmployeeId();
    // Initialize worker name from auth service
    this.updateWorkerName();
  }

  ngOnInit() {
    // Initialize notifications for authenticated users
    if (this.authService.isLoggedIn()) {
      this.notificationService.initializeNotifications();
    }

    // Load analytics data for all user roles
    this.loadAnalyticsData();

    // Load employee profile and check if animation should be shown
    if (
      this.workerRole?.toLowerCase() === 'worker' ||
      this.workerRole?.toLowerCase() === 'minister'
    ) {
      this.loadEmployeeProfile();
      this.loadLeaveRequests();
    }

    // Load all employees for admin dashboard
    if (this.workerRole?.toLowerCase() === 'admin') {
      this.loadAllEmployees();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadEmployeeProfile() {
    this.isLoadingProfile = true;

    // Get employee ID from the current worker data
    const employeeId = this.authService.getCurrentEmployeeId();

    if (!employeeId) {
      this.isLoadingProfile = false;
      console.error('No employee ID available for current worker');
      // Show animation if there's no employee ID (assume incomplete)
      this.showWelcomeAnimation = true;
      return;
    }

    const profileSub = this.employeeService
      .getEmployeeById(employeeId)
      .subscribe({
        next: (response) => {
          this.isLoadingProfile = false;
          if (response.status === 'success' && response.data) {
            this.employeeData = response.data;
            this.updateEmployeeInfo();

            // Check if profile is complete and show animation if not
            console.log('🔍 Dashboard: About to check profile completion');
            console.log(
              '📊 Dashboard: Employee data being passed:',
              response.data
            );

            const isComplete = this.employeeService.isProfileComplete(
              response.data
            );

            console.log('📊 Dashboard: Profile complete result:', isComplete);
            console.log(
              '📊 Dashboard: Setting showWelcomeAnimation to:',
              !isComplete
            );

            this.showWelcomeAnimation = !isComplete;
          }
        },
        error: (error) => {
          this.isLoadingProfile = false;
          console.error('Error loading employee profile:', error);
          // Show animation if there's an error loading profile (assume incomplete)
          this.showWelcomeAnimation = true;
        },
      });

    this.subscriptions.push(profileSub);
  }

  private updateEmployeeInfo() {
    if (this.employeeData) {
      console.log('Employee photoUrl from API:', this.employeeData.photoUrl); // Debug log

      this.employeeInfo = {
        id: this.employeeData.employeeId,
        firstName: this.employeeData.firstName,
        lastName: this.employeeData.lastName,
        middleName: this.employeeData.middleName || 'Not specified',
        title: this.employeeData.title || 'Not specified',
        preferredName:
          this.employeeData.profferedName ||
          `${this.employeeData.firstName} ${this.employeeData.lastName}`,
        gender: this.employeeData.gender || 'Not specified',
        profileImage: this.formatImageUrl(this.employeeData.photoUrl),
        status:
          (this.employeeData.employeeStatus as
            | 'Active'
            | 'On leave'
            | 'Retired'
            | 'On Discipline') || 'Active',
      };

      console.log(
        'Updated employeeInfo profileImage:',
        this.employeeInfo.profileImage
      ); // Debug log

      // Update worker name when employee data is available
      this.updateWorkerName();
    }
  }

  // Helper function to properly format image URLs
  private formatImageUrl(url: string | null): string {
    if (!url) return 'assets/svg/gender.svg';

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Update worker name property (called only when data actually changes)
  private updateWorkerName(): void {
    if (this.employeeData) {
      console.log('Employee data loaded:', this.employeeData); // This will log only once when data is actually loaded

      this.workerName =
        this.employeeData.profferedName ||
        `${this.employeeData.firstName} ${this.employeeData.lastName}`;
    } else if (this.currentWorker && this.currentWorker.fullName) {
      this.workerName = this.currentWorker.fullName;
    } else if (this.currentWorker && this.currentWorker.name) {
      this.workerName = this.currentWorker.name;
    } else {
      this.workerName = 'Worker';
    }
  }

  // Method to close welcome animation
  onWelcomeAnimationClose() {
    this.showWelcomeAnimation = false;
  }

  // Load leave requests from API
  loadLeaveRequests() {
    this.isLoadingLeaveRequests = true;

    const leaveSub = this.leaveService
      .getAnnualLeaves()
      .pipe(
        finalize(() => {
          this.isLoadingLeaveRequests = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            let leaves = response.data;

            // Filter by employee ID if not admin
            if (
              this.workerRole?.toLowerCase() !== 'admin' &&
              this.currentEmployeeId
            ) {
              leaves = this.leaveService.filterLeavesByEmployee(
                leaves,
                this.currentEmployeeId
              );
            }

            // Store raw leave data for details transformation
            this.rawLeaveData = leaves;

            // Transform API data to table format
            this.leaveRequests = this.leaveService.transformToTableData(leaves);
          }
        },
        error: (error) => {
          console.error('Error loading leave requests:', error);
          this.alertService.error(
            'Failed to load leave requests. Please try again.'
          );
        },
      });

    this.subscriptions.push(leaveSub);
  }

  // Load analytics data from API
  loadAnalyticsData() {
    this.isLoadingAnalytics = true;
    const analyticsSub = this.analyticsService
      .getOverview()
      .pipe(
        finalize(() => {
          this.isLoadingAnalytics = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.analyticsData = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading analytics data:', error);
          this.alertService.error(
            'Failed to load analytics data. Please try again.'
          );
        },
      });
    this.subscriptions.push(analyticsSub);

    // Load leave statistics for selected year
    this.loadLeaveStatistics();

    // Load employee demographics
    this.loadEmployeeDemographics();
  }

  // Employee data from API - will be populated after API call
  employeeInfo: EmployeeInfo | null = null;

  // Real employees data - will be populated from API
  employees: TableData[] = [];

  // Real leave requests data - will be populated from API
  leaveRequests: TableData[] = [];
  // Store raw leave data for details transformation
  rawLeaveData: any[] = [];

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  // Leave requests table header configuration
  leaveRequestsHeader = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  // Employee records table header configuration
  employeeRecordsHeader = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'NAME' },
    { key: 'role', label: 'ROLE' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'status', label: 'STATUS' },
  ];

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      // Find the raw leave data for this row
      const rawLeave = this.rawLeaveData.find(
        (leave) => leave.id.toString() === event.row.id
      );

      if (rawLeave) {
        // Transform the leave data for the details component
        this.selectedLeaveData = this.leaveService.transformForLeaveDetails(
          rawLeave,
          this.rawLeaveData
        );
      } else {
        // Fallback to table data if raw data not found
        this.selectedLeaveData = event.row;
      }

      this.showLeaveDetailsModal();
    }
  }

  showLeaveDetailsModal() {
    this.showLeaveDetails = true;
  }

  onCloseLeaveDetails() {
    this.showLeaveDetails = false;
    this.selectedLeaveData = null;
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    console.log('Year changed to:', this.selectedYear);
    this.loadLeaveStatistics();
  }

  private loadLeaveStatistics() {
    const leaveStatsSub = this.analyticsService
      .getLeaveStatistics(this.selectedYear)
      .subscribe({
        next: (response) => {
          console.log('Leave Statistics Response:', response);
          if (response.status === 'success' && response.data) {
            this.leaveStatisticsData = response.data;
            console.log('Leave Statistics Data:', response.data);
          }
        },
        error: (error) => {
          console.error('Error loading leave statistics:', error);
        },
      });
    this.subscriptions.push(leaveStatsSub);
  }

  private loadEmployeeDemographics() {
    const demographicsSub = this.analyticsService
      .getEmployeeDemographics()
      .subscribe({
        next: (response) => {
          console.log('Employee Demographics Response:', response);
          if (response.status === 'success' && response.data) {
            this.demographicsData = response.data;
            console.log('Employee Demographics Data:', response.data);
          }
        },
        error: (error) => {
          console.error('Error loading employee demographics:', error);
        },
      });
    this.subscriptions.push(demographicsSub);
  }

  // Load all employees from API
  private loadAllEmployees(page: number = 1) {
    this.isLoadingEmployees = true;
    const employeesSub = this.employeeService
      .getAllEmployees(page, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoadingEmployees = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('All Employees Response:', response);
          if (response.status === 'success' && response.data) {
            // Handle the new nested structure with pagination
            const employeesData = response.data.data || [];
            const paginationMeta = response.data.pagination;

            this.employees = this.transformEmployeesToTableData(employeesData);

            // Update pagination state
            if (paginationMeta) {
              this.currentPage = paginationMeta.page;
              this.totalPages = paginationMeta.totalPages;
              this.totalEmployees = paginationMeta.total;
            }

            console.log('Transformed Employees Data:', this.employees);
            console.log('Pagination Info:', {
              currentPage: this.currentPage,
              totalPages: this.totalPages,
              totalEmployees: this.totalEmployees,
            });
          }
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.alertService.error(
            'Failed to load employees. Please try again.'
          );
        },
      });
    this.subscriptions.push(employeesSub);
  }

  // Transform employee data from API to table format
  private transformEmployeesToTableData(
    employees: EmployeeDetails[]
  ): TableData[] {
    return employees.map((employee) => ({
      id: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      role:
        employee.title ||
        this.getEmployeeDepartmentRole(employee) ||
        'Employee',
      status: this.mapEmployeeStatus(employee.employeeStatus),
      imageUrl: this.formatImageUrl(employee.photoUrl),
      department: this.getEmployeeDepartment(employee),
    }));
  }

  // Get employee's primary department name
  private getEmployeeDepartment(employee: EmployeeDetails): string {
    if (employee.departments && employee.departments.length > 0) {
      return employee.departments[0].name;
    }
    return 'Unassigned';
  }

  // Get employee's role from department or title
  private getEmployeeDepartmentRole(employee: EmployeeDetails): string | null {
    if (employee.departments && employee.departments.length > 0) {
      return employee.departments[0].name;
    }
    return null;
  }

  // Map employee status to table status format
  private mapEmployeeStatus(
    status: string | null
  ): 'Active' | 'On leave' | 'Retired' | 'On Discipline' {
    if (!status) return 'Active';

    const statusLower = status.toLowerCase();

    if (statusLower.includes('leave') || statusLower.includes('absent')) {
      return 'On leave';
    }
    if (statusLower.includes('retired') || statusLower.includes('retire')) {
      return 'Retired';
    }
    if (
      statusLower.includes('discipline') ||
      statusLower.includes('suspended')
    ) {
      return 'On Discipline';
    }

    return 'Active'; // Default to active
  }

  onEmployeePageChange(page: number) {
    console.log('Page changed to:', page);
    this.currentPage = page;
    this.loadAllEmployees(page);
  }
}
