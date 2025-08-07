import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Template {
  id: number;
  templateId: string | null;
  downloadUrl: string;
  type: TemplateType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type TemplateType =
  | 'TRANSFER_APPROVAL'
  | 'TRANSFER_REQUEST'
  | 'TRANSFER_DECLINE'
  | 'SICK_LEAVE_APPROVAL'
  | 'SICK_LEAVE_REQUEST'
  | 'SICK_LEAVE_DECLINE'
  | 'ANNUAL_LEAVE_APPROVAL'
  | 'ANNUAL_LEAVE_REQUEST'
  | 'ANNUAL_LEAVE_DECLINE'
  | 'ABSENCE_LEAVE_APPROVAL'
  | 'ABSENCE_LEAVE_REQUEST'
  | 'ABSENCE_LEAVE_DECLINE'
  | 'PROMOTION_APPROVAL'
  | 'PROMOTION_REQUEST'
  | 'PROMOTION_DECLINE'
  | 'RETIREMENT_APPROVAL'
  | 'RETIREMENT_REQUEST'
  | 'RETIREMENT_DECLINE'
  | 'RETRENCHMENT_APPROVAL'
  | 'RETRENCHMENT_REQUEST'
  | 'RETRENCHMENT_DECLINE'
  | 'DISCIPLINE';

export interface TemplateResponse {
  status: string;
  message: string;
  data: Template[];
}

export interface CreateTemplateRequest {
  type: TemplateType;
  files: File[];
}

export interface CreateTemplateResponse {
  status: string;
  message: string;
  data: Template;
}

@Injectable({
  providedIn: 'root',
})
export class TemplateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all templates
   */
  getTemplates(): Observable<TemplateResponse> {
    return this.http.get<TemplateResponse>(`${this.apiUrl}/template`);
  }

  /**
   * Create a new template
   */
  createTemplate(
    request: CreateTemplateRequest
  ): Observable<CreateTemplateResponse> {
    const formData = new FormData();
    formData.append('type', request.type);

    // Add files to FormData
    request.files.forEach((file) => {
      formData.append('files', file);
    });

    return this.http.post<CreateTemplateResponse>(
      `${this.apiUrl}/template`,
      formData
    );
  }

  /**
   * Download a template file
   */
  downloadTemplate(downloadUrl: string): void {
    window.open(downloadUrl, '_blank');
  }

  /**
   * Get template type display name
   */
  getTemplateTypeDisplayName(type: TemplateType): string {
    const typeMap: Record<TemplateType, string> = {
      TRANSFER_APPROVAL: 'Transfer Approval',
      TRANSFER_REQUEST: 'Transfer Request',
      TRANSFER_DECLINE: 'Transfer Decline',
      SICK_LEAVE_APPROVAL: 'Sick Leave Approval',
      SICK_LEAVE_REQUEST: 'Sick Leave Request',
      SICK_LEAVE_DECLINE: 'Sick Leave Decline',
      ANNUAL_LEAVE_APPROVAL: 'Annual Leave Approval',
      ANNUAL_LEAVE_REQUEST: 'Annual Leave Request',
      ANNUAL_LEAVE_DECLINE: 'Annual Leave Decline',
      ABSENCE_LEAVE_APPROVAL: 'Absence Leave Approval',
      ABSENCE_LEAVE_REQUEST: 'Absence Leave Request',
      ABSENCE_LEAVE_DECLINE: 'Absence Leave Decline',
      PROMOTION_APPROVAL: 'Promotion Approval',
      PROMOTION_REQUEST: 'Promotion Request',
      PROMOTION_DECLINE: 'Promotion Decline',
      RETIREMENT_APPROVAL: 'Retirement Approval',
      RETIREMENT_REQUEST: 'Retirement Request',
      RETIREMENT_DECLINE: 'Retirement Decline',
      RETRENCHMENT_APPROVAL: 'Retrenchment Approval',
      RETRENCHMENT_REQUEST: 'Retrenchment Request',
      RETRENCHMENT_DECLINE: 'Retrenchment Decline',
      DISCIPLINE: 'Discipline',
    };
    return typeMap[type] || type;
  }
}
