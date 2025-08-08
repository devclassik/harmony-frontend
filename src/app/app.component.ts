import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AlertSystemComponent } from './components/alert-system/alert-system.component';
import { ApexChartsFixService } from './shared/services/apexcharts-fix.service';
import { ApexChartsPatchService } from './shared/services/apexcharts-patch.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, AlertSystemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'harmony-frontend';

  constructor(
    private apexChartsFixService: ApexChartsFixService,
    private apexChartsPatchService: ApexChartsPatchService
  ) {}

  ngOnInit(): void {
    // Apply ApexCharts fixes globally
    this.apexChartsFixService.applyGlobalFixes();
    this.apexChartsFixService.startMonitoring();
    
    // Apply ApexCharts patches
    this.apexChartsPatchService.patchApexCharts();
  }
}
