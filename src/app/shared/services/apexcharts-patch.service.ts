import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApexChartsPatchService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Patch ApexCharts to fix passive event listener issues
   */
  patchApexCharts(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Wait for ApexCharts to be available
    this.waitForApexCharts().then(() => {
      this.applyPatches();
    });
  }

  private waitForApexCharts(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).ApexCharts) {
        resolve();
      } else {
        // Check every 100ms for ApexCharts
        const interval = setInterval(() => {
          if ((window as any).ApexCharts) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, 10000);
      }
    });
  }

  private applyPatches(): void {
    // Patch the ApexCharts constructor
    this.patchApexChartsConstructor();
    
    // Patch event handling methods
    this.patchEventHandling();
    
    // Patch DOM manipulation methods
    this.patchDOMManipulation();
  }

  private patchApexChartsConstructor(): void {
    const ApexCharts = (window as any).ApexCharts;
    if (!ApexCharts) return;

    const originalConstructor = ApexCharts;
    
    // Override the constructor
    (window as any).ApexCharts = function(chartElement: any, options: any) {
      const chart = new originalConstructor(chartElement, options);
      
      // Patch the chart instance
      this.patchChartInstance(chart);
      
      return chart;
    };

    // Copy static methods
    Object.setPrototypeOf((window as any).ApexCharts, originalConstructor);
    Object.assign((window as any).ApexCharts, originalConstructor);
  }

  private patchChartInstance(chart: any): void {
    if (!chart) return;

    // Patch the render method
    const originalRender = chart.render;
    chart.render = () => {
      const result = originalRender.call(chart);
      
      // Apply fixes after rendering
      setTimeout(() => {
        this.applyFixesToChart(chart);
      }, 100);
      
      return result;
    };

    // Patch the update method
    const originalUpdate = chart.update;
    chart.update = (options: any) => {
      const result = originalUpdate.call(chart, options);
      
      // Apply fixes after updating
      setTimeout(() => {
        this.applyFixesToChart(chart);
      }, 100);
      
      return result;
    };
  }

  private patchEventHandling(): void {
    // Override addEventListener globally for ApexCharts elements
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const self = this;
    
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      const element = this as Element;
      
      // Check if this is an ApexCharts element
      const isApexChartsElement = self.isApexChartsElement(element);
      
      if (isApexChartsElement && 
          (type === 'touchstart' || type === 'touchmove' || type === 'touchend' || type === 'wheel') &&
          options !== false) {
        
        // Force passive: false for ApexCharts elements
        const newOptions: AddEventListenerOptions = typeof options === 'boolean' 
          ? { passive: false, capture: options }
          : { ...options, passive: false };
        
        return originalAddEventListener.call(this, type, listener, newOptions);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private isApexChartsElement(element: Element): boolean {
    if (!element || !element.classList) return false;
    
    const apexChartsClasses = [
      'apexcharts-canvas', 'apexcharts-svg', 'apexcharts-inner',
      'apexcharts-graphical', 'apexcharts-data-labels', 'apexcharts-datalabels',
      'apexcharts-annotations', 'apexcharts-gridline', 'apexcharts-gridLine',
      'apexcharts-xaxis', 'apexcharts-yaxis', 'apexcharts-xaxis-label',
      'apexcharts-yaxis-label', 'apexcharts-title', 'apexcharts-subtitle',
      'apexcharts-zoom', 'apexcharts-pan', 'apexcharts-selection',
      'apexcharts-crosshair', 'apexcharts-marker', 'apexcharts-point',
      'apexcharts-area', 'apexcharts-line', 'apexcharts-column',
      'apexcharts-bar', 'apexcharts-candlestick', 'apexcharts-boxplot',
      'apexcharts-rangebar', 'apexcharts-radar', 'apexcharts-polar',
      'apexcharts-scatter', 'apexcharts-bubble', 'apexcharts-heatmap',
      'apexcharts-treemap', 'apexcharts-tooltip', 'apexcharts-legend',
      'apexcharts-legend-marker', 'apexcharts-point-annotations',
      'apexcharts-series', 'apexcharts-donut-slice', 'apexcharts-pie-slice',
      'apexcharts-bar-area', 'apexcharts-line-area', 'apexcharts-area-area',
      'apexcharts-candlestick-area', 'apexcharts-boxplot-area',
      'apexcharts-rangebar-area', 'apexcharts-radar-area',
      'apexcharts-polar-area', 'apexcharts-scatter-area',
      'apexcharts-bubble-area', 'apexcharts-heatmap-area',
      'apexcharts-treemap-area'
    ];
    
    return apexChartsClasses.some(className => element.classList.contains(className));
  }

  private patchDOMManipulation(): void {
    // Override createElement to add event listeners to ApexCharts elements
    const originalCreateElement = document.createElement;
    const self = this;
    
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(document, tagName);
      
      // If this is an SVG element (which ApexCharts uses), add event handling
      if (tagName.toLowerCase() === 'svg') {
        setTimeout(() => {
          if (element.classList.contains('apexcharts-svg')) {
            self.applyEventListenersToElement(element);
          }
        }, 0);
      }
      
      return element;
    };
  }

  private applyFixesToChart(chart: any): void {
    if (!chart || !chart.el) return;
    
    const chartElement = chart.el;
    if (chartElement) {
      this.applyEventListenersToElement(chartElement);
      
      // Also apply to child elements
      const childElements = chartElement.querySelectorAll('*');
      childElements.forEach((child: Element) => {
        if (this.isApexChartsElement(child)) {
          this.applyEventListenersToElement(child as HTMLElement);
        }
      });
    }
  }

  private applyEventListenersToElement(element: HTMLElement): void {
    if (!element) return;
    
    // Remove existing listeners
    element.removeEventListener('touchstart', this.handleTouchEvent, false);
    element.removeEventListener('touchmove', this.handleTouchEvent, false);
    element.removeEventListener('touchend', this.handleTouchEvent, false);
    element.removeEventListener('wheel', this.handleWheelEvent, false);
    
    // Add new listeners with passive: false
    element.addEventListener('touchstart', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('touchmove', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('touchend', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('wheel', this.handleWheelEvent, { passive: false } as AddEventListenerOptions);
  }

  private handleTouchEvent = (event: Event): void => {
    // Prevent default behavior for touch events
    event.stopPropagation();
  };

  private handleWheelEvent = (event: Event): void => {
    // Prevent default behavior for wheel events
    event.stopPropagation();
  };
} 