export interface Template {
  id: number;
  templateId: string | null;
  downloadUrl: string;
  type: TemplateType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type TemplateType =
  | 'TRANSFER_APPROVAL'
  | 'TRANSFER_REQUEST'
  | 'TRANSFER_DECLINE'
  | 'SICK_LEAVE_APPROVAL'
  | 'SICK_LEAVE_REQUEST'
  | 'SICK_LEAVE_DECLINE'
  | 'ANNUAL_LEAVE_APPROVAL'
  | 'ANNUAL_LEAVE_REQUEST'
  | 'ANNUAL_LEAVE_DECLINE'
  | 'ABSENCE_LEAVE_APPROVAL'
  | 'ABSENCE_LEAVE_REQUEST'
  | 'ABSENCE_LEAVE_DECLINE'
  | 'PROMOTION_APPROVAL'
  | 'PROMOTION_REQUEST'
  | 'PROMOTION_DECLINE'
  | 'RETIREMENT_APPROVAL'
  | 'RETIREMENT_REQUEST'
  | 'RETIREMENT_DECLINE'
  | 'RETRENCHMENT_APPROVAL'
  | 'RETRENCHMENT_REQUEST'
  | 'RETRENCHMENT_DECLINE'
  | 'DISCIPLINE';

export interface CreateTemplateRequest {
  type: TemplateType;
  downloadUrl: string;
}

export interface UpdateTemplateRequest {
  type: TemplateType;
  downloadUrl: string;
}

export interface TemplateResponse {
  status: string;
  message: string;
  data: Template[];
}
