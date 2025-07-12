import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { ProfileCreateComponent } from '../profile-create/profile-create.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { Router } from '@angular/router';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ProfileCreateComponent, LoadingOverlayComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  workerName: string = '';
  isLoadingProfile = false;
  employeeData: EmployeeDetails | null = null;
  currentWorker: any;

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

    // Get employee ID from the current worker data
    const employeeId = this.authService.getCurrentEmployeeId();

    if (!employeeId) {
      this.isLoadingProfile = false;
      console.error('No employee ID available for current worker');
      this.employeeData = null;
      return;
    }

    const profileSub = this.employeeService
      .getEmployeeById(employeeId)
      .subscribe({
        next: (response) => {
          this.isLoadingProfile = false;
          if (response.status === 'success' && response.data) {
            // Handle the case where data is an array (multiple employees)
            if (Array.isArray(response.data)) {
              // Find the employee with matching ID or use the first one
              const employee =
                response.data.find((emp) => emp.id === employeeId) ||
                response.data[0];
              this.employeeData = employee || null;
            } else {
              // Handle the case where data is a single employee object
              this.employeeData = response.data;
            }
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
}
