import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { DashboardGreetingsComponent } from '../../components/dashboard-greetings/dashboard-greetings.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from '../../components/doughnut-chart/doughnut-chart.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { AreaChartComponent } from '../../components/area-chart/area-chart.component';
import { FilterTab } from '../../components/area-chart/area-chart.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { AlertService } from '../../services/alert.service';
import {
  AnalyticsOverview,
  LeaveStatistics,
  EmployeeDemographics,
  DisciplineStatistics,
  PerformanceStatistics,
} from '../../dto/analytics.dto';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-reporting-and-analytics',
  imports: [
    CommonModule,
    ComponentsModule,
    DashboardGreetingsComponent,
    BarChartComponent,
    PieChartComponent,
    DoughnutChartComponent,
    AreaChartComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './reporting-and-analytics.component.html',
  styleUrl: './reporting-and-analytics.component.css',
})
export class ReportingAndAnalyticsComponent implements OnInit, OnDestroy {
  // User and analytics data
  workerName: string = 'Worker';
  analyticsData: AnalyticsOverview | null = null;
  leaveStatisticsData: LeaveStatistics | null = null;
  demographicsData: EmployeeDemographics | null = null;
  disciplineStatisticsData: DisciplineStatistics | null = null;
  performanceStatisticsData: PerformanceStatistics | null = null;

  // Years and employee selection
  selectedYear: number = new Date().getFullYear();
  selectedEmployeeId: number = 1; // Default employee ID
  allEmployees: EmployeeDetails[] = [];

  // Loading states
  isLoadingAnalytics: boolean = false;
  isLoadingDiscipline: boolean = false;
  isLoadingPerformance: boolean = false;

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  // Computed loading state
  get isLoading(): boolean {
    return (
      this.isLoadingAnalytics ||
      this.isLoadingDiscipline ||
      this.isLoadingPerformance
    );
  }

  // Dynamic loading message based on what's loading
  get loadingMessage(): string {
    if (this.isLoadingAnalytics) {
      return 'Loading analytics overview and general statistics...';
    }
    if (this.isLoadingDiscipline) {
      return 'Loading disciplinary actions data...';
    }
    if (this.isLoadingPerformance) {
      return 'Loading performance statistics...';
    }
    return 'Fetching comprehensive analytics and reporting data from the system...';
  }

  filterTabs: FilterTab[] = [{ label: 'All Employees', value: '' }];

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {
    this.updateWorkerName();
  }

  ngOnInit() {
    this.loadAnalyticsData();
    this.loadAllEmployees();
    this.loadDisciplineStatistics();
    this.loadPerformanceStatistics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private updateWorkerName(): void {
    const currentWorker = this.authService.getCurrentWorker();
    if (currentWorker && currentWorker.email) {
      // Extract name from email or use a default format

      this.workerName = currentWorker.fullName;
    } else {
      this.workerName = 'Worker';
    }
  }

  loadAnalyticsData() {
    this.isLoadingAnalytics = true;
    const analyticsSub = this.analyticsService.getOverview().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.analyticsData = response.data;
        }
        this.isLoadingAnalytics = false;
      },
      error: (error) => {
        console.error('Error loading analytics data:', error);
        this.isLoadingAnalytics = false;
      },
    });
    this.subscriptions.push(analyticsSub);

    // Load leave statistics
    const leaveStatsSub = this.analyticsService
      .getLeaveStatistics(this.selectedYear)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.leaveStatisticsData = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading leave statistics:', error);
        },
      });
    this.subscriptions.push(leaveStatsSub);

    // Load employee demographics
    const demographicsSub = this.analyticsService
      .getEmployeeDemographics()
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.demographicsData = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading employee demographics:', error);
        },
      });
    this.subscriptions.push(demographicsSub);
  }

  loadDisciplineStatistics() {
    this.isLoadingDiscipline = true;
    const disciplineSub = this.analyticsService
      .getDisciplineStatistics(this.selectedYear)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.disciplineStatisticsData = response.data;
            console.log(
              'Discipline Statistics:',
              this.disciplineStatisticsData
            );
          }
          this.isLoadingDiscipline = false;
        },
        error: (error) => {
          console.error('Error loading discipline statistics:', error);
          this.alertService.error('Failed to load discipline statistics');
          this.isLoadingDiscipline = false;
        },
      });
    this.subscriptions.push(disciplineSub);
  }

  loadPerformanceStatistics() {
    this.isLoadingPerformance = true;
    const performanceSub = this.analyticsService
      .getPerformanceStatistics(this.selectedEmployeeId, this.selectedYear)
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.performanceStatisticsData = response.data;
            console.log(
              'Performance Statistics:',
              this.performanceStatisticsData
            );
          }
          this.isLoadingPerformance = false;
        },
        error: (error) => {
          console.error('Error loading performance statistics:', error);
          // this.alertService.error('Failed to load performance statistics');
          this.isLoadingPerformance = false;
        },
      });
    this.subscriptions.push(performanceSub);
  }

  loadAllEmployees() {
    const employeesSub = this.employeeService.getAllEmployees().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.allEmployees = response.data.data || [];
          this.updateFilterTabs();
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      },
    });
    this.subscriptions.push(employeesSub);
  }

  updateFilterTabs() {
    this.filterTabs = [
      { label: 'All Employees', value: '' },
      ...this.allEmployees.map((emp) => ({
        label: `${emp.firstName} ${emp.lastName}`,
        value: emp.id.toString(),
      })),
    ];
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadDisciplineStatistics();
    this.loadPerformanceStatistics();
  }

  onEmployeeChange(employeeId: string) {
    if (employeeId) {
      this.selectedEmployeeId = parseInt(employeeId);
      this.loadPerformanceStatistics();
    }
  }
}
