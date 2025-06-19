import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() personalTitle: string = 'Mr.';
}
