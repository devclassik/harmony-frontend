import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  output,
} from '@angular/core';
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetails } from '../../dto/employee.dto';
import { PromotionRecord } from '../../dto/promotion.dto';
import { TransferRecord } from '../../dto/transfer.dto';
import { DisciplineRecord } from '../../dto/discipline.dto';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
export class EmployeeDetailsComponent implements OnInit, OnChanges {
  openSection: string | null = null;

  @Input() view = false;
  @Input() employee: TableData | null = null;
  @Input() employeeDetails: EmployeeDetails | null = null;
  @Input() promotionData: PromotionRecord | null = null;
  @Input() allPromotions: PromotionRecord[] = [];
  @Input() transferData: TransferRecord | null = null; // Add input for transfer data
  @Input() allTransfers: TransferRecord[] = []; // Add input for all transfer records
  @Input() transferHistory: TransferRecord[] = []; // Add input for transfer history
  @Input() appraisalData: any[] = []; // Add input for appraisal data
  @Input() disciplineData: DisciplineRecord | null = null; // Add input for discipline data
  @Input() allDisciplines: DisciplineRecord[] = []; // Add input for all discipline records
  @Input() disciplineHistory: DisciplineRecord[] = []; // Add input for discipline history

  @Output() close = new EventEmitter<void>();

  @Input() showButton: boolean = false;
  @Input() yesButtonText: string = 'Ok';
  @Input() noButtonText: string = 'Close';
  @Input() yesButtonDisabled: boolean = false;
  @Input() noButtonDisabled: boolean = false;

  @Output() confirm = new EventEmitter<any>();

  documents: any[] = [];
  pdfModalOpen = false;
  selectedPdfUrl: string | null = null;

  constructor() {}

  ngOnInit() {
    // Removed debug logging
  }

  ngOnChanges(changes: SimpleChanges) {
    // Removed debug logging
  }

  // Helper function to properly format image URLs
  formatImageUrl(url: string | null | undefined): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return 'assets/svg/gender.svg';
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Handle image loading errors
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/svg/gender.svg';
    }
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

  onConfirm(result: boolean) {
    this.confirm.emit(result);
  }

  // Helper function to format position names
  formatPosition(position: string): string {
    return position
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to format criteria names
  formatCriteria(criteria: string): string {
    return criteria
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to format discipline type
  formatDisciplineType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  // Helper function to format duration unit
  formatDurationUnit(unit: string): string {
    return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
  }
}
