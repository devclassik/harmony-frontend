import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-success-modal',
  imports: [CommonModule],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.css'
})
export class SuccessModalComponent {

  @Input() title: string = 'Success!';
  @Input() showOkButton: boolean = true;
  @Input() okButtonText: string = 'OK';
  @Input() okButtonLink?: string; // If set, clicking OK navigates to this link
  @Output() closed = new EventEmitter<void>();

  onOk() {
    if (this.okButtonLink) {
      window.location.href = this.okButtonLink;
    } else {
      this.closed.emit();
    }
  }

  onOverlayClick() {
    if (!this.showOkButton) {
      this.closed.emit();
    }
  }
}
