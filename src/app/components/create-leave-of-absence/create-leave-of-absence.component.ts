import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-create-leave-of-absence',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-leave-of-absence.component.html',
  styleUrl: './create-leave-of-absence.component.css',
})
export class CreateLeaveOfAbsenceComponent {
  @Input() show: boolean = false;
  @Input() title: string = 'Create Leave of Absence Request';
  @Input() subtitle: string = 'Leave of Absence Information';
  @Input() reasonPlaceholder: string =
    'Enter your reason for leave of absence...';
  @Input() confirmText: string =
    'Are you sure you want to create this leave of absence request?';
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;

  formData = {
    requestType: '',
    startDate: '',
    duration: {
      value: 1,
      unit: 'Days',
    },
    location: '',
    reason: '',
    files: [] as File[],
  };

  requestTypes = [
    'Personal',
    'Sabbatical',
    'Family Emergency',
    'Medical',
    'Educational',
  ];
  durationUnits = ['Days', 'Weeks', 'Months', 'Years'];

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
      const submissionData = {
        ...this.formData,
        duration: `${this.formData.duration.value} ${this.formData.duration.unit}`,
      };
      this.submitted.emit(submissionData);
      this.resetForm();
      this.close.emit();
    }
    this.showConfirmModal = false;
  }

  onConfirmCancel() {
    this.showConfirmModal = false;
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.formData.files = [...this.formData.files, ...files];
  }

  removeFile(index: number) {
    this.formData.files.splice(index, 1);
  }

  isFormValid(): boolean {
    return !!(
      this.formData.requestType &&
      this.formData.startDate &&
      this.formData.duration.value &&
      this.formData.location &&
      this.formData.reason
    );
  }

  private resetForm() {
    this.formData = {
      requestType: '',
      startDate: '',
      duration: {
        value: 1,
        unit: 'Days',
      },
      location: '',
      reason: '',
      files: [],
    };
  }
}
