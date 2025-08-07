// Department interfaces
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
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  hod: Employee;
  members: Employee[];
}

// API Response interfaces
export interface GetDepartmentsResponse {
  status: 'success' | 'error';
  message: string;
  data: Department[];
}

export interface CreateDepartmentResponse {
  status: 'success' | 'error';
  message: string;
  data: Department;
}

export interface UpdateDepartmentResponse {
  status: 'success' | 'error';
  message: string;
  data: Department;
}

export interface DeleteDepartmentResponse {
  status: 'success' | 'error';
  message: string;
}

// API Request interfaces
export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
