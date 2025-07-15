import { Component } from '@angular/core';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { SubstitutionComponent } from '../../components/substitution/substitution.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { TableData } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-payroll',
  imports: [
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    SubstitutionComponent,
    SuccessModalComponent,
  ],
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.css',
})
export class PayrollComponent {
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
  showSubstitution: boolean = false;
  showFilterTabFromParent: boolean = false;

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      startDate: '02-04-2025',
      endDate: '05-04-2025',
      status: 'Approved',
      imageUrl: 'assets/svg/profilePix.svg',
    },
    {
      id: '124 - 01',
      name: 'John Adegoke',
      startDate: '02-01-2025',
      endDate: '01-02-2025',
      status: 'Pending',
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
    { label: 'Weekly', value: 'Weekly', icon: 'M5 13l4 4L19 7' },
    { label: 'Monthly', value: 'Monthly', icon: 'M5 13l4 4L19 7' },
    {
      label: 'Yearly',
      value: 'Yearly',
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
          employee.name?.toLowerCase().includes(search) ||
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
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this promotion request',
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
    // this.successModal = true;
    confirmed ? this.onSubstitutionModalEvent() : '';
  }

  onSubstitutionModalEvent() {
    this.showSubstitution = this.showSubstitution ? false : true;
  }

  onModalClose() {
    this.showModal = false;
  }

  handleSubstitution(form: any) {
    console.log(form);
    this.promptConfig = {
      title: 'Confirm',
      text: 'Are you sure you want to submit this appraisal?',
      yesButtonText: 'Yes',
      noButtonText: 'No',
    };
    this.showModal = true;
  }

  onShowListClick(event: string) {
    event === 'list'
      ? (this.showFilterTabFromParent = false)
      : (this.showFilterTabFromParent = true);
  }
}
