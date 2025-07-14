import { Directive, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appApexchartsFix]',
  standalone: true
})
export class ApexchartsFixDirective implements OnInit, OnDestroy {
  private touchStartHandler = (event: Event) => {
    event.stopPropagation();
  };

  private touchMoveHandler = (event: Event) => {
    event.stopPropagation();
  };

  private touchEndHandler = (event: Event) => {
    event.stopPropagation();
  };

  private wheelHandler = (event: Event) => {
    event.stopPropagation();
  };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Apply CSS fixes
    this.renderer.setStyle(this.el.nativeElement, 'touch-action', 'manipulation');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-touch-callout', 'none');
    this.renderer.setStyle(this.el.nativeElement, '-webkit-user-select', 'none');
    this.renderer.setStyle(this.el.nativeElement, 'user-select', 'none');

    // Add event listeners with passive: false
    this.addEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private removeEventListeners(): void {
    const chartElement = this.el.nativeElement.querySelector('.apexcharts-canvas');
    if (chartElement) {
      chartElement.removeEventListener('touchstart', this.touchStartHandler);
      chartElement.removeEventListener('touchmove', this.touchMoveHandler);
      chartElement.removeEventListener('touchend', this.touchEndHandler);
      chartElement.removeEventListener('wheel', this.wheelHandler);
    }
  }

  private addEventListeners(): void {
    // Use multiple timeouts to ensure the chart is rendered
    const timeouts = [100, 500, 1000, 2000];
    
    timeouts.forEach(delay => {
      setTimeout(() => {
        const chartElements = this.el.nativeElement.querySelectorAll('.apexcharts-canvas, .apexcharts-svg, .apexcharts-inner, [class*="apexcharts"]');
        chartElements.forEach((chartElement: Element) => {
          // Add touch and wheel event listeners with passive: false
          chartElement.addEventListener('touchstart', this.touchStartHandler, { passive: false });
          chartElement.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
          chartElement.addEventListener('touchend', this.touchEndHandler, { passive: false });
          chartElement.addEventListener('wheel', this.wheelHandler, { passive: false });
        });
      }, delay);
    });
  }

} 