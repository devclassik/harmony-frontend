export interface CreateDisciplineRequest {
  reason: string;
  duration: number;
  employeeId: number;
  durationUnit: 'DAYS' | 'WEEKS' | 'MONTHS';
  disciplineType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
}

export interface UpdateDisciplineStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

// Basic employee info from discipline response
export interface DisciplineEmployee {
  id: number;
  employeeId: string;
  title: string;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: string;
  profferedName: string;
  primaryPhone: string;
  primaryPhoneType: string;
  altPhone: string;
  altPhoneType: string;
  dob: string;
  maritalStatus: string;
  everDivorced: boolean;
  beenConvicted: boolean;
  hasQuestionableBackground: boolean;
  hasBeenInvestigatedForMisconductOrAbuse: boolean;
  photoUrl: string;
  altEmail: string;
  employeeStatus: string;
  employmentType: string;
  serviceStartDate: string | null;
  retiredDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  nationIdNumber: string | null;
  user?: {
    id: number;
    email: string;
    password: string;
    verifyEmailOTP: string;
    isEmailVerified: boolean;
    passwordResetOTP: string | null;
    isLoggedIn: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

// Basic discipline record for list view
export interface DisciplineRecord {
  id: number;
  disciplineId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  disciplineType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
  duration: number;
  durationUnit: 'DAYS' | 'WEEKS' | 'MONTHS';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: DisciplineEmployee;
}

// Detailed discipline record for individual view (with history)
export interface DisciplineRecordDetailed {
  id: number;
  disciplineId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  disciplineType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
  duration: number;
  durationUnit: 'DAYS' | 'WEEKS' | 'MONTHS';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: DisciplineEmployee;
  history: any[]; // Can be more specific if history structure is known
}

// Response interfaces
export interface CreateDisciplineResponse {
  status: string;
  message: string;
  data: DisciplineRecord;
}

export interface UpdateDisciplineResponse {
  status: string;
  message: string;
  data: DisciplineRecord;
}

export interface GetDisciplinesResponse {
  status: string;
  message: string;
  data: DisciplineRecord[];
}

export interface GetDisciplineDetailResponse {
  status: string;
  message: string;
  data: DisciplineRecordDetailed;
}

// Helper types for form validation and display
export type DisciplineType =
  | 'VERBAL'
  | 'WRITTEN'
  | 'SUSPENSION'
  | 'TERMINATION'
  | 'DEMOTION'
  | 'PROMOTION';
export type DurationUnit = 'DAYS' | 'WEEKS' | 'MONTHS';
export type DisciplineStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Discipline type options for dropdowns
export interface DisciplineTypeOption {
  label: string;
  value: DisciplineType;
}

export interface DurationUnitOption {
  label: string;
  value: DurationUnit;
}
