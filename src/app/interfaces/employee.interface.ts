export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On leave' | 'Retired' | 'On Discipline';
  imageUrl?: string;
} 