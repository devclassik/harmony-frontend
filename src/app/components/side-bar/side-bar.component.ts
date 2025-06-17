import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RbacService } from '../../services/rbac.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from '../../interfaces/rbac.interface';

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
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent implements OnInit {
  sidebarToggle = false;
  selected = 'Dashboard';
  page: string = '';

  userRole: string | null;
  accessibleMenuItems: MenuItem[] = [];

  isExpanded = true;
  settingsOpen = false;
  employeeManagement = false;
  leaveManagement = false;

  constructor(
    private authService: AuthService,
    private rbacService: RbacService,
    private router: Router,
    private el: ElementRef
  ) {
    this.userRole = this.authService.getUserRole();
    this.loadAccessibleMenuItems();
  }

  ngOnInit() {
    const persisted = localStorage.getItem('selected');
    if (persisted) {
      this.selected = persisted;
    }
  }

  private loadAccessibleMenuItems() {
    if (this.userRole) {
      this.accessibleMenuItems = this.rbacService.getAccessibleMenuItems(
        this.userRole
      );
    }
  }

  // Check if user can access a specific menu item
  canAccessMenu(resource: string): boolean {
    return this.userRole
      ? this.rbacService.hasPermission(this.userRole, resource, 'view')
      : false;
  }

  // Check if user can access employee management features
  canAccessEmployeeManagement(): boolean {
    return this.canAccessMenu('employee-management');
  }

  // Check if user can access leave management features
  canAccessLeaveManagement(): boolean {
    return this.canAccessMenu('leave-management');
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.sidebarToggle = false;
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
    this.authService.logout();
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
}
