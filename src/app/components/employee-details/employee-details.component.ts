import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  output,
} from '@angular/core';
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetails } from '../../dto/employee.dto';
import { PromotionRecord } from '../../dto/promotion.dto';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css',
})
export class EmployeeDetailsComponent implements OnInit {
  openSection: string | null = null;

  @Input() view = false;
  @Input() employee: TableData | null = null;
  @Input() employeeDetails: EmployeeDetails | null = null;
  @Input() promotionData: PromotionRecord | null = null;
  @Input() allPromotions: PromotionRecord[] = [];

  @Output() close = new EventEmitter<void>();

  @Input() showButton: boolean = false;
  @Input() yesButtonText: string = 'Ok';
  @Input() noButtonText: string = 'Close';

  @Output() confirm = new EventEmitter<any>();

  documents: any[] = [];
  pdfModalOpen = false;
  selectedPdfUrl: string | null = null;

  constructor() {}

  ngOnInit() {}

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
}
