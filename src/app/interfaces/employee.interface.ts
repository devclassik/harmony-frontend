export interface TableData {
  id: string;
  name: string;
  department?: string;
  role: string;
  status: 'Active' | 'On leave' | 'Retired' | 'On Discipline';
  imageUrl?: string;
} 