import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { permissionGuard } from './guards/permission.guard';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './auth/login/login.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { EmployeeRecordsComponent } from './pages/employee-records/employee-records.component';
import { ReportingAndAnalyticsComponent } from './pages/reporting-and-analytics/reporting-and-analytics.component';
import { EmployeePromotionComponent } from './pages/employee-promotion/employee-promotion.component';
import { EmployeeDisciplineComponent } from './pages/employee-discipline/employee-discipline.component';
import { EmployeeTransferComponent } from './pages/employee-transfer/employee-transfer.component';
import { EmployeeRetirementComponent } from './pages/employee-retirement/employee-retirement.component';
import { EmployeeRetrenchmentComponent } from './pages/employee-retrenchment/employee-retrenchment.component';
import { AnnualLeaveComponent } from './pages/annual-leave/annual-leave.component';
import { LeaveOfAbsenceComponent } from './pages/leave-of-absence/leave-of-absence.component';
import { SickLeaveComponent } from './pages/sick-leave/sick-leave.component';
import { IndexOfFileComponent } from './pages/index-of-file/index-of-file.component';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { CampMeetingComponent } from './pages/camp-meeting/camp-meeting.component';
import { InboxComponent } from './pages/inbox/inbox.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileCreateComponent } from './pages/profile-create/profile-create.component';
import { ProfileViewComponent } from './pages/profile-view/profile-view.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        canActivate: [guestGuard],
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [permissionGuard('Dashboard')],
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard], // Profile access for all authenticated users
      },
      {
        path: 'profile/create',
        component: ProfileCreateComponent,
        canActivate: [authGuard], // Profile creation for all authenticated users
      },
      {
        path: 'profile-view',
        component: ProfileViewComponent,
        canActivate: [authGuard], // Profile view for all authenticated users
      },
      {
        path: 'employee-records',
        component: EmployeeRecordsComponent,
        canActivate: [permissionGuard('Employee')],
      },
      {
        path: 'reporting-and-analytics',
        component: ReportingAndAnalyticsComponent,
        canActivate: [permissionGuard('Report')],
      },
      {
        path: 'employee-management/promotion',
        component: EmployeePromotionComponent,
        canActivate: [permissionGuard('Promotion')],
      },
      {
        path: 'employee-management/discipline',
        component: EmployeeDisciplineComponent,
        canActivate: [permissionGuard('Discipline')],
      },
      {
        path: 'employee-management/transfer',
        component: EmployeeTransferComponent,
        canActivate: [permissionGuard('Transfer')],
      },
      {
        path: 'employee-management/retirement',
        component: EmployeeRetirementComponent,
        canActivate: [permissionGuard('Retirement')],
      },
      {
        path: 'employee-management/retrenchment',
        component: EmployeeRetrenchmentComponent,
        canActivate: [permissionGuard('Retrenchment')],
      },
      {
        path: 'leave-management/annual-leave',
        component: AnnualLeaveComponent,
        canActivate: [permissionGuard('Leave')],
      },
      {
        path: 'leave-management/leave-of-absence',
        component: LeaveOfAbsenceComponent,
        canActivate: [permissionGuard('Leave')],
      },
      {
        path: 'leave-management/sick-leave',
        component: SickLeaveComponent,
        canActivate: [permissionGuard('Leave')],
      },
      {
        path: 'file-index',
        component: IndexOfFileComponent,
        canActivate: [permissionGuard('Document')],
      },
      {
        path: 'payroll',
        component: PayrollComponent,
        canActivate: [permissionGuard('Payroll')],
      },
      {
        path: 'camp-meeting',
        component: CampMeetingComponent,
        canActivate: [permissionGuard('Meeting')],
      },
      {
        path: 'inbox',
        component: InboxComponent,
        canActivate: [authGuard], // Inbox access for all authenticated users
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [authGuard], // Notifications access for all authenticated users
      },
      {
        path: 'admin',
        component: DashboardComponent,
        canActivate: [permissionGuard('Dashboard')],
      },
      {
        path: 'user',
        component: DashboardComponent,
        canActivate: [permissionGuard('Dashboard')],
      },
    ],
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
