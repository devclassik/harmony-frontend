import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FileIndex {
  id: number;
  name: string;
  downloadUrl: string;
  fileType: string;
  isTraining: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FileIndexResponse {
  status: string;
  message: string;
  data: FileIndex[];
}

export interface CreateFileIndexResponse {
  status: string;
  message: string;
  data: FileIndex;
}

export interface CreateFileIndexRequest {
  name: string;
  downloadUrl: string;
  fileType: string;
  isTraining: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FileIndexService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all file-index items
   */
  getFileIndex(): Observable<FileIndexResponse> {
    return this.http.get<FileIndexResponse>(`${this.apiUrl}/file-index`);
  }

  /**
   * Create a new file-index item
   */
  createFileIndex(
    request: CreateFileIndexRequest
  ): Observable<CreateFileIndexResponse> {
    return this.http.post<CreateFileIndexResponse>(
      `${this.apiUrl}/file-index`,
      request
    );
  }

  /**
   * Delete a file-index item
   */
  deleteFileIndex(
    fileIndexId: number
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.apiUrl}/file-index/${fileIndexId}`
    );
  }

  /**
   * Download a file-index item
   */
  downloadFileIndex(downloadUrl: string): void {
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
}
