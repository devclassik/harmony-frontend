import { Component } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { DashboardGreetingsComponent } from '../../components/dashboard-greetings/dashboard-greetings.component';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from '../../components/doughnut-chart/doughnut-chart.component';
import { PieChartComponent } from '../../components/pie-chart/pie-chart.component';
import { AreaChartComponent } from '../../components/area-chart/area-chart.component';
import { FilterTab } from '../../components/area-chart/area-chart.component';
@Component({
  selector: 'app-reporting-and-analytics',
  imports: [
    ComponentsModule,
    DashboardGreetingsComponent,
    BarChartComponent,
    PieChartComponent,
    DoughnutChartComponent,
    AreaChartComponent,
  ],
  templateUrl: './reporting-and-analytics.component.html',
  styleUrl: './reporting-and-analytics.component.css',
})
export class ReportingAndAnalyticsComponent {
  filterTabs: FilterTab[] = [
    { label: '...', value: '' },
    { label: 'Wale Adenuga', value: 'Wale Adenuga' },
    { label: 'Dayo Moses', value: 'Dayo Moses' },
    { label: 'Temide John', value: 'Temide John' },
  ];
}
