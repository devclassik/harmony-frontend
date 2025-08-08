import { ApiResponse } from './common.dto';

export interface AppraisalScore {
  criterial: 'ATTENDANCE' | 'EVANGELISM' | 'VOLUNTARY_WORK';
  score: number;
}

export interface CreateAppraisalRequest {
  startDate: string;
  endDate: string;
  averageScore: number;
  scores: AppraisalScore[];
}

export interface AppraisalScoreResponse {
  score: number;
  criterial: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AppraisalEmployee {
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
}

export interface AppraisalData {
  averageScore: number;
  startDate: string;
  endDate: string;
  employee: AppraisalEmployee;
  scores: AppraisalScoreResponse[];
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateAppraisalResponse = ApiResponse<AppraisalData>;
