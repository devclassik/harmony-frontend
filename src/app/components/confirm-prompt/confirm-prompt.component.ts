import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-prompt',
  imports: [CommonModule],
  templateUrl: './confirm-prompt.component.html',
  styleUrl: './confirm-prompt.component.css'
})
export class ConfirmPromptComponent {
  @Input() title: string = 'Confirm';
  @Input() text: string = 'Are you sure you want to submit this appraisal?';
  @Input() imageUrl: string | null = null;
  @Input() yesButtonText: string = 'Yes';
  @Input() noButtonText: string = 'No';
  @Input() yesButtonColor: string = 'green';
  @Input() noButtonColor: string = 'red';

  @Output() confirmed = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>(); // Emit event when modal is closed

  onConfirm(confirmed: boolean): void {
    this.confirmed.emit(confirmed);
  }

  onOverlayClick(event: MouseEvent): void {
    // Close the modal when clicking outside the modal content
    this.closed.emit();
  }
}
