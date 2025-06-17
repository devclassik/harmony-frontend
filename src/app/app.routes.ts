import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
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

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'sign-up', component: SignUpComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [roleGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-records',
        component: EmployeeRecordsComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'reporting-and-analytics',
        component: ReportingAndAnalyticsComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-management/promotion',
        component: EmployeePromotionComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-management/discipline',
        component: EmployeeDisciplineComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-management/transfer',
        component: EmployeeTransferComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-management/retirement',
        component: EmployeeRetirementComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'employee-management/retrenchment',
        component: EmployeeRetrenchmentComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'leave-management/annual-leave',
        component: AnnualLeaveComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'leave-management/leave-of-absence',
        component: LeaveOfAbsenceComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'leave-management/sick-leave',
        component: SickLeaveComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'file-index',
        component: IndexOfFileComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'payroll',
        component: PayrollComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'admin',
        component: DashboardComponent,
        canActivate: [roleGuard],
      },
      { path: 'user', component: DashboardComponent, canActivate: [roleGuard] },
    ],
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
