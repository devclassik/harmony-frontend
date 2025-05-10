export interface TableData {
  id: string;
  name: string;
  department?: string;
  role?: string;
  status?: 'Active' | 'On leave' | 'Retired' | 'On Discipline' | 'Approved' | 'Pending' | 'Rejected';
  imageUrl?: string;
  disciplineType?: 'Suspension' | 'Warning';
  offenseCategory?: string;
  disciplineDuration?: string;
} 