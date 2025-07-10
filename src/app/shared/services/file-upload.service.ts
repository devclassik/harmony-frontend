import { Injectable } from '@angular/core';
import { Observable, forkJoin, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';

export interface UploadedFile {
  name: string;
  size: number;
  file: File;
  uploadStatus: 'uploading' | 'completed' | 'error';
  progress?: number;
  url?: string; // URL after successful upload
}

export interface SingleFileUploadResponse {
  status: string;
  file: string;
}

export interface MultipleFileUploadResponse {
  status: string;
  files: string[];
}

// Keep legacy interface for backward compatibility
export interface FileUploadResponse {
  status: string;
  message: string;
  data: {
    url: string;
    fileName: string;
    fileSize: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor(private apiService: ApiService, private http: HttpClient) {}
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File ${file.name} is too large. Maximum size is 10MB.`,
      };
    }

    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type not allowed. Please upload PDF, DOC, DOCX, XLS, or XLSX files.`,
      };
    }

    return { isValid: true };
  }

  processFiles(files: File[], existingFiles: UploadedFile[]): UploadedFile[] {
    const newFiles: UploadedFile[] = [];

    files.forEach((file) => {
      const validation = this.validateFile(file);

      if (!validation.isValid) {
        console.warn(validation.error);
        return;
      }

      // Check if file already exists
      if (
        existingFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        console.warn(`File ${file.name} already exists.`);
        return;
      }

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        file: file,
        uploadStatus: 'completed',
        progress: 100,
      };

      newFiles.push(uploadedFile);
    });

    return newFiles;
  }

  getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      default:
        return 'file';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Upload multiple files and return their URLs
  uploadFiles(files: File[]): Observable<string[]> {
    if (files.length === 0) {
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }

    // Create upload observables for each file
    const uploadObservables = files.map((file) => this.uploadSingleFile(file));

    // Use forkJoin to wait for all uploads to complete
    return forkJoin(uploadObservables).pipe(
      map((responses: SingleFileUploadResponse[]) =>
        responses.map((response) => response.file)
      )
    );
  }

  // Upload a single file with progress tracking
  uploadSingleFileWithProgress(file: File): Observable<{
    progress?: number;
    response?: SingleFileUploadResponse;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest(
      'POST',
      `${environment.apiUrl}${environment.routes.files.uploadSingle}`,
      formData,
      {
        reportProgress: true,
      }
    );

    return new Observable((observer) => {
      this.http.request(req).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              const progress = Math.round((100 * event.loaded) / event.total);
              observer.next({ progress });
            }
          } else if (event.type === HttpEventType.Response) {
            observer.next({ response: event.body as SingleFileUploadResponse });
            observer.complete();
          }
        },
        error: (error) => observer.error(error),
      });
    });
  }

  // Upload a single file (without progress)
  private uploadSingleFile(file: File): Observable<SingleFileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.apiService.post<SingleFileUploadResponse>(
      environment.routes.files.uploadSingle,
      formData
    );
  }

  // Upload multiple files using the /upload/multiple endpoint
  uploadMultipleFiles(files: File[]): Observable<MultipleFileUploadResponse> {
    if (files.length === 0) {
      return new Observable((observer) => {
        observer.next({ status: 'success', files: [] });
        observer.complete();
      });
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.apiService.post<MultipleFileUploadResponse>(
      environment.routes.files.uploadMultiple,
      formData
    );
  }

  // Upload all files using the /upload/all endpoint
  uploadAllFiles(files: File[]): Observable<MultipleFileUploadResponse> {
    if (files.length === 0) {
      return new Observable((observer) => {
        observer.next({ status: 'success', files: [] });
        observer.complete();
      });
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.apiService.post<MultipleFileUploadResponse>(
      environment.routes.files.uploadAll,
      formData
    );
  }

  // Delete a file using the /upload/delete endpoint
  deleteFile(url: string): Observable<{ status: string; message?: string }> {
    const body = { url };
    return this.apiService.delete<{ status: string; message?: string }>(
      environment.routes.files.delete,
      body
    );
  }
}
