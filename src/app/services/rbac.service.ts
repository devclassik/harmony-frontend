import { Injectable } from '@angular/core';
import {
  ACCESS_CONTROL_CONFIG,
  ROUTE_PERMISSIONS,
} from '../config/access-control.config';
import {
  Role,
  Permission,
  Action,
  MenuItem,
} from '../interfaces/rbac.interface';

@Injectable({
  providedIn: 'root',
})
export class RbacService {
  constructor() {}

  /**
   * Check if a role has permission to perform an action on a resource
   */
  hasPermission(roleName: string, resource: string, action: string): boolean {
    const role = this.getRole(roleName);
    if (!role) return false;

    const permission = role.permissions.find((p) => p.resource === resource);
    if (!permission) return false;

    const actionObj = permission.actions.find((a) => a.name === action);
    return actionObj?.allowed || false;
  }

  /**
   * Check if a role can access a specific route
   */
  canAccessRoute(roleName: string, routePath: string): boolean {
    const routePermission = ROUTE_PERMISSIONS.find((rp) => {
      if (rp.path.endsWith('/*')) {
        const basePath = rp.path.replace('/*', '');
        return routePath.startsWith(basePath);
      }
      return rp.path === routePath;
    });

    if (!routePermission) return true; // Allow access if no specific permission required

    // Check role-based permissions
    if (routePermission.requiredRole) {
      return routePermission.requiredRole.includes(roleName);
    }

    // Check action-based permissions
    if (routePermission.requiredPermissions) {
      return routePermission.requiredPermissions.every((rp) =>
        this.hasPermission(roleName, rp.resource, rp.action)
      );
    }

    return true;
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(roleName: string): Permission[] {
    const role = this.getRole(roleName);
    return role?.permissions || [];
  }

  /**
   * Get role object by name
   */
  getRole(roleName: string): Role | undefined {
    return ACCESS_CONTROL_CONFIG.roles.find((r) => r.name === roleName);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Role[] {
    return ACCESS_CONTROL_CONFIG.roles;
  }

  /**
   * Get all resources a role can access
   */
  getAccessibleResources(roleName: string): string[] {
    const role = this.getRole(roleName);
    if (!role) return [];

    return role.permissions
      .filter((p) => p.actions.some((a) => a.allowed))
      .map((p) => p.resource);
  }

  /**
   * Get menu items that a role can access
   */
  getAccessibleMenuItems(roleName: string): MenuItem[] {
    const menuItems: MenuItem[] = [
      {
        path: '/dashboard',
        resource: 'dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
      },
      {
        path: '/employee-records',
        resource: 'employee-records',
        label: 'Employee Records',
        icon: 'assignment',
      },
      {
        path: '/reporting-and-analytics',
        resource: 'reporting-analytics',
        label: 'Reporting & Analytics',
        icon: 'poll',
      },
      {
        path: '/employee-management',
        resource: 'employee-management',
        label: 'Employee Management',
        icon: 'people',
        children: [
          { path: '/employee-management/promotion', label: 'Promotion' },
          { path: '/employee-management/discipline', label: 'Discipline' },
          { path: '/employee-management/transfer', label: 'Transfer' },
          { path: '/employee-management/retirement', label: 'Retirement' },
          { path: '/employee-management/retrenchment', label: 'Retrenchment' },
        ],
      },
      {
        path: '/leave-management',
        resource: 'leave-management',
        label: 'Leave Management',
        icon: 'event_note',
        children: [
          { path: '/leave-management/annual-leave', label: 'Annual Leave' },
          {
            path: '/leave-management/leave-of-absence',
            label: 'Leave of Absence',
          },
          { path: '/leave-management/sick-leave', label: 'Sick Leave' },
        ],
      },
      {
        path: '/payroll',
        resource: 'payroll',
        label: 'Payroll',
        icon: 'account_balance_wallet',
      },
      {
        path: '/file-index',
        resource: 'file-index',
        label: 'File Index',
        icon: 'folder',
      },
    ];

    return menuItems.filter((item) =>
      this.hasPermission(roleName, item.resource, 'view')
    );
  }

  /**
   * Check if user can perform CRUD operations
   */
  canCreate(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'create');
  }

  canRead(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'read');
  }

  canUpdate(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'update');
  }

  canDelete(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'delete');
  }

  canApprove(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'approve');
  }

  canExport(roleName: string, resource: string): boolean {
    return this.hasPermission(roleName, resource, 'export');
  }
}
