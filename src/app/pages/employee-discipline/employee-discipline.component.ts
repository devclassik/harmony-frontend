import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { MenuItem, TableComponent, TableHeader } from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { PromptConfig } from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';

@Component({
  selector: 'app-employee-discipline',
  imports: [CommonModule, ComponentsModule, TableComponent, EmployeeDetailsComponent],
  templateUrl: './employee-discipline.component.html',
  styleUrl: './employee-discipline.component.css'
})
export class EmployeeDisciplineComponent {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAppraisal: boolean = false;

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'DISCIPLINE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'disciplineType', label: 'TYPE OF DISCIPLINE' },
    { key: 'offenseCategory', label: 'CATEGORY OF OFFENSE' },
    { key: 'disciplineDuration', label: 'DURATION OF DISCIPLINE' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      disciplineType: 'Suspension',
      offenseCategory: 'lorem',
      disciplineDuration: '2 Days',
      imageUrl: 'assets/svg/profilePix.svg',

    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      disciplineType: 'Warning',
      offenseCategory: 'Minister',
      disciplineDuration: 'Rejected',
      imageUrl: 'assets/svg/profilePix.svg',

    },
  ];

  filteredEmployees: TableData[] = this.employees;

  filterTabs = [
    {
      label: 'All',
      value: '',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    },
    { label: 'Minister', value: 'Minister', icon: 'M5 13l4 4L19 7' },
    { label: 'Zonal Pastor', value: 'Zonal Pastor', icon: 'M5 13l4 4L19 7' },
    {
      label: 'District Pastor',
      value: 'District Pastor',
      icon: 'M5 13l4 4L19 7',
    },
  ];

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.employees;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (employee) => employee.status === this.selectedStatus
      );
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (employee) => employee.role === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.name.toLowerCase().includes(search) ||
        employee.id.toLowerCase().includes(search) ||
        (employee.disciplineType &&
          employee.disciplineType.toLowerCase().includes(search)) ||
          employee.disciplineDuration?.toLowerCase().includes(search) ||
          employee.offenseCategory?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      this.showEmployeeDetailsModal();
      this.selectedEmployeeRecord = event.row;
    }
  }

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  actionToPerform(result: boolean) {
    if (result) {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to approve this promotion request',
        imageUrl: 'assets/svg/profilePix.svg',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this promotion request',
        imageUrl: 'assets/svg/profilePix.svg',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }
}
