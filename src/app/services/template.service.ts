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
    window.open(downloadUrl, '_blank');
  }
}
