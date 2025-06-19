import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  userRole: string | null;
  currentUser: any;
  showLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
  }

  // Mock employee data for user dashboard
  employeeInfo: EmployeeInfo = {
    id: '124-08',
    firstName: 'John',
    lastName: 'Adegoke',
    middleName: 'Tobi',
    title: 'Church Worker',
    preferredName: 'John Adegoke',
    gender: 'Male',
    profileImage: 'assets/svg/profilePix.svg',
    status: 'Active',
  };

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      role: 'Zonal Pastor',
      status: 'Active',
      imageUrl: 'assets/svg/profilePix.svg',
    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      role: 'Zonal Pastor',
      status: 'On leave',
      imageUrl: 'assets/svg/profilePix.svg',
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
