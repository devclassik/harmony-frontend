import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
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

export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'sign-up', component: SignUpComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    {
        path: '', 
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'employee-records', component: EmployeeRecordsComponent },
            { path: 'reporting-and-analytics', component: ReportingAndAnalyticsComponent },
            { path: 'employee-management/promotion', component: EmployeePromotionComponent },
            { path: 'employee-management/discipline', component: EmployeeDisciplineComponent },
            { path: 'employee-management/transfer', component: EmployeeTransferComponent },
            { path: 'employee-management/retirement', component: EmployeeRetirementComponent },
            { path: 'employee-management/retrenchment', component: EmployeeRetrenchmentComponent },
            { path: 'leave-management/annual-leave', component: AnnualLeaveComponent },
            { path: 'leave-management/leave-of-absence', component: LeaveOfAbsenceComponent },
            { path: 'leave-management/sick-leave', component: SickLeaveComponent },
            { path: 'admin', component: DashboardComponent },
            { path: 'user', component: DashboardComponent },
        ]
    },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '404' },
];
