import { Component } from '@angular/core';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { CommonModule } from '@angular/common';
import { TableData } from '../../interfaces/employee.interface';
import { PromptConfig } from '../../components/confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-employee-promotion',
  imports: [CommonModule, CommonModule, TableComponent],
  templateUrl: './employee-promotion.component.html',
  styleUrl: './employee-promotion.component.css',
})
export class EmployeePromotionComponent {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'PROMOTION ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'NEW ROLE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      department: 'DSA',
      role: 'Zonal Pastor',
      status: 'Active',
      imageUrl: 'assets/svg/profilePix.svg',
    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      department: 'DSA',
      role: 'Minister',
      status: 'On leave',
      imageUrl: 'assets/svg/profilePix.svg',
    },
  ];

  filteredEmployees: TableData[] = this.employees;

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

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

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
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
          (employee.department &&
            employee.department.toLowerCase().includes(search)) ||
          employee.role.toLowerCase().includes(search)
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

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];
  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }
}
