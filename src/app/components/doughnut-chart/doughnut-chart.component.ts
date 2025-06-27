import { Component, Input } from '@angular/core';
import { ChartOptions } from '../pie-chart/pie-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-doughnut-chart',
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.css',
})
export class DoughnutChartComponent {
  @Input() title: string = 'Staff Demographic';
  @Input() series: number[] = [40, 50, 10];
  @Input() labels: string[] = ['20 - 39', '40 - 59', '60 - 75'];
  @Input() colors: string[] = ['#F6A24E', '#9747FF', '#32D583'];

  showGenderImage: boolean = false;
  genderData = {
    male: 45,
    female: 55,
  };

  chartOptions: ChartOptions = {
    series: this.series,
    chart: {
      type: 'donut',
      height: 250,
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    labels: this.labels,
    colors: this.colors,
    stroke: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '50%',
          background: 'transparent',
          labels: {
            show: false,
          },
        },
        customScale: 1,
        offsetX: 0,
        offsetY: 0,
        dataLabels: {
          offset: 0,
        },
      },
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      markers: {
        strokeWidth: 0,
        offsetX: -4,
        shape: 'circle',
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8,
      },
      formatter: function (seriesName, opts) {
        return (
          seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex] + '%'
        );
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  constructor(private cdr: ChangeDetectorRef) {}

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

  onSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    console.log(select.value);

    switch (select.value) {
      case 'Age range':
        this.showGenderImage = false;
        this.updateToDonutChart();
        break;
      case 'Gender':
        this.showGenderImage = true;
        this.updateToGenderChart();
        break;
      case 'Years of service':
        this.showGenderImage = false;
        this.updateToPolarChart();
        break;
      default:
        this.showGenderImage = false;
        this.updateToDonutChart();
    }
  }

  private updateToDonutChart() {
    this.chartOptions = {
      ...this.chartOptions,
      chart: {
        ...this.chartOptions.chart,
        type: 'donut',
      },
      stroke: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: 'right',
        horizontalAlign: 'center',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        markers: {
          strokeWidth: 0,
          offsetX: -4,
          shape: 'circle',
        },
        itemMargin: {
          horizontal: 15,
          vertical: 8,
        },
        formatter: function (seriesName, opts) {
          return (
            seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex] + '%'
          );
        },
      },
      plotOptions: {
        ...this.chartOptions.plotOptions,
        pie: {
          ...this.chartOptions.plotOptions?.pie,
          donut: {
            ...this.chartOptions.plotOptions?.pie?.donut,
            size: '75%',
            labels: {
              show: false,
            },
          },
        },
      },
    };
    this.cdr.detectChanges();
  }

  private updateToGenderChart() {
    this.chartOptions = {
      ...this.chartOptions,
      series: [this.genderData.male, this.genderData.female],
      labels: ['Male', 'Female'],
      colors: ['#3B82F6', '#EC4899'],
      chart: {
        ...this.chartOptions.chart,
        type: 'donut',
      },
    };
    this.cdr.detectChanges();
  }

  private updateToPolarChart() {
    this.chartOptions = {
      ...this.chartOptions,
      chart: {
        ...this.chartOptions.chart,
        type: 'pie',
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['#fff'],
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: 'right',
        horizontalAlign: 'center',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        markers: {
          strokeWidth: 0,
          offsetX: -4,
          shape: 'circle',
        },
        itemMargin: {
          horizontal: 15,
          vertical: 8,
        },
        formatter: function (seriesName, opts) {
          return (
            seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex] + '%'
          );
        },
      },
      plotOptions: {
        ...this.chartOptions.plotOptions,
        pie: {
          ...this.chartOptions.plotOptions?.pie,
          donut: {
            ...this.chartOptions.plotOptions?.pie?.donut,
            labels: {
              show: false,
            },
          },
        },
      },
    };
    this.cdr.detectChanges();
  }
}
