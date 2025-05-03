import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
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
} from "ng-apexcharts";

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
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css'
})
export class BarChartComponent implements OnInit {
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Annual Leave',
          data: [40, 25, 20, 30, 40, 40, 40, 20, 40, 10, 20, 15]
        },
        {
          name: 'Sick Leave',
          data: [20, 35, 10, 15, 25, 20, 15, 50, 20, 5, 35, 10]
        },
        {
          name: 'Leave of Absence',
          data: [25, 15, 30, 20, 25, 30, 10, 20, 30, 5, 15, 10]
        }
      ],
      chart: {
        type: 'bar',
        height: 250,
        stacked: true,
        toolbar: {
          show: false,
        },
        redrawOnWindowResize: true,
        redrawOnParentResize: true
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetY: 0
          },
          plotOptions: {
            bar: {
              columnWidth: '40%'
            }
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '44%',
          borderRadius: 5,
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last'
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
        offsetY: -10
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      yaxis: {
        max: 100,
        title: {
          text: undefined
        }
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
          offsetY: 0
          
        },
        itemMargin: {
          horizontal: 15,
          vertical: 8
        }
      },
      tooltip: {
        
        y: {
          formatter: function (val) {
            return val + " days";
          }
        }
      }
    };
  }

  ngOnInit(): void {
  }
}
