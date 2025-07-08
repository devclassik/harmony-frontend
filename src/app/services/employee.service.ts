import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  EmployeeDetails,
  GetEmployeeResponse,
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
   * @returns Observable of all employees
   */
  getAllEmployees(): Observable<GetEmployeeResponse> {
    return this.apiService.get<GetEmployeeResponse>(
      environment.routes.employees.getAll
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
    // Define essential fields that should not be null for a complete profile
    const essentialFields = [
      'title',
      'firstName',
      'lastName',
      'gender',
      'primaryPhone',
      'dob',
      'maritalStatus',
      'employeeStatus',
      'employmentType',
      'serviceStartDate',
    ];

    // Check if any essential field is null or empty
    for (const field of essentialFields) {
      const value = employee[field as keyof EmployeeDetails];
      if (value === null || value === undefined || value === '') {
        return false;
      }
    }

    // Check if home address exists
    if (!employee.homeAddress) {
      return false;
    }

    // Check if at least one department is assigned
    if (!employee.departments || employee.departments.length === 0) {
      return false;
    }

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
      { key: 'lastName', label: 'Last Name' },
      { key: 'gender', label: 'Gender' },
      { key: 'primaryPhone', label: 'Primary Phone' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'maritalStatus', label: 'Marital Status' },
      { key: 'employeeStatus', label: 'Employee Status' },
      { key: 'employmentType', label: 'Employment Type' },
      { key: 'serviceStartDate', label: 'Service Start Date' },
    ];

    // Check essential fields
    for (const field of essentialFields) {
      const value = employee[field.key as keyof EmployeeDetails];
      if (value === null || value === undefined || value === '') {
        missingFields.push(field.label);
      }
    }

    // Check home address
    if (!employee.homeAddress) {
      missingFields.push('Home Address');
    }

    // Check departments
    if (!employee.departments || employee.departments.length === 0) {
      missingFields.push('Department Assignment');
    }

    return missingFields;
  }
}
