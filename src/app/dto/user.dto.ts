import { Department, UserRole } from './common.dto';

export interface User {
  name: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Employee {
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
  departments: Department[];
}

export interface UserData {
  email: string;
  role: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  employee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    title: string | null;
    middleName: string | null;
    gender: string | null;
    profferedName: string | null;
    primaryPhone: string | null;
    primaryPhoneType: string | null;
    altPhone: string | null;
    altPhoneType: string | null;
    dob: string | null;
    maritalStatus: string | null;
    photoUrl: string | null;
    altEmail: string | null;
    employeeStatus: string | null;
    employmentType: string | null;
    serviceStartDate: string | null;
    retiredDate: string | null;
    id: number;
    everDivorced: boolean;
    beenConvicted: boolean;
    hasQuestionableBackground: boolean;
    hasBeenInvestigatedForMisconductOrAbuse: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  isEmailVerified: boolean;
  isLoggedIn: boolean;
}

export interface UserOTP {
  id: number;
  email: string;
  password?: string;
  verifyEmailOTP: string;
  isEmailVerified: boolean;
  passwordResetOTP: string | null;
  isLoggedIn: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  employee: Employee;
  role: UserRole;
}
