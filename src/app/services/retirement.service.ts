import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  CreateRetirementRequest,
  CreateRetirementResponse,
  UpdateRetirementStatusRequest,
  UpdateRetirementResponse,
  GetRetirementsResponse,
  GetRetirementDetailResponse,
} from '../dto/retirement.dto';

@Injectable({
  providedIn: 'root',
})
export class RetirementService {
  constructor(private apiService: ApiService) {}

  getAllRetirements(): Observable<GetRetirementsResponse> {
    return this.apiService.get<GetRetirementsResponse>(
      environment.routes.retirement.getAll
    );
  }

  getRetirementDetails(
    retirementId: number
  ): Observable<GetRetirementDetailResponse> {
    const endpoint = environment.routes.retirement.getById.replace(
      '{id}',
      retirementId.toString()
    );
    return this.apiService.get<GetRetirementDetailResponse>(endpoint);
  }

  createRetirement(
    request: CreateRetirementRequest
  ): Observable<CreateRetirementResponse> {
    return this.apiService.post<CreateRetirementResponse>(
      environment.routes.retirement.create,
      request
    );
  }

  updateRetirementStatus(
    retirementId: number,
    request: UpdateRetirementStatusRequest
  ): Observable<UpdateRetirementResponse> {
    const endpoint = environment.routes.retirement.update.replace(
      '{id}',
      retirementId.toString()
    );
    return this.apiService.put<UpdateRetirementResponse>(endpoint, request);
  }

  approveRetirement(
    retirementId: number
  ): Observable<UpdateRetirementResponse> {
    return this.updateRetirementStatus(retirementId, { status: 'APPROVED' });
  }

  rejectRetirement(retirementId: number): Observable<UpdateRetirementResponse> {
    return this.updateRetirementStatus(retirementId, { status: 'REJECTED' });
  }
}
