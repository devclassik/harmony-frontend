import { ApiResponse } from './common.dto';

export interface NotificationEmployee {
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
}

export interface NotificationItem {
  id: number;
  title: string | null;
  message: string;
  feature: string;
  isRead: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  actionTo: NotificationEmployee[];
  actionBy: NotificationEmployee;
  actionFor: NotificationEmployee;
}

export interface MessageItem {
  id: number;
  title: string | null;
  message: string;
  feature: string;
  isRead: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  actionTo: NotificationEmployee[];
  actionBy: NotificationEmployee;
  actionFor: NotificationEmployee;
}

export type NotificationResponse = ApiResponse<NotificationItem[]>;
export type MessageResponse = ApiResponse<MessageItem[]>;
