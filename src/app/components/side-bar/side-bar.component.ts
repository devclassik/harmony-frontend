import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Input,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ConfirmPromptComponent } from '../confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-side-bar',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
    ConfirmPromptComponent,
  ],
  templateUrl: './side-bar.component.html',
})
export class SideBarComponent implements OnInit {
  @Input() sidebarToggle = false;
  selected = 'Dashboard';
  page: string = '';
  showLogoutConfirm = false;

  userRole: string | null;

  isExpanded = true;
  settingsOpen = false;
  employeeManagement = false;
  leaveManagement = false;

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private el: ElementRef
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit() {
    const persisted = localStorage.getItem('selected');
    if (persisted) {
      this.selected = persisted;
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    // Only handle click outside on mobile screens (below lg breakpoint)
    // On desktop, the sidebar should only be toggled by the toggle button
    if (window.innerWidth < 1024) {
      // lg breakpoint in Tailwind is 1024px
      const target = event.target as Element;
      if (!this.el.nativeElement.contains(target)) {
        this.sidebarToggle = false;
      }
    }
  }

  onClickOutside(event: MouseEvent) {
    // Optional: prevent propagation if needed
    event.stopPropagation();
  }

  toggleSidebar() {
    this.sidebarToggle = !this.sidebarToggle;
  }

  logout() {
    this.showLogoutConfirm = true;
  }

  onLogoutConfirmed() {
    this.authService.logout();
    this.showLogoutConfirm = false;
  }

  onLogoutCancelled() {
    this.showLogoutConfirm = false;
  }

  toggleSettingsMenu() {
    this.settingsOpen = !this.settingsOpen;
  }

  toggleEmployeeMenu() {
    this.employeeManagement = !this.employeeManagement;
  }

  toggleLeaveMenu() {
    this.leaveManagement = !this.leaveManagement;
  }

  setSelected(menu: string) {
    this.selected = menu;
    localStorage.setItem('selected', menu);
  }

  onSelect(menu: string) {
    this.selected = menu;
  }

  isEmployeeChildActive(): boolean {
    return [
      '/employee-management/promotion',
      '/employee-management/discipline',
      '/employee-management/transfer',
      '/employee-management/retirement',
      '/employee-management/retrenchment',
    ].some((path) => this.router.isActive(path, false));
  }

  isEmployeeLeaveChildActive(): boolean {
    return [
      '/leave-management/annual-leave',
      '/leave-management/leave-of-absence',
      '/leave-management/sick-leave',
    ].some((path) => this.router.isActive(path, false));
  }

  // Permission-based visibility methods using PermissionService
  canViewDashboard(): boolean {
    return this.permissionService.canViewDashboard();
  }

  canViewEmployeeRecords(): boolean {
    return this.permissionService.canViewEmployeeRecords();
  }

  canViewReportingAnalytics(): boolean {
    return this.permissionService.canViewReports();
  }

  canViewEmployeeManagement(): boolean {
    return this.permissionService.canViewEmployeeManagement();
  }

  canViewLeaveManagement(): boolean {
    return this.permissionService.canViewLeaveManagement();
  }

  canViewFileIndex(): boolean {
    return this.permissionService.canViewDocuments();
  }

  canViewPayroll(): boolean {
    return this.permissionService.canViewPayroll();
  }

  canViewCalendar(): boolean {
    return this.permissionService.canViewMeeting();
  }

  canViewSettings(): boolean {
    return (
      this.permissionService.canViewOrganization() ||
      this.permissionService.canViewDepartments() ||
      this.permissionService.canViewPermissions()
    );
  }

  canViewCampMeeting(): boolean {
    return this.permissionService.canViewMeeting();
  }

  canViewNotifications(): boolean {
    return this.permissionService.canViewNotifications();
  }

  canViewAccommodation(): boolean {
    return this.permissionService.canViewAccommodation();
  }

  // Individual employee management permissions
  canViewPromotion(): boolean {
    return this.permissionService.canAccess('Promotion');
  }

  canViewTransfer(): boolean {
    return this.permissionService.canAccess('Transfer');
  }

  canViewRetirement(): boolean {
    return this.permissionService.canAccess('Retirement');
  }

  canViewRetrenchment(): boolean {
    return this.permissionService.canAccess('Retrenchment');
  }

  canViewDiscipline(): boolean {
    return this.permissionService.canAccess('Discipline');
  }

  // Action-based permissions for components that need create/edit/delete
  canCreateEmployee(): boolean {
    return this.permissionService.hasPermission('Employee', 'create');
  }

  canEditEmployee(): boolean {
    return this.permissionService.hasPermission('Employee', 'edit');
  }

  canDeleteEmployee(): boolean {
    return this.permissionService.hasPermission('Employee', 'delete');
  }

  canCreateLeave(): boolean {
    return this.permissionService.hasPermission('Leave', 'create');
  }

  canEditLeave(): boolean {
    return this.permissionService.hasPermission('Leave', 'edit');
  }

  canDeleteLeave(): boolean {
    return this.permissionService.hasPermission('Leave', 'delete');
  }
}
