import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
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
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
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
  employeeData: EmployeeDetails | null = null;
  workerName: string = 'Worker';

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private alertService: AlertService
  ) {
    this.workerRole = this.authService.getWorkerRole();
    this.currentWorker = this.authService.getCurrentWorker();
    this.currentEmployeeId = this.authService.getCurrentEmployeeId();
    // Initialize worker name from auth service
    this.updateWorkerName();
  }

  ngOnInit() {
    // Load employee profile and check if animation should be shown
    if (this.workerRole?.toLowerCase() === 'worker') {
      this.loadEmployeeProfile();
      this.loadLeaveRequests();
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
            const isComplete = this.employeeService.isProfileComplete(
              response.data
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
        profileImage: this.employeeData.photoUrl || 'assets/svg/gender.svg',
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

  // Employee data from API - will be populated after API call
  employeeInfo: EmployeeInfo | null = null;

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      role: 'Zonal Pastor',
      status: 'Active',
      imageUrl: 'assets/svg/gender.svg',
    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      role: 'Zonal Pastor',
      status: 'On leave',
      imageUrl: 'assets/svg/gender.svg',
    },
    // ... more employees
  ];

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
}
