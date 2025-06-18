import { CommonModule } from '@angular/common';
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
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { TableData } from '../../interfaces/employee.interface';
import { SubstitutionComponent } from '../../components/substitution/substitution.component';
import { AuthService } from '../../services/auth.service';
import { AnnualLeaveDetailsComponent } from '../../components/annual-leave-details/annual-leave-details.component';
import { CreateLeaveRequestComponent } from '../../components/create-leave-request/create-leave-request.component';

@Component({
  selector: 'app-annual-leave',
  imports: [
    CommonModule,
    TableComponent,
    EmployeeDetailsComponent,
    ConfirmPromptComponent,
    SuccessModalComponent,
    SubstitutionComponent,
    AnnualLeaveDetailsComponent,
    CreateLeaveRequestComponent,
  ],
  templateUrl: './annual-leave.component.html',
  styleUrl: './annual-leave.component.css',
})
export class AnnualLeaveComponent {
  userRole: string | null;
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAnnualLeaveDetails: boolean = false;
  selectedLeaveData: TableData | null = null;
  showCreateLeaveRequest: boolean = false;
  showAppraisal: boolean = false;
  showSubstitution: boolean = false;
  showFilterTabFromParent: boolean = false;

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  leaveRequestsHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
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

  leaveRequests: TableData[] = [
    {
      id: 'LR-001',
      startDate: '2024-01-15',
      endDate: '2024-01-25',
      status: 'Approved',
    },
    {
      id: 'LR-002',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      status: 'Pending',
    },
    {
      id: 'LR-003',
      startDate: '2024-03-05',
      endDate: '2024-03-08',
      status: 'Rejected',
    },
    {
      id: 'LR-004',
      startDate: '2024-04-01',
      endDate: '2024-06-01',
      status: 'Approved',
    },
    {
      id: 'LR-005',
      startDate: '2024-02-28',
      endDate: '2024-03-01',
      status: 'Pending',
    },
  ];

  filteredEmployees: TableData[] = this.employees;
  filteredLeaveRequests: TableData[] = this.leaveRequests;

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

    // Apply filters to leave requests as well
    this.applyLeaveFilters();
  }

  applyLeaveFilters() {
    let filtered = this.leaveRequests;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (request) => request.status === this.selectedStatus
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(search) ||
          request.startDate?.toLowerCase().includes(search) ||
          request.endDate?.toLowerCase().includes(search)
      );
    }
    this.filteredLeaveRequests = filtered;
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      this.showAnnualLeaveDetailsModal();
      this.selectedLeaveData = event.row;
    }
  }

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  showAnnualLeaveDetailsModal() {
    this.showAnnualLeaveDetails = true;
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
      imageUrl: 'assets/svg/profilePix.svg',
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

  onCreateLeaveRequest() {
    this.showCreateLeaveRequest = true;
  }

  onCreateLeaveRequestSubmitted(formData: any) {
    // Add the new leave request to the data
    const newRequest: TableData = {
      id: `LR-${String(this.leaveRequests.length + 1).padStart(3, '0')}`,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'Pending' as const,
    };
    this.leaveRequests.push(newRequest);
    this.applyLeaveFilters(); // Refresh the filtered data

    // Show success message
    this.successModal = true;
  }
}
