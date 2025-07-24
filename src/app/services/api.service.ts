import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any default headers here
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, data?: any): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        body: data,
      })
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // Permission update method
  updateRolePermissions(roleId: number, permissions: any): Observable<any> {
    const payload = {
      roleId: roleId,
      permissions: permissions,
    };
    return this.put<any>(
      environment.routes.permissions.updateRolePermissions,
      payload
    );
  }

  // Accommodation methods
  getAccommodations(): Observable<any> {
    return this.get<any>(environment.routes.accommodation.getAll);
  }

  createAccommodation(data: any): Observable<any> {
    return this.post<any>(environment.routes.accommodation.create, data);
  }

  updateAccommodation(id: number, data: any): Observable<any> {
    const endpoint = environment.routes.accommodation.update.replace(
      '{id}',
      id.toString()
    );
    return this.put<any>(endpoint, data);
  }

  deleteAccommodation(id: number): Observable<any> {
    const endpoint = environment.routes.accommodation.delete.replace(
      '{id}',
      id.toString()
    );
    return this.delete<any>(endpoint);
  }
}
