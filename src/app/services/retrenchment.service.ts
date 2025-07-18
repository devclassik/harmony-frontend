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
} from '../dto/retrenchment.dto';

@Injectable({
  providedIn: 'root',
})
export class RetrenchmentService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRetrenchment(
    data: CreateRetrenchmentRequest
  ): Observable<CreateRetrenchmentResponse> {
    return this.http.post<CreateRetrenchmentResponse>(
      `${this.baseUrl}/retrenchment`,
      data
    );
  }

  getAllRetrenchments(): Observable<GetRetrenchmentsResponse> {
    return this.http.get<GetRetrenchmentsResponse>(
      `${this.baseUrl}/retrenchment`
    );
  }

  getRetrenchmentDetails(
    id: number
  ): Observable<GetRetrenchmentDetailResponse> {
    return this.http.get<GetRetrenchmentDetailResponse>(
      `${this.baseUrl}/retrenchment/${id}`
    );
  }

  approveRetrenchment(id: number): Observable<UpdateRetrenchmentResponse> {
    return this.http.patch<UpdateRetrenchmentResponse>(
      `${this.baseUrl}/retrenchment/${id}/approve`,
      {}
    );
  }

  rejectRetrenchment(id: number): Observable<UpdateRetrenchmentResponse> {
    return this.http.patch<UpdateRetrenchmentResponse>(
      `${this.baseUrl}/retrenchment/${id}/reject`,
      {}
    );
  }
}
