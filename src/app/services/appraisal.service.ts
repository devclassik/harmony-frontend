import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  CreateAppraisalRequest,
  CreateAppraisalResponse,
} from '../dto/appraisal.dto';

@Injectable({
  providedIn: 'root',
})
export class AppraisalService {
  constructor(private apiService: ApiService) {}

  submitAppraisal(
    employeeId: number,
    appraisalData: CreateAppraisalRequest
  ): Observable<CreateAppraisalResponse> {
    return this.apiService.post<CreateAppraisalResponse>(
      environment.routes.appraisal.create,
      appraisalData
    );
  }
}
