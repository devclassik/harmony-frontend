import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, output } from '@angular/core';
import { TableData } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent implements OnInit {
  openSection: string | null = null;
  @Input() view = false;
  @Input() employee: TableData  | null = null;
  @Output() close = new EventEmitter<void>();
  @Input() showButton: boolean = false;
  @Input() yesButtonText: string= 'Ok';
  @Input() noButtonText: string= 'Close'

  @Output() confirm = new EventEmitter<any>();

  documents: any[] = [];
  pdfModalOpen = false;
  selectedPdfUrl: string | null = null;

  constructor() {}

  ngOnInit() {

  }

  openPdfModal(url: string) {
    this.selectedPdfUrl = url;
    this.pdfModalOpen = true;
  }

  closePdfModal() {
    this.pdfModalOpen = false;
    this.selectedPdfUrl = null;
  }

  onClose() {
   this.close.emit();
  }

  onConfirm(result: boolean){
    this.confirm.emit(result);
  }
}
