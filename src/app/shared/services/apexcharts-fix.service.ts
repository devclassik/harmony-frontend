import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApexChartsFixService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Apply global fixes for ApexCharts passive event listener issues
   */
  applyGlobalFixes(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Apply fixes immediately
    this.overrideAddEventListener();
    this.applyCSSFixes();
    this.handleExistingCharts();
    
    // Apply fixes after a delay to catch late-rendered charts
    setTimeout(() => {
      this.handleExistingCharts();
    }, 500);
    
    setTimeout(() => {
      this.handleExistingCharts();
    }, 1000);
    
    setTimeout(() => {
      this.handleExistingCharts();
    }, 2000);
  }

  private overrideAddEventListener(): void {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      // Check if this is an ApexCharts related element
      const element = this as Element;
      const isApexChartsElement = element.classList?.contains('apexcharts-canvas') ||
                                 element.classList?.contains('apexcharts-tooltip') ||
                                 element.classList?.contains('apexcharts-legend') ||
                                 element.classList?.contains('apexcharts-legend-marker') ||
                                 element.classList?.contains('apexcharts-point-annotations') ||
                                 element.classList?.contains('apexcharts-series') ||
                                 element.classList?.contains('apexcharts-donut-slice') ||
                                 element.classList?.contains('apexcharts-pie-slice') ||
                                 element.classList?.contains('apexcharts-bar-area') ||
                                 element.classList?.contains('apexcharts-line-area') ||
                                 element.classList?.contains('apexcharts-area-area') ||
                                 element.classList?.contains('apexcharts-candlestick-area') ||
                                 element.classList?.contains('apexcharts-boxplot-area') ||
                                 element.classList?.contains('apexcharts-rangebar-area') ||
                                 element.classList?.contains('apexcharts-radar-area') ||
                                 element.classList?.contains('apexcharts-polar-area') ||
                                 element.classList?.contains('apexcharts-scatter-area') ||
                                 element.classList?.contains('apexcharts-bubble-area') ||
                                 element.classList?.contains('apexcharts-heatmap-area') ||
                                 element.classList?.contains('apexcharts-treemap-area') ||
                                 element.classList?.contains('apexcharts-svg') ||
                                 element.classList?.contains('apexcharts-inner') ||
                                 element.classList?.contains('apexcharts-graphical') ||
                                 element.classList?.contains('apexcharts-data-labels') ||
                                 element.classList?.contains('apexcharts-datalabels') ||
                                 element.classList?.contains('apexcharts-annotations') ||
                                 element.classList?.contains('apexcharts-gridline') ||
                                 element.classList?.contains('apexcharts-gridLine') ||
                                 element.classList?.contains('apexcharts-xaxis') ||
                                 element.classList?.contains('apexcharts-yaxis') ||
                                 element.classList?.contains('apexcharts-xaxis-label') ||
                                 element.classList?.contains('apexcharts-yaxis-label') ||
                                 element.classList?.contains('apexcharts-title') ||
                                 element.classList?.contains('apexcharts-subtitle') ||
                                 element.classList?.contains('apexcharts-zoom') ||
                                 element.classList?.contains('apexcharts-pan') ||
                                 element.classList?.contains('apexcharts-selection') ||
                                 element.classList?.contains('apexcharts-crosshair') ||
                                 element.classList?.contains('apexcharts-marker') ||
                                 element.classList?.contains('apexcharts-point') ||
                                 element.classList?.contains('apexcharts-area') ||
                                 element.classList?.contains('apexcharts-line') ||
                                 element.classList?.contains('apexcharts-column') ||
                                 element.classList?.contains('apexcharts-bar') ||
                                 element.classList?.contains('apexcharts-candlestick') ||
                                 element.classList?.contains('apexcharts-boxplot') ||
                                 element.classList?.contains('apexcharts-rangebar') ||
                                 element.classList?.contains('apexcharts-radar') ||
                                 element.classList?.contains('apexcharts-polar') ||
                                 element.classList?.contains('apexcharts-scatter') ||
                                 element.classList?.contains('apexcharts-bubble') ||
                                 element.classList?.contains('apexcharts-heatmap') ||
                                 element.classList?.contains('apexcharts-treemap');

      // For touch and wheel events on ApexCharts elements, ensure passive is false
      if (isApexChartsElement && 
          (type === 'touchstart' || type === 'touchmove' || type === 'touchend' || type === 'wheel') &&
          options !== false) {
        
        // Convert options to object if it's a boolean
        const newOptions: AddEventListenerOptions = typeof options === 'boolean' 
          ? { passive: false, capture: options }
          : { ...options, passive: false };
        
        return originalAddEventListener.call(this, type, listener, newOptions);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private applyCSSFixes(): void {
    // Add CSS rules dynamically if they don't exist
    if (!document.getElementById('apexcharts-fix-styles')) {
      const style = document.createElement('style');
      style.id = 'apexcharts-fix-styles';
      style.textContent = `
        .apexcharts-canvas,
        .apexcharts-canvas *,
        .apexcharts-svg,
        .apexcharts-svg *,
        .apexcharts-inner,
        .apexcharts-inner *,
        .apexcharts-graphical,
        .apexcharts-graphical *,
        .apexcharts-data-labels,
        .apexcharts-data-labels *,
        .apexcharts-datalabels,
        .apexcharts-datalabels *,
        .apexcharts-annotations,
        .apexcharts-annotations *,
        .apexcharts-gridline,
        .apexcharts-gridline *,
        .apexcharts-gridLine,
        .apexcharts-gridLine *,
        .apexcharts-xaxis,
        .apexcharts-xaxis *,
        .apexcharts-yaxis,
        .apexcharts-yaxis *,
        .apexcharts-xaxis-label,
        .apexcharts-xaxis-label *,
        .apexcharts-yaxis-label,
        .apexcharts-yaxis-label *,
        .apexcharts-title,
        .apexcharts-title *,
        .apexcharts-subtitle,
        .apexcharts-subtitle *,
        .apexcharts-zoom,
        .apexcharts-zoom *,
        .apexcharts-pan,
        .apexcharts-pan *,
        .apexcharts-selection,
        .apexcharts-selection *,
        .apexcharts-crosshair,
        .apexcharts-crosshair *,
        .apexcharts-marker,
        .apexcharts-marker *,
        .apexcharts-point,
        .apexcharts-point *,
        .apexcharts-area,
        .apexcharts-area *,
        .apexcharts-line,
        .apexcharts-line *,
        .apexcharts-column,
        .apexcharts-column *,
        .apexcharts-bar,
        .apexcharts-bar *,
        .apexcharts-candlestick,
        .apexcharts-candlestick *,
        .apexcharts-boxplot,
        .apexcharts-boxplot *,
        .apexcharts-rangebar,
        .apexcharts-rangebar *,
        .apexcharts-radar,
        .apexcharts-radar *,
        .apexcharts-polar,
        .apexcharts-polar *,
        .apexcharts-scatter,
        .apexcharts-scatter *,
        .apexcharts-bubble,
        .apexcharts-bubble *,
        .apexcharts-heatmap,
        .apexcharts-heatmap *,
        .apexcharts-treemap,
        .apexcharts-treemap * {
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        .apexcharts-tooltip,
        .apexcharts-legend,
        .apexcharts-legend-marker,
        .apexcharts-point-annotations,
        .apexcharts-series,
        .apexcharts-donut-slice,
        .apexcharts-pie-slice,
        .apexcharts-bar-area,
        .apexcharts-line-area,
        .apexcharts-area-area,
        .apexcharts-candlestick-area,
        .apexcharts-boxplot-area,
        .apexcharts-rangebar-area,
        .apexcharts-radar-area,
        .apexcharts-polar-area,
        .apexcharts-scatter-area,
        .apexcharts-bubble-area,
        .apexcharts-heatmap-area,
        .apexcharts-treemap-area {
          touch-action: manipulation !important;
          pointer-events: auto !important;
        }
        
        @media (max-width: 768px) {
          .apexcharts-canvas,
          .apexcharts-svg,
          .apexcharts-inner {
            touch-action: pan-x pan-y !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  private handleExistingCharts(): void {
    // Handle any existing ApexCharts instances
    const chartElements = document.querySelectorAll('.apexcharts-canvas, .apexcharts-svg, .apexcharts-inner');
    chartElements.forEach((element: Element) => {
      this.applyEventListenersToElement(element as HTMLElement);
    });
    
    // Also handle any parent containers that might have charts
    const chartContainers = document.querySelectorAll('[class*="apexcharts"]');
    chartContainers.forEach((element: Element) => {
      this.applyEventListenersToElement(element as HTMLElement);
    });
  }

  private applyEventListenersToElement(element: HTMLElement): void {
    // Remove existing listeners to avoid duplicates
    element.removeEventListener('touchstart', this.handleTouchEvent, false);
    element.removeEventListener('touchmove', this.handleTouchEvent, false);
    element.removeEventListener('touchend', this.handleTouchEvent, false);
    element.removeEventListener('wheel', this.handleWheelEvent, false);
    
    // Add new listeners with passive: false
    element.addEventListener('touchstart', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('touchmove', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('touchend', this.handleTouchEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('wheel', this.handleWheelEvent, { passive: false } as AddEventListenerOptions);
    
    // Also handle mouse events that might cause issues
    element.addEventListener('mousedown', this.handleMouseEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('mousemove', this.handleMouseEvent, { passive: false } as AddEventListenerOptions);
    element.addEventListener('mouseup', this.handleMouseEvent, { passive: false } as AddEventListenerOptions);
  }

  private handleTouchEvent = (event: Event): void => {
    // Prevent default behavior for touch events on chart elements
    event.stopPropagation();
  };

  private handleMouseEvent = (event: Event): void => {
    // Prevent default behavior for mouse events on chart elements
    event.stopPropagation();
  };

  private handleWheelEvent = (event: Event): void => {
    // Prevent default behavior for wheel events on chart elements
    event.stopPropagation();
  };

  /**
   * Apply fixes to a specific chart element
   */
  applyFixesToElement(element: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.applyEventListenersToElement(element);
  }

  /**
   * Monitor for new ApexCharts instances and apply fixes
   */
  startMonitoring(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Use MutationObserver to watch for new chart elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.classList?.contains('apexcharts-canvas') || 
                element.classList?.contains('apexcharts-svg') ||
                element.classList?.contains('apexcharts-inner')) {
              this.applyFixesToElement(element as HTMLElement);
            }
            // Check child elements
            const chartElements = element.querySelectorAll?.('.apexcharts-canvas, .apexcharts-svg, .apexcharts-inner');
            chartElements?.forEach((chartElement) => {
              this.applyFixesToElement(chartElement as HTMLElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
} 