import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  GetAnalyticsOverviewResponse,
  GetLeaveStatisticsResponse,
  GetEmployeeDemographicsResponse,
  GetDisciplineStatisticsResponse,
  GetPerformanceStatisticsResponse,
} from '../dto/analytics.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private apiService: ApiService) {}

  getOverview(): Observable<GetAnalyticsOverviewResponse> {
    return this.apiService.get<GetAnalyticsOverviewResponse>(
      environment.routes.analytics.getAnalyticsOverview
    );
  }

  getLeaveStatistics(year: number): Observable<GetLeaveStatisticsResponse> {
    const params = new URLSearchParams({
      year: year.toString(),
      status: 'APPROVED',
    });

    const url = `${
      environment.routes.analytics.getLeaveStatistics
    }?${params.toString()}`;

    return this.apiService.get<GetLeaveStatisticsResponse>(url);
  }

  getEmployeeDemographics(): Observable<GetEmployeeDemographicsResponse> {
    return this.apiService.get<GetEmployeeDemographicsResponse>(
      environment.routes.analytics.getEmployeeDemographics
    );
  }

  getDisciplineStatistics(
    year: number
  ): Observable<GetDisciplineStatisticsResponse> {
    const params = new URLSearchParams({
      year: year.toString(),
    });

    const url = `/analytics/discipline-stat?${params.toString()}`;
    return this.apiService.get<GetDisciplineStatisticsResponse>(url);
  }

  getPerformanceStatistics(
    employeeId: number,
    year: number
  ): Observable<GetPerformanceStatisticsResponse> {
    const params = new URLSearchParams({
      employeeId: employeeId.toString(),
      year: year.toString(),
    });

    const url = `/analytics/performance-stat?${params.toString()}`;
    return this.apiService.get<GetPerformanceStatisticsResponse>(url);
  }
}
