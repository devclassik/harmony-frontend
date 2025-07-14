import { Component, Input, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexchartsFixDirective } from '../../directives/apexcharts-fix.directive';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexResponsive,
  ApexPlotOptions,
  ApexStroke,
  ApexDataLabels
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [NgApexchartsModule, ApexchartsFixDirective],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.css'
})
export class PieChartComponent implements OnInit {
  @Input() title: string = 'Staff Demographic';
  @Input() series: number[] = [40, 50, 10];
  @Input() labels: string[] = ['20 - 39', '40 - 59', '60 - 75'];
  @Input() colors: string[] = ['#F6A24E', '#9747FF', '#32D583'];

  chartOptions: ChartOptions = {
    series: this.series,
    chart: {
      type: 'pie',
      height: 250,
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      events: {
        beforeMount: function(chartContext: any, config: any) {
          // Add non-passive event listeners for touch and wheel events
          const chartElement = chartContext.el;
          if (chartElement) {
            chartElement.addEventListener('touchstart', function(e: Event) {
              e.stopPropagation();
            }, { passive: false });
            chartElement.addEventListener('touchmove', function(e: Event) {
              e.stopPropagation();
            }, { passive: false });
            chartElement.addEventListener('wheel', function(e: Event) {
              e.stopPropagation();
            }, { passive: false });
          }
        }
      }
    },
    labels: this.labels,
    colors: this.colors,
    stroke: {
      show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: '85%',
          background: 'transparent',
          labels: {
            show: false
          }
        },
        customScale: 1,
        offsetX: 0,
        offsetY: 0,
        dataLabels: {
          offset: 0
        }
      }
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      markers: {
        strokeWidth: 0,
        offsetX: -4,
        shape: 'circle'
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8
      },
      formatter: function(seriesName, opts) {
        return seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex] + '%';
      }
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  ngOnInit() {
    this.updateChartOptions();
  }

  ngOnChanges() {
    this.updateChartOptions();
  }

  private updateChartOptions() {
    this.chartOptions.series = this.series;
    this.chartOptions.labels = this.labels;
    this.chartOptions.colors = this.colors;
  }
}
