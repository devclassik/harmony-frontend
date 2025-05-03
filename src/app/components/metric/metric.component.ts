import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric',
  imports: [],
  templateUrl: './metric.component.html',
  styleUrl: './metric.component.css'
})
export class MetricComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() changePercentage: number = 0;
  @Input() bgColor: string = '#7301E2';
  @Input() iconPath: string = '';
}
