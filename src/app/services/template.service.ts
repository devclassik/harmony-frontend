import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Template {
  id: number;
  downloadUrl: string;
  type: string;
  templateId: number | null;
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
  type: string;
  file: File;
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
    const formData = new FormData();
    formData.append('type', request.type);
    formData.append('file', request.file);

    return this.http.post<CreateTemplateResponse>(
      `${this.apiUrl}/template`,
      formData
    );
  }

  /**
   * Delete a template
   */
  deleteTemplate(
    templateId: number
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/template/${templateId}`
    );
  }
}
