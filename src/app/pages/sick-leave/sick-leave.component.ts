import { Component, OnInit } from '@angular/core';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import {
  FilterTab,
  MenuItem,
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import {
  LeaveService,
  CreateSickLeaveRequest,
} from '../../services/leave.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { AlertService } from '../../services/alert.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sick-leave',
  imports: [
    SuccessModalComponent,
    ConfirmPromptComponent,
    EmployeeDetailsComponent,
    TableComponent,
    CommonModule,
    LeaveDetailsComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './sick-leave.component.html',
  styleUrl: './sick-leave.component.css',
})
export class SickLeaveComponent implements OnInit {
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
  showAppraisal: boolean = false;
  showFilterTabFromParent: boolean = false;
  showCreateRequest = false;
  showSickLeaveDetails: boolean = false;
  selectedSickLeaveData: any = null;
  isLoading: boolean = false;
  isCreating: boolean = false;
  currentUserId: number | null = null;
  leaveDetailsMode: 'view' | 'create' = 'view';

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private alertService: AlertService
  ) {
    this.userRole = this.authService.getWorkerRole();
    this.currentUserId = this.authService.getCurrentEmployeeId();
  }

  ngOnInit(): void {
    this.loadSickLeaves();
  }

  loadSickLeaves(): void {
    this.isLoading = true;
    this.leaveService
      .getSickLeaves()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          const allSickLeaves = response.data;

          // Filter leaves based on user role
          if (this.userRole?.toLowerCase() === 'worker' && this.currentUserId) {
            // Workers see only their own sick leaves
            this.sickLeaveRequests = this.transformToTableData(
              this.leaveService.filterLeavesByEmployee(
                allSickLeaves,
                this.currentUserId
              )
            );
          } else {
            // Admins see all sick leaves
            this.employees = this.transformToTableData(allSickLeaves);
          }

          this.applyFilters();
          this.applySickLeaveFilters();
        },
        error: (error) => {
          console.error('Error loading sick leaves:', error);
          // You might want to show an error message to the user
        },
      });
  }

  transformToTableData(leaves: any[]): TableData[] {
    return leaves.map((leave) => {
      // Calculate end date
      const startDate = new Date(leave.startDate);
      const endDate = new Date(startDate);

      if (leave.durationUnit === 'Days') {
        endDate.setDate(startDate.getDate() + leave.duration - 1);
      } else if (leave.durationUnit === 'Weeks') {
        endDate.setDate(startDate.getDate() + leave.duration * 7 - 1);
      } else if (leave.durationUnit === 'Months') {
        endDate.setMonth(startDate.getMonth() + leave.duration);
        endDate.setDate(endDate.getDate() - 1);
      }

      return {
        id: leave.id.toString(),
        name: leave.employee
          ? `${leave.employee.firstName} ${leave.employee.lastName}`
          : 'N/A',
        startDate: leave.startDate,
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        duration: `${leave.duration} ${leave.durationUnit}`,
        status: this.transformStatus(leave.status) as any,
        requestType: leave.type,
        substitution: 'N/A', // This would come from API if available
        imageUrl: this.formatImageUrl(leave.employee?.photoUrl),
        // Additional data for details view
        reason: leave.reason,
        location: leave.location,
        leaveNotesUrls: leave.leaveNotesUrls || [],
        employeeId: leave.employee?.employeeId,
        // Store original data for detail view
        originalData: leave,
      };
    });
  }

  // Helper function to properly format image URLs
  formatImageUrl(url: string | null): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return 'assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Transform status from API format to display format
  transformStatus(status: string): string {
    if (!status) return 'Unknown';

    // Convert from API format (PENDING, APPROVED, REJECTED) to display format
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        // Capitalize first letter for any other status
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  }

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'duration', label: 'DURATION' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  sickLeaveRequestsHeader: TableHeader[] = [
    { key: 'id', label: 'LEAVE ID' },
    { key: 'startDate', label: 'START DATE' },
    { key: 'endDate', label: 'END DATE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  employees: TableData[] = [];
  sickLeaveRequests: TableData[] = [];

  filteredEmployees: TableData[] = [];
  filteredSickLeaveRequests: TableData[] = [];

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
    this.applySickLeaveFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
    this.applySickLeaveFilters();
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
    this.applySickLeaveFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      if (this.userRole?.toLowerCase() === 'worker') {
        this.showSickLeaveDetailsModal();

        // Get the original API data and transform it for the leave-details component
        const originalData = (event.row as any).originalData;
        if (originalData) {
          // Get all leave records from the current data to calculate balance and history
          const allUserLeaves = this.sickLeaveRequests
            .map((req) => (req as any).originalData)
            .filter(Boolean);
          this.selectedSickLeaveData =
            this.leaveService.transformForLeaveDetails(
              originalData,
              allUserLeaves
            );
        } else {
          // Fallback to the table data if originalData is not available
          this.selectedSickLeaveData = event.row;
        }
      } else {
        this.showEmployeeDetailsModal();
        this.selectedEmployeeRecord = event.row;
      }
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

  showSickLeaveDetailsModal() {
    this.leaveDetailsMode = 'view';
    this.showSickLeaveDetails = true;
  }

  openCreateRequest() {
    this.leaveDetailsMode = 'create';
    this.selectedSickLeaveData = null; // Clear any existing data
    this.showCreateRequest = true;
  }

  onCloseCreateSickLeaveRequest() {
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';
  }

  onCloseSickLeaveDetails() {
    this.showSickLeaveDetails = false;
    this.leaveDetailsMode = 'view';
  }

  onCreateRequestSubmitted(formData: any) {
    console.log('Sick Leave request submitted:', formData);

    if (!this.currentUserId) {
      this.alertService.error(
        'Unable to determine employee ID. Please try logging in again.'
      );
      return;
    }

    // Show loading overlay and close slide panel immediately (like leave of absence)
    this.isCreating = true;
    this.showCreateRequest = false;
    this.leaveDetailsMode = 'view';

    const sickLeaveRequest: CreateSickLeaveRequest = {
      startDate: formData.startDate,
      duration: formData.duration, // This is already calculated in days
      durationUnit: 'DAYS', // Always use DAYS since duration is calculated in days
      reason: formData.reason,
      location: formData.location || 'Remote',
      leaveNotesUrls: formData.leaveNotesUrls || [],
      employeeId: this.currentUserId,
    };

    this.leaveService
      .createSickLeave(sickLeaveRequest)
      .pipe(
        finalize(() => {
          this.isCreating = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Sick leave created successfully:', response);
          if (response.status === 'success') {
            // Show success alert
            this.alertService.success(
              'Sick leave request created successfully!'
            );

            // Reload sick leaves to show the new request
            this.loadSickLeaves();
          }
        },
        error: (error) => {
          console.error('Error creating sick leave:', error);
          this.alertService.error(
            'Failed to create sick leave request. Please try again.'
          );
        },
      });
  }

  applySickLeaveFilters() {
    let filtered = this.sickLeaveRequests;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (request) => request.status === this.selectedStatus
      );
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (request) => request.requestType === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.id.toLowerCase().includes(search) ||
          request.requestType?.toLowerCase().includes(search) ||
          request.startDate?.toLowerCase().includes(search) ||
          request.endDate?.toLowerCase().includes(search)
      );
    }
    this.filteredSickLeaveRequests = filtered;
  }
}
