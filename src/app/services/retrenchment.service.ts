import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateRetrenchmentRequest,
  CreateRetrenchmentResponse,
  GetRetrenchmentsResponse,
  GetRetrenchmentDetailResponse,
  UpdateRetrenchmentResponse,
  UpdateRetrenchmentStatusRequest,
} from '../dto/retrenchment.dto';

@Injectable({
  providedIn: 'root',
})
export class RetrenchmentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createRetrenchment(
    data: CreateRetrenchmentRequest
  ): Observable<CreateRetrenchmentResponse> {
    return this.http.post<CreateRetrenchmentResponse>(
      `${this.baseUrl}${environment.routes.retrenchment.getAll}`,
      data
    );
  }

  getAllRetrenchments(): Observable<GetRetrenchmentsResponse> {
    return this.http.get<GetRetrenchmentsResponse>(
      `${this.baseUrl}${environment.routes.retrenchment.getAll}`,

    );
  }

  getRetrenchmentDetails(
    id: number
  ): Observable<GetRetrenchmentDetailResponse> {
    return this.http.get<GetRetrenchmentDetailResponse>(
      `${this.baseUrl}${environment.routes.retrenchment.getAll}/${id}`
    );
  }

  approveRetrenchment(id: number, data: UpdateRetrenchmentStatusRequest): Observable<UpdateRetrenchmentResponse> {
    return this.http.put<UpdateRetrenchmentResponse>(
      `${this.baseUrl}${environment.routes.retrenchment.getAll}/${id}`,
      data
    );
  }

  rejectRetrenchment(id: number, data: UpdateRetrenchmentStatusRequest): Observable<UpdateRetrenchmentResponse> {
    return this.http.put<UpdateRetrenchmentResponse>(
      `${this.baseUrl}${environment.routes.retrenchment.getAll}/${id}`,
      data
    );
  }
}
