import { ApiResponse, Permission, Department } from './common.dto';

export interface Address {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permissions: Permission[];
}

export interface WorkerInfo {
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
  role: Role;
}

export interface Spouse {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string;
  dob: string;
  occupation: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Payroll {
  id: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Document {
  id: number;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Credential {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DepartmentHead {
  id: number;
  departmentId: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PreviousPosition {
  id: number;
  title: string;
  department: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SpiritualHistory {
  id: number;
  baptismDate: string | null;
  baptismLocation: string | null;
  confirmationDate: string | null;
  confirmationLocation: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EmployeeDetails {
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
  user: WorkerInfo | null;
  spouse: Spouse | null;
  children: Child[];
  payrolls: Payroll[];
  documents: Document[];
  credentials: Credential[];
  departments: Department[];
  homeAddress: Address | null;
  mailingAddress: Address | null;
  departmentHeads: DepartmentHead[];
  previousPositions: PreviousPosition[];
  spiritualHistory: SpiritualHistory | null;
}

export type GetEmployeeResponse = ApiResponse<EmployeeDetails>;

export interface CreateEmployeeRequest {
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
  everDivorced?: boolean;
  beenConvicted?: boolean;
  hasQuestionableBackground?: boolean;
  hasBeenInvestigatedForMisconductOrAbuse?: boolean;
  photoUrl?: string;
  altEmail?: string;
  employeeStatus?: string;
  employmentType?: string;
  serviceStartDate?: string;
}

export interface UpdateEmployeeRequest {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  role?: string;
  employmentType?: string;
  location?: string;
  title?: string;
  middleName?: string;
  gender?: string;
  profferedName?: string;
  primaryPhone?: string;
  primaryPhoneType?: string;
  altPhone?: string;
  altPhoneType?: string;
  dob?: string;
  photoUrl?: string;
  altEmail?: string;
  maritalStatus?: string;
  everDivorced?: boolean;
  employeeStatus?: string;
  beenConvicted?: boolean;
  hasQuestionableBackground?: boolean;
  hasBeenInvestigatedForMisconductOrAbuse?: boolean;
  previousChurchPositions?: string[];
  homeAddress?: string;
  homeCity?: string;
  homeState?: string;
  homeCountry?: string;
  homeZipCode?: string;
  mailingAddress?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingCountry?: string;
  mailingZipCode?: string;
  spouseFirstName?: string;
  spouseMiddleName?: string;
  spouseDob?: string;
  weddingDate?: string;
  children?: Array<{
    childName: string;
    childDob: string;
    childGender: string;
  }>;
  yearSaved?: string;
  sanctified?: boolean;
  baptizedWithWater?: boolean;
  yearOfWaterBaptism?: string;
  firstYearInChurch?: string;
  isFaithfulInTithing?: boolean;
  firstSermonPastor?: string;
  currentPastor?: string;
  dateOfFirstSermon?: string;
  spiritualStatus?: string;
  firstSermonAddress?: string;
  firstSermonCity?: string;
  firstSermonState?: string;
  firstSermonCountry?: string;
  firstSermonZipCode?: string;
  currentChurchAddress?: string;
  currentChurchCity?: string;
  currentChurchState?: string;
  currentChurchCountry?: string;
  currentChurchZipCode?: string;
  credentialName?: string;
  credentialNumber?: string;
  credentialIssuedDate?: string;
  credentialExpirationDate?: string;
}

export type CreateEmployeeResponse = ApiResponse<EmployeeDetails>;
export type UpdateEmployeeResponse = ApiResponse<EmployeeDetails>;
