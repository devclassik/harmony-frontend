import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { FilterTab, MenuItem, TableComponent, TableHeader } from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { ConfirmPromptComponent, PromptConfig } from '../../components/confirm-prompt/confirm-prompt.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';

@Component({
  selector: 'app-employee-transfer',
  imports: [CommonModule, ComponentsModule, TableComponent, EmployeeDetailsComponent, ConfirmPromptComponent, SuccessModalComponent],
  templateUrl: './employee-transfer.component.html',
  styleUrl: './employee-transfer.component.css'
})
export class EmployeeTransferComponent {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  selectedEmployeeRecord: TableData | null = null;
  showModal: boolean = false;
  showEmployeeDetails: boolean = false;
  successModal: boolean = false;
  showAppraisal: boolean = false;
  promptConfig: PromptConfig | null = null;



  tableHeader: TableHeader[] = [
    { key: 'id', label: 'DISCIPLINE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'transferType', label: 'TRANSFER TYPE' },
    { key: 'destination', label: 'DESTINATION' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      transferType: 'Department',
      destination: 'Ikeja',
      status: 'Pending',
      imageUrl: 'assets/svg/profilePix.svg',

    },
    {
      id: '124 - 01',
      name: 'John Adeyemi',
      transferType: 'location',
      destination: 'Technical Team',
      status: 'Approved',
      imageUrl: 'assets/svg/profilePix.svg',

    },
  ];

  statusTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  filteredEmployees: TableData[] = this.employees;

  filterTabs = [
    {
      label: 'All',
      value: '',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    },
    { label: 'Department', value: 'Department', icon: 'M5 13l4 4L19 7' },
    { label: 'Location', value: 'Location', icon: 'M5 13l4 4L19 7' },

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
          employee.name?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          (employee.transferType &&
            employee.transferType.toLowerCase().includes(search)) ||
          employee.destination?.toLowerCase().includes(search) ||
          employee.status?.toLowerCase().includes(search)
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
  
  onModalConfirm(confirmed: boolean) {
    console.log(confirmed);
    this.showModal = false;
    this.showAppraisal = false;
    this.successModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }

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
