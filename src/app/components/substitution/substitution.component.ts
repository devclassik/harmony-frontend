import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-substitution',
  imports: [CommonModule, FormsModule],
  templateUrl: './substitution.component.html',
  styleUrl: './substitution.component.css',
})
export class SubstitutionComponent implements OnInit {
  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  searchTerm = '';
  dropdownOpen = false;
  selectedEmployee: EmployeeDetails | null = null;
  filteredEmployees: EmployeeDetails[] = [];
  searchingEmployees = false;
  private subscriptions: Subscription[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    // Initialize with empty filtered list
    this.filteredEmployees = [];
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onSearch(term: string) {
    this.searchTerm = term;

    // Only search if term is at least 3 characters
    if (term.length < 3) {
      this.filteredEmployees = [];
      this.dropdownOpen = false;
      return;
    }

    this.searchingEmployees = true;
    this.dropdownOpen = true;

    const searchSub = this.employeeService
      .searchEmployeesByName(term)
      .subscribe({
        next: (response) => {
          this.searchingEmployees = false;
          if (response.status === 'success' && response.data) {
            this.filteredEmployees = response.data;
          } else {
            this.filteredEmployees = [];
          }
        },
        error: (error) => {
          console.error('Error searching employees:', error);
          this.searchingEmployees = false;
          this.filteredEmployees = [];
        },
      });

    this.subscriptions.push(searchSub);
  }

  onEmployeeInputBlur() {
    // Delay closing dropdown to allow for click events
    setTimeout(() => {
      this.dropdownOpen = false;
    }, 200);
  }

  selectEmployee(employee: EmployeeDetails) {
    this.selectedEmployee = employee;
    this.searchTerm = `${employee.firstName} ${employee.lastName}`;
    this.dropdownOpen = false;
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownOpen &&
      this.dropdownWrapper &&
      !this.dropdownWrapper.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }

  onClose() {
    this.closed.emit();
  }

  onSubmit() {
    if (this.selectedEmployee) {
      this.submitted.emit({
        employeeId: this.selectedEmployee.id,
        employeeName: `${this.selectedEmployee.firstName} ${this.selectedEmployee.lastName}`,
        employeeIdNumber: this.selectedEmployee.employeeId,
      });
    }
  }

  // Handle Enter key press for search
  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch(this.searchTerm);
    }
  }
}
