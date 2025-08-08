export interface CreateRetirementRequest {
  employeeId: number;
  recommendedReplacementId: number;
  reason: string;
  documents: string[];
}

export interface UpdateRetirementStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

// Retirement Employee interface
export interface RetirementEmployee {
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
  departments?: Array<{ id: number; name: string }>;
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

// Basic retirement record
export interface RetirementRecord {
  id: number;
  retirementId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: RetirementEmployee;
  recommendedReplacement: RetirementEmployee;
}

// Detailed retirement record for individual view
export interface RetirementRecordDetailed {
  id: number;
  retirementId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: string[] | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: RetirementEmployee;
  recommendedReplacement: RetirementEmployee;
  history: any[]; // Can be more specific if history structure is known
}

// API Response interfaces
export interface CreateRetirementResponse {
  status: string;
  message: string;
  data: RetirementRecord;
}

export interface UpdateRetirementResponse {
  status: string;
  message: string;
  data: RetirementRecord;
}

export interface GetRetirementsResponse {
  status: string;
  message: string;
  data: RetirementRecord[];
}

export interface GetRetirementDetailResponse {
  status: string;
  message: string;
  data: RetirementRecordDetailed;
}
