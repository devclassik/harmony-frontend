import { ApexChart } from 'ng-apexcharts';

/**
 * Global ApexCharts configuration to fix passive event listener warnings
 * This configuration should be merged with individual chart options
 */
export const APEX_CHARTS_GLOBAL_CONFIG: Partial<ApexChart> = {
  events: {
    beforeMount: function(chartContext: any, config: any) {
      // Add non-passive event listeners for touch events to prevent warnings
      const chartElement = chartContext.el;
      if (chartElement) {
        // Handle touch events with non-passive listeners
        chartElement.addEventListener('touchstart', function(e: Event) {
          e.stopPropagation();
        }, { passive: false });
        
        chartElement.addEventListener('touchmove', function(e: Event) {
          e.stopPropagation();
        }, { passive: false });
        
        chartElement.addEventListener('touchend', function(e: Event) {
          e.stopPropagation();
        }, { passive: false });
      }
    },
    mounted: function(chartContext: any, config: any) {
      // Additional configuration after chart is mounted
      const chartElement = chartContext.el;
      if (chartElement) {
        // Ensure proper event handling for mouse events
        chartElement.addEventListener('mousedown', function(e: Event) {
          e.stopPropagation();
        }, { passive: false });
      }
    }
  }
};

/**
 * Helper function to merge global config with chart options
 */
export function mergeApexChartsConfig(chartOptions: any): any {
  return {
    ...chartOptions,
    chart: {
      ...chartOptions.chart,
      ...APEX_CHARTS_GLOBAL_CONFIG
    }
  };
} 