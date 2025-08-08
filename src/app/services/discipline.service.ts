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

  getAllDisciplines(): Observable<GetDisciplinesResponse> {
    return this.apiService.get<GetDisciplinesResponse>(
      environment.routes.discipline.getAll
    );
  }

  getDisciplineDetails(
    disciplineId: number
  ): Observable<GetDisciplineDetailResponse> {
    const endpoint = environment.routes.discipline.getById.replace(
      '{id}',
      disciplineId.toString()
    );
    return this.apiService.get<GetDisciplineDetailResponse>(endpoint);
  }

  createDiscipline(
    request: CreateDisciplineRequest
  ): Observable<CreateDisciplineResponse> {
    return this.apiService.post<CreateDisciplineResponse>(
      environment.routes.discipline.create,
      request
    );
  }

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

  approveDiscipline(
    disciplineId: number
  ): Observable<UpdateDisciplineResponse> {
    return this.updateDisciplineStatus(disciplineId, { status: 'APPROVED' });
  }

  rejectDiscipline(disciplineId: number): Observable<UpdateDisciplineResponse> {
    return this.updateDisciplineStatus(disciplineId, { status: 'REJECTED' });
  }
}
