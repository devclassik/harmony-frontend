import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-screen-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-screen-animation.component.html',
})
export class WelcomeScreenAnimationComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() userName: string = 'User';
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  private timeoutId: any = null;

  ngOnInit() {
    // Initial timeout setup if show is true
    if (this.show) {
      this.setAutoCloseTimeout();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Watch for changes in the show property
    if (changes['show'] && changes['show'].currentValue === true) {
      this.setAutoCloseTimeout();
    } else if (changes['show'] && changes['show'].currentValue === false) {
      this.clearAutoCloseTimeout();
    }
  }

  ngOnDestroy() {
    // Clean up any timers if component is destroyed
    this.clearAutoCloseTimeout();
  }

  private setAutoCloseTimeout() {
    // Clear existing timeout first
    this.clearAutoCloseTimeout();

    // Set new timeout for 8 seconds
    this.timeoutId = setTimeout(() => {
      this.closeAnimation();
    }, 8000);
  }

  private clearAutoCloseTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  closeAnimation() {
    this.close.emit();
  }

  // Handle click on overlay to close animation
  onOverlayClick(event: Event) {
    // Only close if clicking on the overlay itself, not on the content
    if (event.target === event.currentTarget) {
      this.closeAnimation();
    }
  }
}
