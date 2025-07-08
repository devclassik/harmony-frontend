import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
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
  showLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;
  showWelcomeAnimation: boolean = false;
  isLoadingProfile: boolean = false;
  employeeData: EmployeeDetails | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService
  ) {
    this.workerRole = this.authService.getWorkerRole();
    this.currentWorker = this.authService.getCurrentWorker();
  }

  ngOnInit() {
    // Load employee profile and check if animation should be shown
    if (this.workerRole?.toLowerCase() === 'worker') {
      this.loadEmployeeProfile();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadEmployeeProfile() {
    this.isLoadingProfile = true;

    // ======= TEMPORARY TESTING OVERRIDE - REMOVE BEFORE PRODUCTION =======
    // For testing with ehikioyaandrew042@gmail.com, use employee ID 18
    let employeeId = 18; // Default for testing

    if (this.currentWorker?.email === 'ehikioyaandrew042@gmail.com') {
      employeeId = 18;
    }
    // ======= END TEMPORARY TESTING OVERRIDE =======

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
    }
  }

  // Get worker's name from employee data or auth service
  getWorkerName(): string {
    // Use employee data if available
    console.log(this.employeeData); // Debug log
    
    if (this.employeeData) {
      const preferredName =
        this.employeeData.profferedName ||
        `${this.employeeData.firstName} ${this.employeeData.lastName}`;
      return preferredName;
    }

    // Fallback to auth service
    if (this.currentWorker && this.currentWorker.fullName) {
      return this.currentWorker.fullName;
    } else if (this.currentWorker && this.currentWorker.name) {
      return this.currentWorker.name;
    }
    return 'Worker';
  }

  // Method to close welcome animation
  onWelcomeAnimationClose() {
    this.showWelcomeAnimation = false;
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

  // Mock leave requests data
  leaveRequests: TableData[] = [
    {
      id: 'LR-001',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      status: 'Approved',
    },
    {
      id: 'LR-002',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      status: 'Pending',
    },
    {
      id: 'LR-003',
      startDate: '2024-03-05',
      endDate: '2024-03-08',
      status: 'Rejected',
    },
    {
      id: 'LR-004',
      startDate: '2024-04-01',
      endDate: '2024-06-01',
      status: 'Approved',
    },
    {
      id: 'LR-005',
      startDate: '2024-02-28',
      endDate: '2024-03-01',
      status: 'Pending',
    },
  ];

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
      this.showLeaveDetailsModal();
      this.selectedLeaveData = event.row;
    }
  }

  showLeaveDetailsModal() {
    this.showLeaveDetails = true;
  }
}
