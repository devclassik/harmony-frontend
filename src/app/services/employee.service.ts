import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  EmployeeDetails,
  GetEmployeeResponse,
  GetAllEmployeesResponse,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from '../dto/employee.dto';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private apiService: ApiService) {}

  /**
   * Get employee by ID
   * @param id Employee ID
   * @returns Observable of employee details
   */
  getEmployeeById(id: number): Observable<GetEmployeeResponse> {
    const endpoint = environment.routes.employees.getById.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.get<GetEmployeeResponse>(endpoint);
  }

  /**
   * Get all employees
   * @param page Page number (optional, defaults to 1)
   * @param limit Items per page (optional, defaults to 10)
   * @returns Observable of all employees with pagination
   */
  getAllEmployees(
    page: number = 1,
    limit: number = 10
  ): Observable<GetAllEmployeesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.apiService.get<GetAllEmployeesResponse>(
      `${environment.routes.employees.getAll}?${params.toString()}`
    );
  }

  /**
   * Create new employee
   * @param employeeData Employee data to create
   * @returns Observable of created employee
   */
  createEmployee(
    employeeData: CreateEmployeeRequest
  ): Observable<CreateEmployeeResponse> {
    return this.apiService.post<CreateEmployeeResponse>(
      environment.routes.employees.create,
      employeeData
    );
  }

  /**
   * Update employee
   * @param id Employee ID
   * @param employeeData Updated employee data
   * @returns Observable of updated employee
   */
  updateEmployee(
    id: number,
    employeeData: UpdateEmployeeRequest
  ): Observable<UpdateEmployeeResponse> {
    const endpoint = environment.routes.employees.update.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.put<UpdateEmployeeResponse>(endpoint, employeeData);
  }

  /**
   * Delete employee
   * @param id Employee ID
   * @returns Observable of delete response
   */
  deleteEmployee(id: number): Observable<any> {
    const endpoint = environment.routes.employees.delete.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.delete(endpoint);
  }

  /**
   * Get employee profile
   * @returns Observable of employee profile
   */
  getEmployeeProfile(): Observable<GetEmployeeResponse> {
    return this.apiService.get<GetEmployeeResponse>(
      environment.routes.employees.profile
    );
  }

  /**
   * Check if employee profile is complete
   * @param employee Employee data
   * @returns boolean indicating if profile is complete
   */
  isProfileComplete(employee: EmployeeDetails): boolean {
    console.log('🔍 Checking profile completion for employee:', employee);

    // Define essential fields that should not be null for a complete profile
    // Based on the current form structure we've implemented (Employee Information section)
    const essentialFields = [
      'title',
      'firstName',
      'middleName',
      'lastName',
      'profferedName',
      'gender',
    ];

    // Check if any essential field is null or empty
    for (const field of essentialFields) {
      const value = employee[field as keyof EmployeeDetails];
      console.log(`📝 Field ${field}:`, value, `(type: ${typeof value})`);

      if (value === null || value === undefined || value === '') {
        console.log(`❌ Profile incomplete - missing field: ${field}`);
        return false;
      }
    }

    console.log('✅ Profile is complete!');
    // Profile is considered complete if basic personal information is filled
    // We've relaxed the requirements to match the current form implementation
    return true;
  }

  /**
   * Get missing profile fields
   * @param employee Employee data
   * @returns Array of missing field names
   */
  getMissingProfileFields(employee: EmployeeDetails): string[] {
    const missingFields: string[] = [];

    const essentialFields = [
      { key: 'title', label: 'Title' },
      { key: 'firstName', label: 'First Name' },
      { key: 'middleName', label: 'Middle Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'profferedName', label: 'Proffered Name' },
      { key: 'gender', label: 'Gender' },
      { key: 'primaryPhone', label: 'Primary Phone' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'maritalStatus', label: 'Marital Status' },
    ];

    // Check essential fields
    for (const field of essentialFields) {
      const value = employee[field.key as keyof EmployeeDetails];
      if (value === null || value === undefined || value === '') {
        missingFields.push(field.label);
      }
    }

    return missingFields;
  }

  createRetirementRequest(employeeId: number, reason: string): Observable<any> {
    const requestData = {
      employeeId: employeeId,
      reason: reason,
    };

    return this.apiService.post<any>('/retirement', requestData);
  }
}
