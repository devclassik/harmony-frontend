import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

// Interface for camp meeting attendee
export interface CampMeetingAttendee {
  id: number;
  employeeId: string;
  title?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  profferedName?: string;
  primaryPhone?: string;
  primaryPhoneType?: string;
  altPhone?: string;
  altPhoneType?: string;
  dob?: string;
  maritalStatus?: string;
  everDivorced: boolean;
  beenConvicted: boolean;
  hasQuestionableBackground: boolean;
  hasBeenInvestigatedForMisconductOrAbuse: boolean;
  photoUrl?: string;
  altEmail?: string;
  employeeStatus?: string;
  employmentType?: string;
  serviceStartDate?: string;
  retiredDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: {
    id: number;
    email: string;
    password: string;
    verifyEmailOTP: string;
    isEmailVerified: boolean;
    passwordResetOTP?: string;
    isLoggedIn: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
  };
}

// Interface for camp meeting record
export interface CampMeetingRecord {
  id: number;
  name?: string;
  agenda: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  attendees: CampMeetingAttendee[];
}

// Interface for API response
export interface CampMeetingApiResponse {
  status: string;
  message: string;
  data: CampMeetingRecord[];
}

// Interface for creating camp meeting
export interface CreateCampMeetingRequest {
  agenda: string;
  startDate: string;
  endDate: string;
  attendees: number[];
  documents?: string[];
}

// Interface for create response
export interface CreateCampMeetingResponse {
  status: string;
  message: string;
  data: CampMeetingRecord;
}

@Injectable({
  providedIn: 'root',
})
export class CampMeetingService {
  constructor(private apiService: ApiService) {}

  // Get all camp meetings
  getCampMeetings(): Observable<CampMeetingApiResponse> {
    return this.apiService.get<CampMeetingApiResponse>(
      environment.routes.campMeeting.getAll
    );
  }

  // Create new camp meeting
  createCampMeeting(
    request: CreateCampMeetingRequest
  ): Observable<CreateCampMeetingResponse> {
    return this.apiService.post<CreateCampMeetingResponse>(
      environment.routes.campMeeting.create,
      request
    );
  }

  // Update camp meeting
  updateCampMeeting(
    id: number,
    request: CreateCampMeetingRequest
  ): Observable<CreateCampMeetingResponse> {
    return this.apiService.put<CreateCampMeetingResponse>(
      `${environment.routes.campMeeting.update}/${id}`,
      request
    );
  }

  // Delete camp meeting
  deleteCampMeeting(id: number): Observable<CreateCampMeetingResponse> {
    return this.apiService.delete<CreateCampMeetingResponse>(
      `${environment.routes.campMeeting.delete}/${id}`
    );
  }

  // Transform camp meeting data for calendar display
  transformToCalendarEvents(campMeetings: CampMeetingRecord[]): any[] {
    return campMeetings.map((meeting) => ({
      id: meeting.id.toString(),
      title: meeting.agenda,
      start: meeting.startDate,
      end: meeting.endDate,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#ffffff',
      extendedProps: {
        originalData: meeting,
      },
    }));
  }

  // Transform camp meeting data for detail view
  transformForDetailView(meeting: CampMeetingRecord): any {
    return {
      id: meeting.id,
      title: meeting.agenda,
      startDate: this.formatDateForDisplay(meeting.startDate),
      endDate: this.formatDateForDisplay(meeting.endDate),
      status: 'Approved', // Default status for camp meetings
      reason: `Camp Meeting: ${meeting.agenda}`,
      attendees: meeting.attendees.map(
        (attendee) => `${attendee.firstName} ${attendee.lastName}`
      ),
      documents: [], // No documents in current API structure
      requestType: 'Camp Meeting',
      substitution: 'N/A',
      originalData: meeting,
    };
  }

  // Helper method to format date for display
  private formatDateForDisplay(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Check if a date falls within a camp meeting period
  isDateInCampMeeting(
    date: string,
    campMeetings: CampMeetingRecord[]
  ): CampMeetingRecord | null {
    const checkDate = new Date(date);

    for (const meeting of campMeetings) {
      const startDate = new Date(meeting.startDate);
      const endDate = new Date(meeting.endDate);

      if (checkDate >= startDate && checkDate <= endDate) {
        return meeting;
      }
    }

    return null;
  }
}
