import { Component, Input } from '@angular/core';
import { MetricComponent } from '../metric/metric.component';
import { ComponentsModule } from '../../components/components.module';
import { CommonModule } from '@angular/common';
import { AnalyticsOverview } from '../../dto/analytics.dto';

@Component({
  selector: 'app-dashboard-greetings',
  imports: [ComponentsModule, MetricComponent, CommonModule],
  templateUrl: './dashboard-greetings.component.html',
  styleUrl: './dashboard-greetings.component.css',
})
export class DashboardGreetingsComponent {
  @Input() userName: string = 'John 👋🏼';
  @Input() showSubText: boolean = false;
  @Input() subText: string = 'Here is a brief overview of the employees.';
  @Input() showMetrics: boolean = true;
  @Input() analyticsData: AnalyticsOverview | null = null;

  get totalEmployees(): number {
    return this.analyticsData?.totalEmployees || 0;
  }

  get activeEmployees(): number {
    return this.analyticsData?.activeEmployees || 0;
  }

  get onLeaveEmployees(): number {
    return this.analyticsData?.leaveRequests?.totalPending || 0;
  }

  get inactiveEmployees(): number {
    return this.analyticsData?.inactiveEmployees || 0;
  }

  // Calculate percentage changes (you can customize these based on the business logic)
  get totalEmployeesChange(): number {
    // For now, returning 0 as we don't have historical data
    // You can enhance this by comparing with previous month/quarter data
    return 0;
  }

  get activeEmployeesChange(): number {
    // Calculate percentage of active vs total
    if (this.totalEmployees > 0) {
      return Math.round((this.activeEmployees / this.totalEmployees) * 100);
    }
    return 0;
  }

  get onLeaveEmployeesChange(): number {
    // Calculate percentage of leave requests vs total
    if (this.totalEmployees > 0) {
      return Math.round((this.onLeaveEmployees / this.totalEmployees) * 100);
    }
    return 0;
  }

  get inactiveEmployeesChange(): number {
    // Calculate percentage of inactive vs total
    if (this.totalEmployees > 0) {
      return Math.round((this.inactiveEmployees / this.totalEmployees) * 100);
    }
    return 0;
  }
}
