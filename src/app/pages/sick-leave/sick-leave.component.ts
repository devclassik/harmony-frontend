import { Component } from '@angular/core';
import { SuccessModalComponent } from "../../components/success-modal/success-modal.component";
import { ConfirmPromptComponent, PromptConfig } from "../../components/confirm-prompt/confirm-prompt.component";
import { EmployeeDetailsComponent } from "../../components/employee-details/employee-details.component";
import { FilterTab, MenuItem, TableComponent, TableHeader } from "../../components/table/table.component";
import { TableData } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-sick-leave',
  imports: [SuccessModalComponent, ConfirmPromptComponent, EmployeeDetailsComponent, TableComponent],
  templateUrl: './sick-leave.component.html',
  styleUrl: './sick-leave.component.css'
})
export class SickLeaveComponent {
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
      { key: 'id', label: 'LEAVE ID' },
      { key: 'name', label: 'EMPLOYEE NAME' },
      { key: 'startDate', label: 'START DATE' },
      { key: 'duration', label: 'DURATION' },
      { key: 'status', label: 'STATUS' },
      { key: 'action', label: 'ACTION' },
    ];
  
    employees: TableData[] = [
      {
        id: '124 - 08',
        name: 'John Adegoke',
        startDate: '06/5/2025',
        duration: '2 weeks',
        status: 'Approved',
        imageUrl: 'assets/svg/profilePix.svg',
      },
      {
        id: '124 - 01',
        name: 'John Adegoke',
        startDate: '06/3/2025',
        duration: '1 month',
        status: 'Rejected',
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
      { label: 'Sabbatical', value: 'Sabbatical', icon: 'M5 13l4 4L19 7' },
      { label: 'Personal', value: 'Personal', icon: 'M5 13l4 4L19 7' },
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
            employee?.name?.toLowerCase().includes(search) ||
            employee.id.toLowerCase().includes(search) ||
            (employee.department &&
              employee.department.toLowerCase().includes(search)) ||
            employee.role?.toLowerCase().includes(search)
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
  
    onModalConfirm(confirmed: boolean) {
      console.log(confirmed);
      this.showModal = false;
      this.showAppraisal = false;
      this.successModal = true;
    }
  
    onModalClose() {
      this.showModal = false;
    }

}
