import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EmployeeRecordsComponent } from '../../pages/employee-records/employee-records.component';

export interface PromptConfig {
  title?: string;
  text?: string;
  imageUrl?: string;
  yesButtonText: string;
  noButtonText: string;
}
@Component({
  selector: 'app-confirm-prompt',
  imports: [CommonModule],
  templateUrl: './confirm-prompt.component.html',
  styleUrl: './confirm-prompt.component.css',
})
export class ConfirmPromptComponent {
  @Input() title: string = 'Confirm';
  @Input() text: string = 'Are you sure you want to submit this appraisal?';
  @Input() imageUrl: string | null = null;
  @Input() yesButtonText: string = 'Yes';
  @Input() noButtonText: string = 'No';
  @Input() yesButtonColor: string = 'green';
  @Input() noButtonColor: string = 'red';
  @Input() data: any;

  @Output() confirmed = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>(); // Emit event when modal is closed

  onConfirm(result: boolean) {
    if (result) {
      this.confirmed.emit(result);
    } else {
      this.closed.emit();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    // Close the modal when clicking outside the modal content
    this.closed.emit();
  }
}
