import { Component } from '@angular/core';
import { MetricComponent } from "../metric/metric.component";
import { ComponentsModule } from '../../components/components.module';
@Component({
  selector: 'app-dashboard-greetings',
  imports: [ComponentsModule, MetricComponent],
  templateUrl: './dashboard-greetings.component.html',
  styleUrl: './dashboard-greetings.component.css'
})
export class DashboardGreetingsComponent {
  userName = 'John';
}
