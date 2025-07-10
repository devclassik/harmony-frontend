import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  Department,
  GetDepartmentsResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse,
} from '../dto/department.dto';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all departments
   * @returns Observable of all departments
   */
  getAllDepartments(): Observable<GetDepartmentsResponse> {
    return this.apiService.get<GetDepartmentsResponse>(
      environment.routes.departments.getAll
    );
  }

  /**
   * Get department by ID
   * @param id - Department ID
   * @returns Observable of department details
   */
  getDepartmentById(id: number): Observable<Department> {
    const endpoint = environment.routes.departments.getById.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.get<Department>(endpoint);
  }

  /**
   * Create new department
   * @param request - Department creation data
   * @returns Observable of created department
   */
  createDepartment(
    request: CreateDepartmentRequest
  ): Observable<CreateDepartmentResponse> {
    return this.apiService.post<CreateDepartmentResponse>(
      environment.routes.departments.create,
      request
    );
  }

  /**
   * Update existing department
   * @param id - Department ID
   * @param request - Department update data
   * @returns Observable of updated department
   */
  updateDepartment(
    id: number,
    request: UpdateDepartmentRequest
  ): Observable<UpdateDepartmentResponse> {
    const endpoint = environment.routes.departments.update.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.put<UpdateDepartmentResponse>(endpoint, request);
  }

  /**
   * Delete department
   * @param id - Department ID
   * @returns Observable of delete response
   */
  deleteDepartment(id: number): Observable<DeleteDepartmentResponse> {
    const endpoint = environment.routes.departments.delete.replace(
      '{id}',
      id.toString()
    );
    return this.apiService.delete<DeleteDepartmentResponse>(endpoint);
  }

  /**
   * Get active departments for dropdown
   * @returns Observable of active departments
   */
  getActiveDepartments(): Observable<Department[]> {
    return new Observable((observer) => {
      this.getAllDepartments().subscribe({
        next: (response) => {
          if (response.status === 'success') {
            // Filter only non-deleted departments
            const activeDepartments = response.data.filter(
              (dept) => dept.deletedAt === null
            );
            observer.next(activeDepartments);
          } else {
            observer.error(
              new Error(response.message || 'Failed to fetch departments')
            );
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }
}
