import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private authService: AuthService) {}

  /**
   * Check if worker has permission for a specific feature and action
   */
  hasPermission(
    feature: string,
    action: 'view' | 'create' | 'edit' | 'delete' = 'view'
  ): boolean {
    return this.authService.hasPermission(feature, action);
  }

  /**
   * Check if worker can access a feature (view permission)
   */
  canAccess(feature: string): boolean {
    return this.authService.canAccessFeature(feature);
  }

  /**
   * Get all permissions for the current worker
   */
  getAllPermissions() {
    return this.authService.getPermissions();
  }

  /**
   * Check if worker can view any employee management features
   */
  canViewEmployeeManagement(): boolean {
    return (
      this.canAccess('Employee') ||
      this.canAccess('Promotion') ||
      this.canAccess('Transfer') ||
      this.canAccess('Retirement') ||
      this.canAccess('Retrenchment') ||
      this.canAccess('Discipline')
    );
  }

  /**
   * Check if worker can view any leave management features
   */
  canViewLeaveManagement(): boolean {
    return this.canAccess('Leave');
  }

  /**
   * Check if worker can view reports
   */
  canViewReports(): boolean {
    return this.canAccess('Report');
  }

  /**
   * Check if worker can view dashboard
   */
  canViewDashboard(): boolean {
    return this.canAccess('Dashboard');
  }

  /**
   * Check if worker can view employee records
   */
  canViewEmployeeRecords(): boolean {
    return this.canAccess('Employee');
  }

  /**
   * Check if worker can view payroll
   */
  canViewPayroll(): boolean {
    return this.canAccess('Payroll');
  }

  /**
   * Check if worker can view accommodations
   */
  canViewAccommodation(): boolean {
    return this.canAccess('Accommodation');
  }

  /**
   * Check if worker can view meetings
   */
  canViewMeeting(): boolean {
    return this.canAccess('Meeting');
  }

  /**
   * Check if worker can view documents
   */
  canViewDocuments(): boolean {
    return this.canAccess('Document');
  }

  /**
   * Check if worker can view notifications
   */
  canViewNotifications(): boolean {
    return this.canAccess('Notification');
  }

  /**
   * Check if worker can view email templates
   */
  canViewEmailTemplates(): boolean {
    return this.canAccess('EmailTemplate');
  }

  /**
   * Check if worker can view departments
   */
  canViewDepartments(): boolean {
    return this.canAccess('Department');
  }

  /**
   * Check if worker can view organization settings
   */
  canViewOrganization(): boolean {
    return this.canAccess('Organization');
  }

  /**
   * Check if worker can view permissions
   */
  canViewPermissions(): boolean {
    return this.canAccess('Permission');
  }

  /**
   * Check multiple permissions at once
   */
  hasAnyPermission(
    features: string[],
    action: 'view' | 'create' | 'edit' | 'delete' = 'view'
  ): boolean {
    return features.some((feature) => this.hasPermission(feature, action));
  }

  /**
   * Check if worker has all specified permissions
   */
  hasAllPermissions(
    features: string[],
    action: 'view' | 'create' | 'edit' | 'delete' = 'view'
  ): boolean {
    return features.every((feature) => this.hasPermission(feature, action));
  }

  /**
   * Get worker's role name
   */
  getWorkerRole(): string | null {
    return this.authService.getWorkerRole();
  }

  /**
   * Check if worker is logged in
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
