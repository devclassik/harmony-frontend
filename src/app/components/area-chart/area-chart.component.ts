import { Component, Input } from '@angular/core';
import { ChartOptions } from '../bar-chart/bar-chart.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export interface FilterTab {
  label: string;
  value: string;
  icon?: string;
}

interface ChartData {
  name: string;
  data: number[];
}

@Component({
  selector: 'app-area-chart',
  imports: [NgApexchartsModule, CommonModule],
  templateUrl: './area-chart.component.html',
  styleUrl: './area-chart.component.css',
})
export class AreaChartComponent {
  public chartOptions: Partial<ChartOptions>;
  @Input() title: string = 'Leave Usage';
  @Input() set colors(value: string[]) {
    if (value && value.length > 0) {
      this._colors = value;
    } else {
      this._colors = ['#32D583', '#40C057', '#E6F4EB'];
    }
    this.updateChartColors();
  }
  get colors(): string[] {
    return this._colors;
  }
  private _colors: string[] = ['#32D583', '#40C057', '#E6F4EB'];
  showFilterDropdown: boolean = false;
  activeFilterTab: string = '';
  @Input() filterTabs: FilterTab[] = [
    { label: '...', value: '' },
    { label: 'Warnings', value: 'Warnings' },
    { label: 'Suspensions', value: 'Suspensions' },
    { label: 'Terminations', value: 'Terminations' },
  ];

  private chartData: { [key: string]: ChartData[] } = {
    '': [
      {
        name: 'Annual Leave',
        data: [40, 25, 20, 30, 40, 40, 40, 20, 40, 10, 20, 15],
      },
    ],
    'Warnings': [
      {
        name: 'Warnings',
        data: [15, 20, 25, 30, 25, 20, 15, 20, 25, 30, 25, 20],
      },
    ],
    'Suspensions': [
      {
        name: 'Suspensions',
        data: [5, 8, 12, 10, 7, 5, 8, 12, 10, 7, 5, 8],
      },
    ],
    'Terminations': [
      {
        name: 'Terminations',
        data: [2, 3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1],
      },
    ],
  };

  private updateChartColors() {
    if (this.chartOptions) {
      this.chartOptions.colors = this._colors;
      if (this.chartOptions.stroke) {
        this.chartOptions.stroke.colors = [this._colors[0]];
      }
    }
  }

  constructor() {
    this.chartOptions = {
      series: this.chartData[''],
      chart: {
        type: 'area',
        height: 250,
        stacked: true,
        toolbar: {
          show: false,
        },
        redrawOnWindowResize: true,
        redrawOnParentResize: true,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetY: 0,
            },
            plotOptions: {
              bar: {
                columnWidth: '40%',
              },
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '44%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last',
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '8px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          colors: ['#040404'],
        },
        offsetY: -10,
      },
      stroke: {
        show: true,
        width: 2,
        colors: [this.colors[0]],
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
      },
      yaxis: {
        max: 100,
        title: {
          text: undefined,
        },
      },
      fill: {
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      colors: this.colors,
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetY: 0,
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        markers: {
          strokeWidth: 0,
          offsetX: -4,
          offsetY: 0,
        },
        itemMargin: {
          horizontal: 15,
          vertical: 8,
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' days';
          },
        },
      },
    };
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  onStatusTabClick(tab: FilterTab) {
    this.activeFilterTab = tab.value;
    this.toggleFilterDropdown();
  }

  onFilterTabClick(tab: FilterTab) {
    this.activeFilterTab = tab.value;
    this.updateChartData();
    this.toggleFilterDropdown();
  }

  private updateChartData() {
    if (this.chartOptions.series) {
      this.chartOptions.series = this.chartData[this.activeFilterTab] || this.chartData[''];
    }
  }

  ngOnInit(): void {}
}
