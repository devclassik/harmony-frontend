import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, LoadingOverlayComponent],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  employeeData: EmployeeDetails | null = null;
  isLoadingProfile = false;
  currentWorker: any;
  workerName: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.currentWorker = this.authService.getCurrentWorker();
  }

  ngOnInit() {
    this.loadWorkerInfo();
    this.loadEmployeeProfile();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadWorkerInfo() {
    this.workerName =
      this.currentWorker?.fullName || this.currentWorker?.name || 'Worker';
  }

  private loadEmployeeProfile() {
    this.isLoadingProfile = true;

    // Get employee ID from the current worker's data
    const employeeId = this.currentWorker?.employeeId || this.currentWorker?.id;

    if (!employeeId) {
      console.error('No employee ID found for current worker');
      this.isLoadingProfile = false;
      this.employeeData = null;
      return;
    }

    const profileSub = this.employeeService
      .getEmployeeById(employeeId)
      .subscribe({
        next: (response) => {
          this.isLoadingProfile = false;
          if (response.status === 'success' && response.data) {
            this.employeeData = response.data;
          } else {
            this.employeeData = null;
          }
        },
        error: (error) => {
          this.isLoadingProfile = false;
          console.error('Error loading employee profile:', error);
          this.employeeData = null;
        },
      });

    this.subscriptions.push(profileSub);
  }

  editProfile() {
    this.router.navigate(['/profile']);
  }

  editSection(section: string) {
    // Navigate to profile edit with specific section focus
    this.router.navigate(['/profile'], { queryParams: { section } });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Helper methods to get formatted data
  getFullName(): string {
    if (!this.employeeData) return '';
    const parts = [
      this.employeeData.title,
      this.employeeData.firstName,
      this.employeeData.middleName,
      this.employeeData.lastName,
    ].filter(Boolean);
    return parts.join(' ');
  }

  getFormattedAddress(address: any): string {
    if (!address) return 'Not provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zipCode,
    ].filter(Boolean);
    return parts.join(', ') || 'Not provided';
  }

  getFormattedPhone(): string {
    if (!this.employeeData?.primaryPhone) return 'Not provided';
    return `${this.employeeData.primaryPhone} (${
      this.employeeData.primaryPhoneType || 'Primary'
    })`;
  }

  getFormattedDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  }

  getEmploymentStatus(): string {
    return this.employeeData?.employeeStatus || 'Not specified';
  }

  getEmploymentType(): string {
    return this.employeeData?.employmentType || 'Not specified';
  }

  getDepartments(): string {
    if (
      !this.employeeData?.departments ||
      this.employeeData.departments.length === 0
    ) {
      return 'Not assigned';
    }
    return this.employeeData.departments.map((dept) => dept.name).join(', ');
  }
}
