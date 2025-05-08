import { Component } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { DashboardGreetingsComponent } from '../../components/dashboard-greetings/dashboard-greetings.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from '../../components/doughnut-chart/doughnut-chart.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
@Component({
  selector: 'app-reporting-and-analytics',
  imports: [ComponentsModule, DashboardGreetingsComponent, BarChartComponent, PieChartComponent, DoughnutChartComponent],
  templateUrl: './reporting-and-analytics.component.html',
  styleUrl: './reporting-and-analytics.component.css'
})
export class ReportingAndAnalyticsComponent {

}
