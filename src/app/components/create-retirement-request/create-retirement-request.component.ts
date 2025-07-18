import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { EmployeeService } from '../../services/employee.service';
import { AlertService } from '../../services/alert.service';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { EmployeeDetails } from '../../dto/employee.dto';

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  department?: string;
  currentPosition?: string;
}

interface ReplacementEmployee {
  id: number;
  name: string;
  employeeId: string;
  department?: string;
  currentPosition?: string;
}

@Component({
  selector: 'app-create-retirement-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-retirement-request.component.html',
  styleUrl: './create-retirement-request.component.css',
})
export class CreateRetirementRequestComponent implements OnInit {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;
  showEmployeeDropdown: boolean = false;
  showReplacementDropdown: boolean = false;
  searchingEmployees: boolean = false;
  uploadingDocument: boolean = false;

  formData = {
    employeeId: '',
    employeeName: '',
    recommendedReplacement: '',
    replacementName: '',
    requestDate: '',
    destination: '',
    reason: '',
    documents: [] as string[],
  };

  employees: Employee[] = [];
  replacementEmployees: ReplacementEmployee[] = [];
  filteredEmployees: Employee[] = [];
  filteredReplacementEmployees: ReplacementEmployee[] = [];
  searchTerm: string = '';
  replacementSearchTerm: string = '';

  constructor(
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    if (this.show) {
      this.loadEmployees();
    }
  }

  ngOnChanges() {
    if (this.show && this.employees.length === 0) {
      this.loadEmployees();
    }
  }

  loadEmployees() {
    this.searchingEmployees = true;
    this.employeeService.getAllEmployees(1, 50).subscribe({
      next: (response) => {
        if (
          response.status === 'success' &&
          response.data &&
          response.data.data
        ) {
          this.employees = response.data.data.map((emp: EmployeeDetails) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            employeeId: emp.employeeId || emp.id.toString(),
            department: emp.departments?.[0]?.name || 'N/A',
            currentPosition: emp.user?.role?.name || 'N/A',
          }));
          this.replacementEmployees = [...this.employees];
          this.filteredEmployees = this.employees;
          this.filteredReplacementEmployees = this.replacementEmployees;
        }
        this.searchingEmployees = false;
      },
      error: (error) => {
        this.alertService.error('Failed to load employees');
        this.searchingEmployees = false;
      },
    });
  }

  onEmployeeSearch(event: any) {
    this.searchTerm = event.target.value;
    this.showEmployeeDropdown = true;

    if (this.searchTerm.length > 0) {
      this.filteredEmployees = this.employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredEmployees = this.employees.slice(0, 5);
    }
  }

  onReplacementSearch(event: any) {
    this.replacementSearchTerm = event.target.value;
    this.showReplacementDropdown = true;

    if (this.replacementSearchTerm.length > 0) {
      this.filteredReplacementEmployees = this.replacementEmployees.filter(
        (emp) =>
          emp.name
            .toLowerCase()
            .includes(this.replacementSearchTerm.toLowerCase()) ||
          emp.employeeId
            .toLowerCase()
            .includes(this.replacementSearchTerm.toLowerCase())
      );
    } else {
      this.filteredReplacementEmployees = this.replacementEmployees.slice(0, 5);
    }
  }

  selectEmployee(employee: Employee) {
    this.formData.employeeId = employee.id.toString();
    this.formData.employeeName = employee.name;
    this.searchTerm = employee.name;
    this.showEmployeeDropdown = false;
  }

  selectReplacementEmployee(employee: ReplacementEmployee) {
    this.formData.recommendedReplacement = employee.id.toString();
    this.formData.replacementName = employee.name;
    this.replacementSearchTerm = employee.name;
    this.showReplacementDropdown = false;
  }

  onEmployeeInputBlur() {
    setTimeout(() => {
      this.showEmployeeDropdown = false;
    }, 200);
  }

  onReplacementInputBlur() {
    setTimeout(() => {
      this.showReplacementDropdown = false;
    }, 200);
  }

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    files.forEach((file) => {
      this.uploadDocument(file);
    });
  }

  uploadDocument(file: File) {
    this.uploadingDocument = true;
    this.fileUploadService.uploadSingleFileWithProgress(file).subscribe({
      next: (response) => {
        if (
          response.response &&
          response.response.status === 'success' &&
          response.response.file
        ) {
          this.formData.documents.push(response.response.file);
          this.alertService.success('Document uploaded successfully');
        } else {
          this.alertService.error('Failed to upload document');
        }
        this.uploadingDocument = false;
      },
      error: (error) => {
        console.error('Error uploading document:', error);
        this.alertService.error('Failed to upload document');
        this.uploadingDocument = false;
      },
    });
  }

  removeDocument(index: number) {
    this.formData.documents.splice(index, 1);
  }

  onCancel() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.showConfirmModal = true;
    }
  }

  onConfirmSubmit(confirmed: boolean) {
    if (confirmed) {
      const submitData = {
        employeeId: parseInt(this.formData.employeeId),
        recommendedReplacement: parseInt(this.formData.recommendedReplacement),
        reason: this.formData.reason,
        documents: this.formData.documents,
      };
      this.submitted.emit(submitData);
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
      this.formData.employeeId &&
      this.formData.recommendedReplacement &&
      this.formData.reason
    );
  }

  private resetForm() {
    this.formData = {
      employeeId: '',
      employeeName: '',
      recommendedReplacement: '',
      replacementName: '',
      requestDate: '',
      destination: '',
      reason: '',
      documents: [],
    };
    this.searchTerm = '';
    this.replacementSearchTerm = '';
    this.showEmployeeDropdown = false;
    this.showReplacementDropdown = false;
  }
}
