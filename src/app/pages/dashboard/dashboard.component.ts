import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardGreetingsComponent } from '../../components/dashboard-greetings/dashboard-greetings.component';
import { ComponentsModule } from '../../components/components.module';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { TableComponent } from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { DoughnutChartComponent } from '../../components/doughnut-chart/doughnut-chart.component';
@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ComponentsModule,
    DashboardGreetingsComponent,
    BarChartComponent,
    TableComponent,
    DoughnutChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  userRole: string | null;

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
  }

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
}
