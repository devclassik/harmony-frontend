export interface Permission {
  resource: string;
  actions: Action[];
}

export interface Action {
  name: 'create' | 'read' | 'update' | 'delete' | 'view' | 'export' | 'approve';
  allowed: boolean;
}

export interface Role {
  name: string;
  displayName: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AccessControlConfig {
  roles: Role[];
  resources: string[];
  defaultRole: string;
}

export interface RoutePermission {
  path: string;
  requiredRole?: string[];
  requiredPermissions?: {
    resource: string;
    action: string;
  }[];
}

export interface MenuItem {
  path: string;
  resource: string;
  label: string;
  icon: string;
  children?: MenuItemChild[];
}

export interface MenuItemChild {
  path: string;
  label: string;
}
