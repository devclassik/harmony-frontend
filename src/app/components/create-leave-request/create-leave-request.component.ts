import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-leave-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  onConfirmSubmit() {
    this.submitted.emit(this.formData);
    this.showConfirmModal = false;
    this.resetForm();
    this.close.emit();
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
