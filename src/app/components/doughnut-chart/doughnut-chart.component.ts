import { Component, Input } from '@angular/core';
import { ChartOptions } from '../pie-chart/pie-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
@Component({
  selector: 'app-doughnut-chart',
  imports: [NgApexchartsModule],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.css'
})
export class DoughnutChartComponent {

  @Input() title: string = 'Staff Demographic';
  @Input() series: number[] = [40, 50, 10];
  @Input() labels: string[] = ['20 - 39', '40 - 59', '60 - 75'];
  @Input() colors: string[] = ['#F6A24E', '#9747FF', '#32D583'];

  chartOptions: ChartOptions = {
    series: this.series,
    chart: {
      type: 'donut',
      height: 250,
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 350
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

