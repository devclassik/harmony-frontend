export interface GetTransfersResponse {
  status: string;
  message: string;
  data: TransferRecord[];
}

export interface GetTransferDetailResponse {
  status: string;
  message: string;
  data: TransferRecordDetailed;
}

export interface TransferRecord {
  id: number;
  transferId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transferType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
  destination: string;
  newPosition: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: TransferEmployee;
}

export interface TransferRecordDetailed {
  id: number;
  transferId: string | null;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transferType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
  destination: string;
  newPosition: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: TransferEmployee;
  history: any[]; // Can be more specific if history structure is known
}

export interface UpdateTransferRequest {
  status: 'APPROVED' | 'REJECTED';
}

export interface UpdateTransferResponse {
  status: string;
  message: string;
  data: TransferRecord;
}

export interface CreateTransferResponse {
  status: string;
  message: string;
  data: TransferRecord;
}

export interface CreateTransferRequest {
  reason: string;
  employeeId: number;
  newPosition: string;
  destination: string;
  transferType:
    | 'VERBAL'
    | 'WRITTEN'
    | 'SUSPENSION'
    | 'TERMINATION'
    | 'DEMOTION'
    | 'PROMOTION';
}

export interface TransferEmployee {
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
