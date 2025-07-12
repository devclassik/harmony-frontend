import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LeaveStatistics } from '../../dto/analytics.dto';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexFill,
  ApexTooltip,
  ApexResponsive,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule, CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() leaveData: LeaveStatistics | null = null;
  @Input() selectedYear: number = new Date().getFullYear();
  @Output() yearChange = new EventEmitter<number>();

  public chartOptions: Partial<ChartOptions> = {};

  // Available years for the dropdown
  availableYears: number[] = [
    new Date().getFullYear() - 2,
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1,
  ];

  constructor() {
    this.initializeChartOptions();
  }

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leaveData'] || changes['selectedYear']) {
      this.updateChartData();
    }
  }

  private initializeChartOptions(): void {
    this.chartOptions = {
      series: [
        {
          name: 'Annual Leave',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: 'Sick Leave',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
        {
          name: 'Leave of Absence',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
      chart: {
        type: 'bar',
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
        width: 1,
        colors: ['transparent'],
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
      colors: ['#32D583', '#40C057', '#E6F4EB'],
      fill: {
        opacity: 1,
      },
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

  private updateChartData(): void {
    if (this.leaveData && this.chartOptions.series) {
      // Extract data for each leave type
      const annualData = this.leaveData.map((month) => month.ANNUAL);
      const sickData = this.leaveData.map((month) => month.SICK);
      const absenceData = this.leaveData.map((month) => month.ABSENCE);

      // Update chart series
      this.chartOptions.series = [
        {
          name: 'Annual Leave',
          data: annualData,
        },
        {
          name: 'Sick Leave',
          data: sickData,
        },
        {
          name: 'Leave of Absence',
          data: absenceData,
        },
      ];
    }
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const year = parseInt(target.value);
    this.selectedYear = year;
    this.yearChange.emit(year);
  }
}
