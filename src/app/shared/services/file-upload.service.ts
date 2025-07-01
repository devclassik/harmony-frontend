import { Injectable } from '@angular/core';

export interface UploadedFile {
  name: string;
  size: number;
  file: File;
  uploadStatus: 'uploading' | 'completed' | 'error';
  progress?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
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
}
