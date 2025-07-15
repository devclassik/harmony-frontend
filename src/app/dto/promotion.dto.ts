export interface CreatePromotionRequest {
  employeeId: number;
  newPosition: string;
}

export interface UpdatePromotionStatusRequest {
  status: 'APPROVED' | 'REJECTED';
}

export interface PromotionEmployee {
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

export interface PromotionRecord {
  id: number;
  promotionId: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  newPosition: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: PromotionEmployee;
}

export interface CreatePromotionResponse {
  status: string;
  message: string;
  data: PromotionRecord;
}

export interface UpdatePromotionResponse {
  status: string;
  message: string;
  data: PromotionRecord;
}

export interface GetPromotionsResponse {
  status: string;
  message: string;
  data: PromotionRecord[];
}
