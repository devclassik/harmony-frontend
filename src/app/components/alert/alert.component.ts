import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert, AlertStyle } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() alert!: Alert;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  isVisible = false;
  private timer?: number;

  private alertStyles: Record<Alert['type'], AlertStyle> = {
    success: {
      wrapper: "bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400",
      icon: "text-green-500",
      text: "text-green-800",
      animation: "animate-bounce-slow"
    },
    error: {
      wrapper: "bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400",
      icon: "text-red-500",
      text: "text-red-800",
      animation: "animate-shake"
    },
    warning: {
      wrapper: "bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400",
      icon: "text-yellow-500",
      text: "text-yellow-800",
      animation: "animate-pulse-fast"
    },
    info: {
      wrapper: 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400',
      icon: 'text-blue-500',
      text: 'text-blue-800',
      animation: 'animate-slide-left'
    }
  };

  private iconClasses: Record<Alert['type'], string> = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  ngOnInit() {
    this.isVisible = this.isOpen;
    if (this.alert.autoClose && this.isVisible) {
      this.timer = window.setTimeout(() => this.handleClose(), this.alert.autoCloseTime || 5000);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  handleClose() {
    const element = document.querySelector('.animate-fade-in');
    if (element) {
      element.classList.remove('animate-fade-in');
      element.classList.add('animate-fade-out');
      setTimeout(() => {
        this.isVisible = false;
        this.close.emit();
      }, 300); // Match the animation duration
    } else {
      this.isVisible = false;
      this.close.emit();
    }
  }

  getAlertClasses(): string {
    const style = this.alertStyles[this.alert.type];
    return `${style.wrapper} ${style.animation}`;
  }

  getIconClass(): string {
    const style = this.alertStyles[this.alert.type];
    return `${this.iconClasses[this.alert.type]} ${style.icon}`;
  }

  getTextClass(): string {
    return this.alertStyles[this.alert.type].text;
  }
}
