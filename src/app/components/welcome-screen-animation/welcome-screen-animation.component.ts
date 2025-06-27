import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-screen-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-screen-animation.component.html',
})
export class WelcomeScreenAnimationComponent implements OnInit, OnDestroy {
  @Input() userName: string = 'User';
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    // Auto close after 8 seconds to give users more time
    if (this.show) {
      setTimeout(() => {
        this.closeAnimation();
      }, 8000);
    }
  }

  ngOnDestroy() {
    // Clean up any timers if component is destroyed
  }

  closeAnimation() {
    this.close.emit();
  }
}
