import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Template {
  id: number;
  documentId: string | null;
  name: string;
  downloadUrl: string;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TemplateResponse {
  status: string;
  message: string;
  data: Template[];
}

export interface CreateTemplateResponse {
  status: string;
  message: string;
  data: Template;
}

export interface CreateTemplateRequest {
  name: string;
  downloadUrl: string;
  fileType: string;
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
    return this.http.get<TemplateResponse>(`${this.apiUrl}/file-index`);
  }

  /**
   * Download a template file
   */
  downloadTemplate(downloadUrl: string): void {
    // If the URL is already absolute, use it directly
    if (
      downloadUrl.startsWith('http://') ||
      downloadUrl.startsWith('https://')
    ) {
      window.open(downloadUrl, '_blank');
    } else {
      // If it's a relative URL, construct the full URL
      const fullUrl = `${this.apiUrl.replace('/api/v1', '')}${downloadUrl}`;
      console.log('Constructed download URL:', fullUrl);
      window.open(fullUrl, '_blank');
    }
  }

  /**
   * Create a new template
   */
  createTemplate(
    request: CreateTemplateRequest
  ): Observable<CreateTemplateResponse> {
    return this.http.post<CreateTemplateResponse>(
      `${this.apiUrl}/file-index`,
      request
    );
  }

  /**
   * Delete a template
   */
  deleteTemplate(
    templateId: number
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/file-index/${templateId}`
    );
  }
}
