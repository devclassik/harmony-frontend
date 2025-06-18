import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

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

  isExpanded = true;
  settingsOpen = false;
  employeeManagement = false;
  leaveManagement = false;

  constructor(
    private authService: AuthService,
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

  // Role-based visibility methods
  canViewEmployeeRecords(): boolean {
    return ['admin', 'hr'].includes(this.userRole || '');
  }

  canViewReportingAnalytics(): boolean {
    return ['admin', 'hr', 'manager'].includes(this.userRole || '');
  }

  canViewEmployeeManagement(): boolean {
    return ['admin', 'hr'].includes(this.userRole || '');
  }

  canViewLeaveManagement(): boolean {
    return ['admin', 'hr', 'manager', 'user'].includes(this.userRole || '');
  }

  canViewFileIndex(): boolean {
    return ['admin', 'hr', 'user'].includes(this.userRole || '');
  }

  canViewPayroll(): boolean {
    return ['admin', 'hr'].includes(this.userRole || '');
  }

  canViewCalendar(): boolean {
    return ['admin', 'hr', 'manager'].includes(this.userRole || '');
  }

  canViewSettings(): boolean {
    return ['admin', 'hr', 'manager'].includes(this.userRole || '');
  }
}
