export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Permission {
  id: number;
  feature: string;
  label: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UserRole {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  permissions: Permission[];
}
