import { Component, Input } from '@angular/core';
import { MetricComponent } from '../metric/metric.component';
import { ComponentsModule } from '../../components/components.module';
import { CommonModule } from '@angular/common';
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
}
