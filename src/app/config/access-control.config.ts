import {
  AccessControlConfig,
  RoutePermission,
} from '../interfaces/rbac.interface';

export const ACCESS_CONTROL_CONFIG: AccessControlConfig = {
  defaultRole: 'guest',
  resources: [
    'dashboard',
    'employee-records',
    'employee-management',
    'leave-management',
    'reporting-analytics',
    'payroll',
    'file-index',
    'admin-settings',
  ],
  roles: [
    {
      name: 'guest',
      displayName: 'Guest',
      permissions: [
        {
          resource: 'dashboard',
          actions: [{ name: 'view', allowed: false }],
        },
      ],
    },
    {
      name: 'user',
      displayName: 'User',
      permissions: [
        {
          resource: 'dashboard',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
          ],
        },
        {
          resource: 'employee-records',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: false },
            { name: 'update', allowed: false },
            { name: 'delete', allowed: false },
          ],
        },
        {
          resource: 'leave-management',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: false },
            { name: 'delete', allowed: false },
          ],
        },
        {
          resource: 'employee-management',
          actions: [
            { name: 'view', allowed: false },
            { name: 'read', allowed: false },
            { name: 'create', allowed: false },
            { name: 'update', allowed: false },
            { name: 'delete', allowed: false },
          ],
        },
        {
          resource: 'reporting-analytics',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'export', allowed: false },
          ],
        },
        {
          resource: 'payroll',
          actions: [
            { name: 'view', allowed: false },
            { name: 'read', allowed: false },
          ],
        },
        {
          resource: 'admin-settings',
          actions: [{ name: 'view', allowed: false }],
        },
      ],
    },
    {
      name: 'manager',
      displayName: 'Manager',
      permissions: [
        {
          resource: 'dashboard',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
          ],
        },
        {
          resource: 'employee-records',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: false },
          ],
        },
        {
          resource: 'employee-management',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: false },
            { name: 'approve', allowed: true },
          ],
        },
        {
          resource: 'leave-management',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: false },
            { name: 'approve', allowed: true },
          ],
        },
        {
          resource: 'reporting-analytics',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'export', allowed: true },
          ],
        },
        {
          resource: 'payroll',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: false },
            { name: 'update', allowed: false },
          ],
        },
        {
          resource: 'admin-settings',
          actions: [{ name: 'view', allowed: false }],
        },
      ],
    },
    {
      name: 'admin',
      displayName: 'Administrator',
      permissions: [
        {
          resource: 'dashboard',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
          ],
        },
        {
          resource: 'employee-records',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
          ],
        },
        {
          resource: 'employee-management',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
            { name: 'approve', allowed: true },
          ],
        },
        {
          resource: 'leave-management',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
            { name: 'approve', allowed: true },
          ],
        },
        {
          resource: 'reporting-analytics',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'export', allowed: true },
          ],
        },
        {
          resource: 'payroll',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
          ],
        },
        {
          resource: 'file-index',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
          ],
        },
        {
          resource: 'admin-settings',
          actions: [
            { name: 'view', allowed: true },
            { name: 'read', allowed: true },
            { name: 'create', allowed: true },
            { name: 'update', allowed: true },
            { name: 'delete', allowed: true },
          ],
        },
      ],
    },
  ],
};

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    path: '/dashboard',
    requiredPermissions: [{ resource: 'dashboard', action: 'view' }],
  },
  {
    path: '/employee-records',
    requiredPermissions: [{ resource: 'employee-records', action: 'view' }],
  },
  {
    path: '/employee-management/*',
    requiredPermissions: [{ resource: 'employee-management', action: 'view' }],
  },
  {
    path: '/leave-management/*',
    requiredPermissions: [{ resource: 'leave-management', action: 'view' }],
  },
  {
    path: '/reporting-and-analytics',
    requiredPermissions: [{ resource: 'reporting-analytics', action: 'view' }],
  },
  {
    path: '/payroll',
    requiredPermissions: [{ resource: 'payroll', action: 'view' }],
  },
  {
    path: '/file-index',
    requiredPermissions: [{ resource: 'file-index', action: 'view' }],
  },
];
