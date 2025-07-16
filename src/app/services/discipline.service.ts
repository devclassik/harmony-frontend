import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  CreateDisciplineRequest,
  CreateDisciplineResponse,
  UpdateDisciplineStatusRequest,
  UpdateDisciplineResponse,
  GetDisciplinesResponse,
  GetDisciplineDetailResponse,
} from '../dto/discipline.dto';

@Injectable({
  providedIn: 'root',
})
export class DisciplineService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all discipline requests
   * @returns Observable<GetDisciplinesResponse>
   */
  getAllDisciplines(): Observable<GetDisciplinesResponse> {
    return this.apiService.get<GetDisciplinesResponse>(
      environment.routes.discipline.getAll
    );
  }

  /**
   * Get detailed discipline information by ID
   * @param disciplineId - The discipline ID
   * @returns Observable<GetDisciplineDetailResponse>
   */
  getDisciplineDetails(
    disciplineId: number
  ): Observable<GetDisciplineDetailResponse> {
    const endpoint = environment.routes.discipline.getById.replace(
      '{id}',
      disciplineId.toString()
    );
    return this.apiService.get<GetDisciplineDetailResponse>(endpoint);
  }

  /**
   * Create a new discipline request
   * @param request - The discipline request data
   * @returns Observable<CreateDisciplineResponse>
   */
  createDiscipline(
    request: CreateDisciplineRequest
  ): Observable<CreateDisciplineResponse> {
    return this.apiService.post<CreateDisciplineResponse>(
      environment.routes.discipline.create,
      request
    );
  }

  /**
   * Update discipline status
   * @param disciplineId - The discipline ID
   * @param request - The status update request
   * @returns Observable<UpdateDisciplineResponse>
   */
  updateDisciplineStatus(
    disciplineId: number,
    request: UpdateDisciplineStatusRequest
  ): Observable<UpdateDisciplineResponse> {
    const endpoint = environment.routes.discipline.update.replace(
      '{id}',
      disciplineId.toString()
    );
    return this.apiService.put<UpdateDisciplineResponse>(endpoint, request);
  }

  /**
   * Approve a discipline request
   * @param disciplineId - The discipline ID
   * @returns Observable<UpdateDisciplineResponse>
   */
  approveDiscipline(
    disciplineId: number
  ): Observable<UpdateDisciplineResponse> {
    return this.updateDisciplineStatus(disciplineId, { status: 'APPROVED' });
  }

  /**
   * Reject a discipline request
   * @param disciplineId - The discipline ID
   * @returns Observable<UpdateDisciplineResponse>
   */
  rejectDiscipline(disciplineId: number): Observable<UpdateDisciplineResponse> {
    return this.updateDisciplineStatus(disciplineId, { status: 'REJECTED' });
  }
}
