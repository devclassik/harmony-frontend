import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
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
import { RetirementRecord } from '../../dto/retirement.dto';
import { RetrenchmentRecord } from '../../dto/retrenchment.dto';
import { Employee } from '../../dto';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, MatIconModule],
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
  @Input() retirementData: RetirementRecord | null = null; // Add input for retirement data
  @Input() allRetirements: RetirementRecord[] = []; // Add input for all retirement records
  @Input() retrenchmentData: RetrenchmentRecord | null = null; // Add input for retrenchment data
  @Input() allRetrenchments: RetrenchmentRecord[] = []; // Add input for all retrenchment records
  @Input() leaveData: any = null; // Add input for leave data
  @Input() allLeaves: any[] = []; // Add input for all leave records
  @Input() leaveHistory: any[] = []; // Add input for leave history
  @Input() leaveType: string = 'Annual Leave'; // Add input for leave type

  // Leave of Absence specific inputs
  @Input() absenceData: any = null; // Add input for leave of absence data
  @Input() allAbsences: any[] = []; // Add input for all absence records
  @Input() absenceHistory: any[] = []; // Add input for absence history

  // Sick Leave specific inputs
  @Input() sickData: any = null; // Add input for sick leave data
  @Input() allSickLeaves: any[] = []; // Add input for all sick leave records
  @Input() sickHistory: any[] = []; // Add input for sick leave history

  // Team Members specific inputs
  @Input() teamMembers: any[] | null = null; // Add input for team members
  @Input() departmentName: string = ''; // Add input for department name

  // User Management specific input
  @Input() showOnlyContactInfo: boolean = false; // Show only contact info for user management

  // Permission View specific inputs
  @Input() isPermissionView: boolean = false; // Show permission view
  @Input() permissionData: any = null; // Permission data for access control
  @Input() isAccommodationView: boolean = false; // Show accommodation view
  @Input() accommodationData: any = null; // Accommodation data for accommodation management
  @Input() isTemplateView: boolean = false; // Show template view
  @Input() templateData: any = null; // Template data for template management

  // Permission editing properties
  isEditingPermissions: boolean = false;
  editedPermissionData: any = null;

  @Output() close = new EventEmitter<void>();

  @Input() showButton: boolean = false;
  @Input() yesButtonText: string = 'Ok';
  @Input() noButtonText: string = 'Close';
  @Input() yesButtonDisabled: boolean = false;
  @Input() noButtonDisabled: boolean = false;

  @Output() confirm = new EventEmitter<any>();

  // User Management specific inputs for edit and delete
  @Input() showEditDeleteButtons: boolean = false;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  documents: any[] = [];
  pdfModalOpen = false;
  selectedPdfUrl: string | null = null;

  constructor(private apiService: ApiService) {}

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

  // Helper methods for team members
  getEmployeeFullName(employee: any): string {
    if (!employee) return 'Unknown';
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  }

  hasValidPhotoUrl(employee: any): boolean {
    return employee && employee.photoUrl && employee.photoUrl.trim() !== '';
  }

  // Get default image based on gender
  getDefaultImage(employee: any): string {
    if (!employee || !employee.gender) {
      return 'assets/svg/male.svg'; // Default to male if no gender specified
    }

    const gender = employee.gender.toLowerCase();
    if (gender === 'female' || gender === 'f') {
      return 'assets/svg/female.svg';
    } else {
      return 'assets/svg/male.svg';
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

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  // Permission editing methods
  onEditPermissions() {
    this.isEditingPermissions = true;
    // Create a deep copy of permission data for editing
    this.editedPermissionData = JSON.parse(JSON.stringify(this.permissionData));
  }

  onCancelEditPermissions() {
    this.isEditingPermissions = false;
    this.editedPermissionData = null;
  }

  onSavePermissions() {
    // Emit the edited permission data for confirmation
    this.edit.emit(this.editedPermissionData);
    this.isEditingPermissions = false;
    this.editedPermissionData = null;
  }

  onPermissionChange(permission: any, action: string) {
    if (action === 'create') {
      permission.canCreate = !permission.canCreate;
    } else if (action === 'view') {
      permission.canView = !permission.canView;
    } else if (action === 'edit') {
      permission.canEdit = !permission.canEdit;
    } else if (action === 'delete') {
      permission.canDelete = !permission.canDelete;
    }
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

  // Helper function to format transfer type
  formatTransferType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to format retrenchment type
  formatRetrenchmentType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to format template type
  formatTemplateType(type: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' ');
  }
}
