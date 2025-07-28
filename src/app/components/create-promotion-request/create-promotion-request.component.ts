import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';
import { EmployeeService } from '../../services/employee.service';
import { AlertService } from '../../services/alert.service';
import { EmployeeDetails } from '../../dto/employee.dto';

interface Employee {
  id: number;
  name: string;
  employeeId: string;
  department?: string;
  currentPosition?: string;
}

interface Position {
  label: string;
  value: string;
}

@Component({
  selector: 'app-create-promotion-request',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmPromptComponent],
  templateUrl: './create-promotion-request.component.html',
})
export class CreatePromotionRequestComponent implements OnInit {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  showConfirmModal: boolean = false;
  showEmployeeDropdown: boolean = false;
  searchingEmployees: boolean = false;

  formData = {
    employeeId: '',
    employeeName: '',
    newPosition: '',
  };

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm: string = '';

  positions: Position[] = [
    { label: 'HOD', value: 'HOD' },
    { label: 'Worker', value: 'WORKER' },
    { label: 'Minister', value: 'MINISTER' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  constructor(
    private employeeService: EmployeeService,
    private alertService: AlertService
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
          this.filteredEmployees = this.employees;
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
      this.filteredEmployees = this.employees.slice(0, 5); // Show first 5 by default
    }
  }

  selectEmployee(employee: Employee) {
    this.formData.employeeId = employee.id.toString();
    this.formData.employeeName = employee.name;
    this.searchTerm = employee.name;
    this.showEmployeeDropdown = false;
  }

  onEmployeeInputBlur() {
    // Delay hiding dropdown to allow click on option
    setTimeout(() => {
      this.showEmployeeDropdown = false;
    }, 200);
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
        newPosition: this.formData.newPosition,
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
    return !!(this.formData.employeeId && this.formData.newPosition);
  }

  private resetForm() {
    this.formData = {
      employeeId: '',
      employeeName: '',
      newPosition: '',
    };
    this.searchTerm = '';
    this.showEmployeeDropdown = false;
  }
}
