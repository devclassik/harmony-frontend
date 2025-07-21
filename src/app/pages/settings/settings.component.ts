import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

// Components
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { ConfirmPromptComponent } from '../../components/confirm-prompt/confirm-prompt.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';

// Interfaces
import { TableData } from '../../interfaces/employee.interface';
import { EmployeeDetails } from '../../dto/employee.dto';

interface Organization {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  departments: Department[];
  headDepartment: Department;
}

interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members: Employee[];
  hod?: Employee;
  organization?: { id: number };
}

interface Employee {
  id: number;
  employeeId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string | null;
  profferedName: string | null;
  primaryPhone: string | null;
  primaryPhoneType: string | null;
  altPhone: string | null;
  altPhoneType: string | null;
  dob: string | null;
  maritalStatus: string | null;
  everDivorced: boolean;
  beenConvicted: boolean;
  hasQuestionableBackground: boolean;
  hasBeenInvestigatedForMisconductOrAbuse: boolean;
  photoUrl: string | null;
  altEmail: string | null;
  employeeStatus: string | null;
  employmentType: string | null;
  serviceStartDate: string | null;
  retiredDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  nationIdNumber: string | null;
}

interface CreateDepartmentRequest {
  name: string;
  organizationId: number;
}

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    LoadingOverlayComponent,
    ConfirmPromptComponent,
    EmployeeDetailsComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
  // Tab management
  activeTab: string = 'organization-structure';

  // Organization data
  organizations: Organization[] = [];
  isLoading = false;

  // Create department modal
  showCreateDepartmentModal = false;
  isCreatingDepartment = false;
  showConfirmPrompt = false;

  // View team modal (using employee-details pattern)
  showTeamDetails = false;
  selectedTeamData: TableData | null = null;
  selectedTeamDepartment: Department | null = null;

  // Form data for new department
  newDepartment = {
    name: '',
    organizationId: null as number | null,
  };

  // Removed HOD selection - using default values

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // User role for permissions
  userRole: string | null;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getWorkerRole();
  }

  ngOnInit() {
    this.loadOrganizationStructure();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Tab switching
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // Load organization structure from API
  loadOrganizationStructure() {
    this.isLoading = true;

    const sub = this.apiService
      .get('/organization')
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            this.organizations = response.data;

            // Debug: Log the organization data to see what we're getting
            console.log('Organization data:', this.organizations);
            console.log(
              'All departments before deduplication:',
              this.organizations.flatMap((org) => org.departments || [])
            );
            console.log(
              'Unique departments after deduplication:',
              this.getAllDepartments()
            );
            console.log('Director:', this.getDirector());

            // Set the first organization as default for new departments
            if (this.organizations.length > 0) {
              this.newDepartment.organizationId = this.organizations[0].id;
            }
          }
        },
        error: (error) => {
          console.error('Error loading organization structure:', error);
          this.alertService.error(
            'Failed to load organization structure. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Removed loadAvailableHODs - no longer needed

  // Open create department modal
  openCreateDepartmentModal() {
    this.showCreateDepartmentModal = true;
    this.resetNewDepartmentForm();
  }

  // Close create department modal
  closeCreateDepartmentModal() {
    this.showCreateDepartmentModal = false;
    this.resetNewDepartmentForm();
  }

  // Open view team details
  openViewTeamModal(department: Department) {
    // Create a table data object for the employee-details component
    this.selectedTeamData = {
      id: department.hod?.employeeId || department.hod?.id?.toString() || '',
      name: department.hod
        ? this.getEmployeeFullName(department.hod)
        : 'No HOD Assigned',
      department: department.name,
      role: department.hod?.title || 'Head of Department',
      status: 'Active',
      imageUrl: this.formatImageUrl(department.hod?.photoUrl || null),
    };
    this.selectedTeamDepartment = department;
    this.showTeamDetails = true;
  }

  // Close view team details
  closeViewTeamModal() {
    this.showTeamDetails = false;
    this.selectedTeamData = null;
    this.selectedTeamDepartment = null;
  }

  // Create employee details object for the accordion component
  createEmployeeDetailsFromDepartment(
    department: Department | null
  ): EmployeeDetails | null {
    if (!department?.hod) return null;

    const hod = department.hod;
    return {
      id: hod.id,
      employeeId: hod.employeeId,
      title: hod.title,
      firstName: hod.firstName,
      lastName: hod.lastName,
      middleName: hod.middleName,
      gender: hod.gender,
      profferedName: hod.profferedName,
      primaryPhone: hod.primaryPhone,
      primaryPhoneType: hod.primaryPhoneType,
      altPhone: hod.altPhone,
      altPhoneType: hod.altPhoneType,
      dob: hod.dob,
      maritalStatus: hod.maritalStatus,
      everDivorced: hod.everDivorced,
      beenConvicted: hod.beenConvicted,
      hasQuestionableBackground: hod.hasQuestionableBackground,
      hasBeenInvestigatedForMisconductOrAbuse:
        hod.hasBeenInvestigatedForMisconductOrAbuse,
      photoUrl: hod.photoUrl,
      altEmail: hod.altEmail,
      employeeStatus: hod.employeeStatus,
      employmentType: hod.employmentType,
      serviceStartDate: hod.serviceStartDate,
      retiredDate: hod.retiredDate,
      createdAt: hod.createdAt,
      updatedAt: hod.updatedAt,
      deletedAt: hod.deletedAt,
      nationIdNumber: hod.nationIdNumber,
      departments: [department],
      user: null, // Will be filled in if needed
      spouse: null, // Will be filled in if needed
      homeAddress: null, // Will be filled in if needed
      teamMembers: department.members, // Add team members for the accordion
      departmentName: department.name, // Add department name for the accordion
    } as any;
  }

  // Reset new department form
  resetNewDepartmentForm() {
    this.newDepartment = {
      name: '',
      organizationId:
        this.organizations.length > 0 ? this.organizations[0].id : null,
    };
  }

  // Submit create department (shows confirm prompt)
  submitCreateDepartment() {
    if (!this.newDepartment.name) {
      this.alertService.error('Please enter a department name.');
      return;
    }

    // Set organizationId from the first organization (Director's organization)
    this.newDepartment.organizationId = this.organizations[0]?.id || null;

    if (!this.newDepartment.organizationId) {
      this.alertService.error('No organization found. Please try again.');
      return;
    }

    this.showConfirmPrompt = true;
  }

  // Handle confirm create
  onConfirmCreate() {
    this.showConfirmPrompt = false;
    this.createDepartment();
  }

  // Handle cancel create
  onCancelCreate() {
    this.showConfirmPrompt = false;
  }

  // Create new department
  createDepartment() {
    this.isCreatingDepartment = true;

    const request: CreateDepartmentRequest = {
      name: this.newDepartment.name,
      organizationId: this.newDepartment.organizationId!,
    };

    console.log('Creating department with request:', request);

    const sub = this.apiService
      .post('/department', request)
      .pipe(finalize(() => (this.isCreatingDepartment = false)))
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.alertService.success(
              `Department "${this.newDepartment.name}" created successfully!`
            );
            this.closeCreateDepartmentModal();
            this.loadOrganizationStructure(); // Reload to show new department
          } else {
            this.alertService.error(
              response.message ||
                'Failed to create department. Please try again.'
            );
          }
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.alertService.error(
            error.error?.message ||
              'Failed to create department. Please try again.'
          );
        },
      });

    this.subscriptions.push(sub);
  }

  // Get employee full name
  getEmployeeFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  // Check if user can create departments
  get canCreateDepartment(): boolean {
    return (
      this.userRole?.toLowerCase() === 'admin' ||
      this.userRole?.toLowerCase() === 'hod'
    );
  }

  // Handle image loading errors
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
      const fallback = target.nextElementSibling as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  }

  // Format image URL to handle relative paths
  formatImageUrl(url: string | null): string {
    if (!url) return '';

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Check if employee has a valid photo URL
  hasValidPhotoUrl(employee: Employee | undefined): boolean {
    return !!(employee?.photoUrl && employee.photoUrl.trim() !== '');
  }

  // Get default image based on gender
  getDefaultImage(employee: Employee | undefined): string {
    if (!employee || !employee.gender) {
      return 'assets/svg/male.svg'; // Default to male if no gender specified
    }

    const gender = employee.gender.toLowerCase();
    if (gender === 'female' || gender === 'f') {
      return 'assets/svg/female.svg';
    } else {
      return 'assets/svg/male.svg';
    }
  }

  // Get all departments from all organizations (excluding Director departments and duplicates)
  getAllDepartments(): Department[] {
    const allDepartments = this.organizations.flatMap(
      (org) => org.departments || []
    );
    const headDepartmentIds = this.organizations
      .map((org) => org.headDepartment?.id)
      .filter((id) => id !== undefined);

    // Filter out head departments and remove duplicates based on ID
    const uniqueDepartments = allDepartments.filter(
      (dept, index, self) =>
        !headDepartmentIds.includes(dept.id) &&
        self.findIndex((d) => d.id === dept.id) === index
    );

    return uniqueDepartments;
  }

  // Get the single Director (first head department from first organization)
  getDirector(): Employee | undefined {
    return this.organizations[0]?.headDepartment?.hod;
  }

  // Get Director department name
  getDirectorDepartmentName(): string {
    return (
      this.organizations[0]?.headDepartment?.name ||
      'Director Superintendent Admin'
    );
  }

  // Get Director team count
  getDirectorTeamCount(): number {
    return this.organizations[0]?.headDepartment?.members?.length || 0;
  }
}
