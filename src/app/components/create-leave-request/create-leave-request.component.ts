import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-create-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-leave-request.component.html',
})
export class CreateLeaveRequestComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;

  formData = {
    startDate: '',
    endDate: '',
    reason: '',
  };

  onCancel() {
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.showConfirmModal = true;
    }
  }

  onConfirmSubmit(confirmed: boolean) {
    if (confirmed) {
      this.submitted.emit(this.formData);
      this.resetForm();
      this.close.emit();
    }
    this.showConfirmModal = false;
  }

  onConfirmCancel() {
    this.showConfirmModal = false;
  }

  isFormValid(): boolean {
    return !!(
      this.formData.startDate &&
      this.formData.endDate &&
      this.formData.reason
    );
  }

  private resetForm() {
    this.formData = {
      startDate: '',
      endDate: '',
      reason: '',
    };
  }
}
