export interface CreateRetrenchmentRequest {
  employeeId: number;
  reason: string;
  retrenchmentType:
    | 'PASTOR'
    | 'SENIOR_PASTOR'
    | 'CLEANER'
    | 'HOD'
    | 'WORKER'
    | 'MINISTER'
    | 'OVERSEER';
}

export interface UpdateRetrenchmentStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

// Retrenchment Employee interface
export interface RetrenchmentEmployee {
  id: number;
  employeeId: string;
  title: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string | null;
  profferedName: string | null;
  primaryPhone: string | null;
  primaryPhoneType: string | null;
  altPhone: string | null;
  altPhoneType: string | null;
  dob: string | null;
  maritalStatus: string | null;
  everDivorced: boolean;
  beenConvicted: boolean;
  hasQuestionableBackground: boolean;
  hasBeenInvestigatedForMisconductOrAbuse: boolean;
  photoUrl: string | null;
  altEmail: string | null;
  employeeStatus: string | null;
  employmentType: string | null;
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

// Basic retrenchment record
export interface RetrenchmentRecord {
  id: number;
  retrenchmentId: string | null;
  retrenchmentType:
    | 'PASTOR'
    | 'SENIOR_PASTOR'
    | 'CLEANER'
    | 'HOD'
    | 'WORKER'
    | 'MINISTER'
    | 'OVERSEER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: RetrenchmentEmployee;
}

// Detailed retrenchment record for individual view
export interface RetrenchmentRecordDetailed {
  id: number;
  retrenchmentId: string | null;
  retrenchmentType:
    | 'PASTOR'
    | 'SENIOR_PASTOR'
    | 'CLEANER'
    | 'HOD'
    | 'WORKER'
    | 'MINISTER'
    | 'OVERSEER';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: RetrenchmentEmployee;
  history: any[]; // Can be more specific if history structure is known
}

// API Response interfaces
export interface CreateRetrenchmentResponse {
  status: string;
  message: string;
  data: RetrenchmentRecord;
}

export interface UpdateRetrenchmentResponse {
  status: string;
  message: string;
  data: RetrenchmentRecord;
}

export interface GetRetrenchmentsResponse {
  status: string;
  message: string;
  data: RetrenchmentRecord[];
}

export interface GetRetrenchmentDetailResponse {
  status: string;
  message: string;
  data: RetrenchmentRecordDetailed;
}
