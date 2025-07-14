import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartOptions } from '../pie-chart/pie-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApexchartsFixDirective } from '../../directives/apexcharts-fix.directive';
import { EmployeeDemographics } from '../../dto/analytics.dto';

@Component({
  selector: 'app-doughnut-chart',
  imports: [NgApexchartsModule, CommonModule, ApexchartsFixDirective],
  templateUrl: './doughnut-chart.component.html',
  styleUrl: './doughnut-chart.component.css',
})
export class DoughnutChartComponent implements OnChanges {
  @Input() title: string = 'Staff Demographic';
  @Input() demographicsData: EmployeeDemographics | null = null;
  @Input() series: number[] = [40, 50, 10];
  @Input() labels: string[] = ['20 - 39', '40 - 59', '60 - 75'];
  @Input() colors: string[] = ['#F6A24E', '#9747FF', '#32D583'];

  showGenderImage: boolean = false;
  genderData = {
    male: 45,
    female: 55,
    malePercent: 50,
    femalePercent: 50,
  };

  chartOptions: ChartOptions = {
    series: this.series,
    chart: {
      type: 'donut',
      height: 350,
      width: '100%',
      animations: {
        enabled: true,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['demographicsData'] && this.demographicsData) {
      this.updateDemographicsData();
    }
    this.updateChartOptions();
  }

  private updateChartOptions() {
    this.chartOptions.series = this.series;
    this.chartOptions.labels = this.labels;
    this.chartOptions.colors = this.colors;
  }

  private updateDemographicsData() {
    if (this.demographicsData) {
      // Update gender data
      this.genderData = {
        male: this.demographicsData.gender.male,
        female: this.demographicsData.gender.female,
        malePercent: this.demographicsData.gender.malePercent,
        femalePercent: this.demographicsData.gender.femalePercent,
      };

      // Update age range data for default view - always show all age groups
      const ageGroups = this.demographicsData.ageGroups;
      this.series = Object.values(ageGroups);
      this.labels = Object.keys(ageGroups);
      this.colors = [
        '#F6A24E',
        '#9747FF',
        '#32D583',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
      ];
    }
  }

  onSelectChange(event: Event) {
    const select = event.target as HTMLSelectElement;

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
      case 'Location':
        this.showGenderImage = false;
        this.updateToLocationChart();
        break;
      default:
        this.showGenderImage = false;
        this.updateToDonutChart();
    }
  }

  private updateToDonutChart() {
    // Use age groups data from API if available - always show all age groups
    let ageRangeSeries = this.series;
    let ageRangeLabels = this.labels;
    let ageRangeColors = this.colors;

    if (this.demographicsData) {
      const ageGroups = this.demographicsData.ageGroups;
      ageRangeSeries = Object.values(ageGroups);
      ageRangeLabels = Object.keys(ageGroups);
      ageRangeColors = [
        '#F6A24E',
        '#9747FF',
        '#32D583',
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
      ];
    }

    this.chartOptions = {
      ...this.chartOptions,
      series: ageRangeSeries,
      labels: ageRangeLabels,
      colors: ageRangeColors,
      chart: {
        ...this.chartOptions.chart,
        type: 'donut',
        height: 350,
        width: '100%',
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
          return seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex];
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
        height: 350,
        width: '100%',
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
          return seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex];
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

  private updateToPolarChart() {
    // Use service years data from API if available
    let serviceYearsSeries = [25, 30, 35, 10];
    let serviceYearsLabels = [
      '< 15 years',
      '16-30 years',
      '31-45 years',
      '> 46 years',
    ];

    if (this.demographicsData) {
      const serviceYears = this.demographicsData.serviceYears;
      serviceYearsSeries = [
        serviceYears.lessThan15,
        serviceYears.between16And30,
        serviceYears.between31And45,
        serviceYears.greaterThan46,
      ];
    }

    this.chartOptions = {
      ...this.chartOptions,
      series: serviceYearsSeries,
      labels: serviceYearsLabels,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      chart: {
        ...this.chartOptions.chart,
        type: 'pie',
        height: 350,
        width: '100%',
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
          return seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex];
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

  private updateToLocationChart() {
    // Use location data from API if available - show all locations including zeros
    let locationSeries = [30, 25, 20, 15, 10];
    let locationLabels = ['City A', 'City B', 'City C', 'City D', 'Others'];
    let locationColors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#F6A24E',
      '#9747FF',
    ];

    if (this.demographicsData && this.demographicsData.locations) {
      const locations = this.demographicsData.locations;
      // Show all locations including those with zero counts
      locationSeries = locations.map(
        (location) => parseInt(location.count) || 0
      );
      locationLabels = locations.map((location) => {
        if (
          location.city &&
          location.city !== 'false' &&
          location.city !== 'null'
        ) {
          return location.city && location.state
            ? `${location.city}, ${location.state}`
            : location.city;
        }
        return 'Unknown Location';
      });
      locationColors = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#F6A24E',
        '#9747FF',
        '#32D583',
      ];
    }

    this.chartOptions = {
      ...this.chartOptions,
      series: locationSeries,
      labels: locationLabels,
      colors: locationColors,
      chart: {
        ...this.chartOptions.chart,
        type: 'donut',
        height: 350,
        width: '100%',
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
          return seriesName + ' - ' + opts.w.globals.series[opts.seriesIndex];
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
}
