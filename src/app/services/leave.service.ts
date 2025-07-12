import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

// Interfaces for Leave API
export interface CreateLeaveRequest {
  startDate: string;
  endDate: string;
  reason: string;
  employeeId: number;
}

// Interface for Leave of Absence creation
export interface CreateAbsenceRequest {
  startDate: string;
  duration: number;
  durationUnit: string;
  reason: string;
  location: string;
  leaveNotesUrls: string[];
  employeeId: number;
}

// Interface for Sick Leave creation (same as absence)
export interface CreateSickLeaveRequest {
  startDate: string;
  duration: number;
  durationUnit: string;
  reason: string;
  location: string;
  leaveNotesUrls: string[];
  employeeId: number;
}

// Interface for Leave Notes
export interface LeaveNote {
  downloadUrl: string;
  documentId?: string;
  name?: string;
  id: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface LeaveEmployee {
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

export interface LeaveRecord {
  id: number;
  leaveId?: string;
  startDate: string;
  endDate?: string; // Optional for absence leaves
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  location?: string;
  duration: number;
  durationUnit: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  leaveNotes?: LeaveNote[];
  leaveNotesUrls?: string[];
  employee: LeaveEmployee;
}

export interface LeaveApiResponse {
  status: string;
  message: string;
  data: LeaveRecord;
}

export interface LeaveListApiResponse {
  status: string;
  message: string;
  data: LeaveRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private apiService: ApiService) {}

  // Create a new annual leave request
  createAnnualLeave(request: CreateLeaveRequest): Observable<LeaveApiResponse> {
    return this.apiService.post<LeaveApiResponse>(
      environment.routes.leave.create,
      request
    );
  }

  // Create a new leave of absence request
  createAbsenceLeave(
    request: CreateAbsenceRequest
  ): Observable<LeaveApiResponse> {
    return this.apiService.post<LeaveApiResponse>(
      environment.routes.leave.absenceCreate,
      request
    );
  }

  // Create a new sick leave request
  createSickLeave(
    request: CreateSickLeaveRequest
  ): Observable<LeaveApiResponse> {
    return this.apiService.post<LeaveApiResponse>(
      environment.routes.leave.sickCreate,
      request
    );
  }

  // Get all annual leave records
  getAnnualLeaves(): Observable<LeaveListApiResponse> {
    return this.apiService.get<LeaveListApiResponse>(
      environment.routes.leave.getAll
    );
  }

  // Get all leave of absence records
  getAbsenceLeaves(): Observable<LeaveListApiResponse> {
    return this.apiService.get<LeaveListApiResponse>(
      environment.routes.leave.absenceGetAll
    );
  }

  // Get all sick leave records
  getSickLeaves(): Observable<LeaveListApiResponse> {
    return this.apiService.get<LeaveListApiResponse>(
      environment.routes.leave.sickGetAll
    );
  }

  // Filter leaves by employee ID (for non-admin users)
  filterLeavesByEmployee(
    leaves: LeaveRecord[],
    employeeId: number
  ): LeaveRecord[] {
    return leaves.filter((leave) => leave.employee.id === employeeId);
  }

  // Calculate total leave days used by employee for the year (only approved leaves)
  calculateUsedLeaveDays(leaves: LeaveRecord[]): number {
    const approvedLeaves = leaves.filter(
      (leave) => leave.status.toUpperCase() === 'APPROVED'
    );
    const totalUsed = approvedLeaves.reduce(
      (total, leave) => total + leave.duration,
      0
    );

    console.log('Calculating used leave days:', {
      totalLeaves: leaves.length,
      approvedLeaves: approvedLeaves.length,
      totalUsedDays: totalUsed,
      approvedLeavesDetail: approvedLeaves.map((l) => ({
        id: l.id,
        duration: l.duration,
        status: l.status,
        startDate: l.startDate,
      })),
    });

    return totalUsed;
  }

  // Helper method to format date for display
  private formatDateForDisplay(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Get leave history for an employee
  getLeaveHistory(leaves: LeaveRecord[]): any[] {
    return leaves
      .filter((leave) => leave.status.toUpperCase() === 'APPROVED')
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      .slice(0, 5) // Get last 5 approved leaves
      .map((leave) => ({
        dateRange: leave.endDate
          ? `${this.formatDateForDisplay(
              leave.startDate
            )} - ${this.formatDateForDisplay(leave.endDate)}`
          : `${this.formatDateForDisplay(leave.startDate)} (${
              leave.duration
            } ${leave.durationUnit.toLowerCase()})`,
        status: this.transformStatus(leave.status),
        duration: `${leave.duration} ${leave.durationUnit.toLowerCase()}`,
      }));
  }

  // Transform API data for leave-details component (handles both annual and absence leaves)
  transformForLeaveDetails(
    leave: LeaveRecord,
    allUserLeaves: LeaveRecord[] = []
  ): any {
    const totalLeaveDays = leave.type === 'ABSENCE' ? 90 : 30; // 90 days for absence, 30 for annual
    const usedDays = this.calculateUsedLeaveDays(
      allUserLeaves.filter((l) => l.type === leave.type)
    );
    const leaveHistory = this.getLeaveHistory(
      allUserLeaves.filter((l) => l.type === leave.type)
    );

    // Calculate remaining days based on leave status
    let remainingDays: number;
    if (leave.status.toUpperCase() === 'APPROVED') {
      // For approved leaves, show actual remaining days (current leave is already included in usedDays)
      remainingDays = Math.max(0, totalLeaveDays - usedDays);
    } else {
      // For pending/rejected leaves, show actual remaining days (don't subtract current leave)
      remainingDays = Math.max(0, totalLeaveDays - usedDays);
    }

    console.log('Transforming leave details:', {
      currentLeave: {
        id: leave.id,
        duration: leave.duration,
        unit: leave.durationUnit,
        status: leave.status,
        type: leave.type,
      },
      totalAllowance: totalLeaveDays,
      usedDays: usedDays,
      remainingDays: remainingDays,
      calculationMethod:
        leave.status.toUpperCase() === 'APPROVED'
          ? 'approved'
          : 'pending-no-subtraction',
      allUserLeavesCount: allUserLeaves.length,
    });

    // Calculate consistent end date (same logic as table)
    const startDate = new Date(leave.startDate);
    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(startDate.getDate() + (leave.duration - 1));

    return {
      startDate: this.formatDateForDisplay(leave.startDate),
      endDate: this.formatDateForDisplay(calculatedEndDate.toISOString()),
      reason: leave.reason,
      duration: `${leave.duration} ${leave.durationUnit.toLowerCase()}`,
      durationUnit: leave.durationUnit,
      status: this.transformStatus(leave.status),
      substitution: 'N/A',
      location: leave.location || 'N/A',
      requestType: leave.type,
      employeeName: leave.employee.firstName + ' ' + leave.employee.lastName,
      employeeId: leave.employee.employeeId,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt,
      // Current leave request info
      currentLeaveDuration: leave.duration,
      currentLeaveDurationUnit: leave.durationUnit,
      // Leave balance information
      totalLeaveDays: totalLeaveDays,
      usedLeaveDays: usedDays,
      remainingLeaveDays: remainingDays,
      // Leave history
      leaveHistory: leaveHistory,
      // Leave notes for absence leaves
      leaveNotes: leave.leaveNotes || [],
      leaveNotesUrls: leave.leaveNotesUrls || [],
      // Transform leave notes to documents format for template compatibility
      documents: this.transformLeaveNotesToDocuments(leave.leaveNotes || []),
    };
  }

  // Transform API status to proper case for UI display
  private transformStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  // Transform API data to table format
  transformToTableData(leaves: LeaveRecord[]): any[] {
    return leaves.map((leave) => {
      // Calculate end date from start date and duration
      const startDate = new Date(leave.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (leave.duration - 1)); // -1 because the start date counts as day 1

      return {
        id: leave.id.toString(),
        startDate: leave.startDate,
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        duration: `${leave.duration} ${leave.durationUnit.toLowerCase()}`, // Keep duration for details view
        status: this.transformStatus(leave.status), // Transform status to proper case
        reason: leave.reason,
        durationUnit: leave.durationUnit,
        name: `${leave.employee.firstName} ${leave.employee.lastName}`,
        employeeId: leave.employee.employeeId,
        type: leave.type,
        requestType: this.getRequestTypeDisplay(leave.type), // Map ABSENCE to display value
        location: leave.location,
        createdAt: leave.createdAt,
        // Original data for details view
        originalData: leave,
      };
    });
  }

  // Helper method to get display-friendly request type
  private getRequestTypeDisplay(type: string): string {
    switch (type.toUpperCase()) {
      case 'ABSENCE':
        return 'Leave of Absence';
      case 'ANNUAL':
        return 'Annual Leave';
      default:
        return type;
    }
  }

  // Transform leave notes to documents format for template compatibility
  private transformLeaveNotesToDocuments(leaveNotes: LeaveNote[]): any[] {
    return leaveNotes.map((note) => ({
      title: note.name || `Handover Note ${note.id}`,
      type: note.type || 'PDF Document',
      uploadDate: this.formatDateForDisplay(note.createdAt),
      status: 'approved', // Default to approved for existing notes
      downloadUrl: note.downloadUrl,
      documentId: note.documentId || note.id.toString(),
    }));
  }
}
