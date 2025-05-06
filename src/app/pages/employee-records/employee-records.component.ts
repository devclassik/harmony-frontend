import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterTab, MenuItem, TableComponent, TableHeader } from '../../components/table/table.component';
import { ComponentsModule } from '../../components/components.module';
import { TableData } from '../../interfaces/employee.interface';
import { ConfirmPromptComponent, PromptConfig } from '../../components/confirm-prompt/confirm-prompt.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { AppraisalComponent } from '../../components/appraisal/appraisal.component';
@Component({
  selector: 'app-employee-records',
  imports: [CommonModule, ComponentsModule, TableComponent, ConfirmPromptComponent, SuccessModalComponent, AppraisalComponent],
  templateUrl: './employee-records.component.html',
  styleUrl: './employee-records.component.css'
})
export class EmployeeRecordsComponent {
  showModal: boolean = false;
  successModal: boolean = false;
  showAppraisal: boolean = false;

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' }
  ];


  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      department: 'DSA',
      role: 'Zonal Pastor',
      status: 'Active',
      imageUrl: 'assets/svg/profilePix.svg'
    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      department: 'DSA',
      role: 'Minister',
      status: 'On leave',
      imageUrl: 'assets/svg/profilePix.svg'
    },
  ];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'On leave', value: 'On leave' },
    { label: 'On discipline', value: 'On Discipline' },
    { label: 'Retired', value: 'Retired' }
  ];
  
  filterTabs = [
    { label: 'All', value: '', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' },
    { label: 'Minister', value: 'Minister', icon: 'M5 13l4 4L19 7' },
    { label: 'Zonal Pastor', value: 'Zonal Pastor', icon: 'M5 13l4 4L19 7' },
    { label: 'District Pastor', value: 'District Pastor', icon: 'M5 13l4 4L19 7' },
  ];

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Appraisal', action: 'Appraisal', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Delete', action: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  ];

  selectedFilter: string = '';
  searchValue: string = '';
  selectedStatus: string = '';
  filteredEmployees: TableData[] = this.employees;
  selectedEmployee: TableData | null = null;

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.employees;
    if (this.selectedStatus) {
      filtered = filtered.filter(emp => emp.status === this.selectedStatus);
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(emp => emp.role === this.selectedFilter);
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(search) ||
        emp.id.toLowerCase().includes(search) ||
        (emp.department && emp.department.toLowerCase().includes(search)) ||
        emp.role.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  onMenuAction(event: { action: string, row: TableData }) {
    console.log(event);
    if (event.action === 'Delete') {
      this.selectedEmployee = event.row;
      this.showModal = true;
    }
    if (event.action === 'Appraisal') {
      this.showAppraisalModal();
    }
  }

  deleteEmployee(employee: TableData) {
    console.log(employee);
  }

  promptConfig: PromptConfig = {
    title: 'Delete',
    text: 'Are you sure you want to delete this employee?',
    imageUrl: 'assets/svg/profilePix.svg',
    yesButtonText: 'Yes',
    noButtonText: 'No'
  }

  appraisalPromptConfig: PromptConfig = {
    title: 'Confirm',
    text: 'Are you sure you want to submit this appraisal?',
    imageUrl: 'assets/svg/profilePix.svg',
    yesButtonText: 'Yes',
    noButtonText: 'No'
  }
  
  onModalConfirm(confirmed: boolean) {
    console.log(confirmed);
    this.showModal = false;
    this.successModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }

  showAppraisalModal() {
    this.showAppraisal = true;
  }

  handleAppraisal(form: any) {
    console.log(form);
  }
}
