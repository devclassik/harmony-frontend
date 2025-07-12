import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeInfo } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-dashboard-information',
  imports: [CommonModule],
  templateUrl: './dashboard-information.component.html',
  styleUrl: './dashboard-information.component.css',
})
export class DashboardInformationComponent {
  @Input() title: string = 'Employee Information';
  @Input() employeeData!: EmployeeInfo;
  @Input() isProfileMode: boolean = false;
  @Input() personalTitle: string = 'Mr.';

  constructor(private router: Router) {}

  onImageError(event: any) {
    // Set fallback image if the profile image fails to load
    event.target.src = 'assets/svg/gender.svg';
  }

  viewProfile() {
    this.router.navigate(['/profile-view']);
  }
}
