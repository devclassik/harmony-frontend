import { DisciplineType } from '../dto/discipline.dto';

export interface TableData {
  id: string;
  name?: string;
  accommodationName?: string;
  accommodationType?: string;
  accommodationRoomCount?: string;
  email?: string;
  department?: string;
  role?: string;
  status?:
    | 'Active'
    | 'On leave'
    | 'Retired'
    | 'On Discipline'
    | 'Approved'
    | 'Pending'
    | 'Rejected'
    | 'Assigned'
    | 'Unassigned';
  imageUrl?: string;
  disciplineType?: DisciplineType | string;
  originalDisciplineType?: DisciplineType;
  offenseCategory?: string;
  disciplineDuration?: string;
  transferType?: string;
  destination?: string;
  requestDate?: string;
  retrenchmentType?: string;
  startDate?: string;
  endDate?: string;
  requestType?: string;
  duration?: string;
  location?: string;
  substitution?: string;
  date?: string;
  documentType?: string;
  documentName?: string;
  reason?: string;
  downloadUrl?: string;
  templateType?: string;
  // Notification properties
  isRead?: boolean;
  type?: string;
  message?: string;
  targetWorker?: string;
  timestamp?: string;
  worker?: {
    name: string;
    image: string;
  };
  features?: string; // For storing comma-separated features list
  originalData?: any; // For storing original employee data
}

export interface EmployeeInfo {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  title: string;
  preferredName: string;
  gender: string;
  profileImage: string;
  status: 'Active' | 'On leave' | 'Retired' | 'On Discipline';
  department?: string;
  location?: string;
  email?: string;
  role?: string;
}
