import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { DashboardGreetingsComponent } from "../../components/dashboard-greetings/dashboard-greetings.component";
import { ComponentsModule } from '../../components/components.module';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { TableComponent } from '../../components/table/table.component';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ComponentsModule, DashboardGreetingsComponent, PieChartComponent, BarChartComponent, TableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userRole: string | null;

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
  }

}
