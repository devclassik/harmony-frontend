import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-create-retirement-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-retirement-request.component.html',
  styleUrl: './create-retirement-request.component.css',
})
export class CreateRetirementRequestComponent {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;
  isUploading: boolean = false;
  uploadedDocuments: string[] = [];

  formData = {
    replacementRecommendation: '',
    requestDate: '',
    destination: '',
    destinationReason: '',
    documents: [] as File[],
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

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.formData.documents = [...this.formData.documents, ...files];
  }

  removeDocument(index: number) {
    this.formData.documents.splice(index, 1);
  }

  isFormValid(): boolean {
    return !!(
      this.formData.replacementRecommendation &&
      this.formData.requestDate &&
      this.formData.destinationReason
    );
  }

  private resetForm() {
    this.formData = {
      replacementRecommendation: '',
      requestDate: '',
      destination: '',
      destinationReason: '',
      documents: [],
    };
    this.uploadedDocuments = [];
  }
}
