import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
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
            { 
                path: 'login', 
                component: LoginComponent,
                canActivate: [guestGuard]
            },
            { 
                path: 'sign-up', 
                component: SignUpComponent,
                canActivate: [guestGuard]
            },
            { 
                path: 'forgot-password', 
                component: ForgotPasswordComponent,
                canActivate: [guestGuard]
            },
            { 
                path: 'reset-password', 
                component: ResetPasswordComponent,
                canActivate: [guestGuard]
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },
    {
        path: '', 
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { 
                path: 'employee-records', 
                component: EmployeeRecordsComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'reporting-and-analytics', 
                component: ReportingAndAnalyticsComponent,
                canActivate: [roleGuard(['admin', 'hr', 'manager'])]
            },
            { 
                path: 'employee-management/promotion', 
                component: EmployeePromotionComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'employee-management/discipline', 
                component: EmployeeDisciplineComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'employee-management/transfer', 
                component: EmployeeTransferComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'employee-management/retirement', 
                component: EmployeeRetirementComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'employee-management/retrenchment', 
                component: EmployeeRetrenchmentComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'leave-management/annual-leave', 
                component: AnnualLeaveComponent,
                canActivate: [roleGuard(['admin', 'hr', 'manager'])]
            },
            { 
                path: 'leave-management/leave-of-absence', 
                component: LeaveOfAbsenceComponent,
                canActivate: [roleGuard(['admin', 'hr', 'manager'])]
            },
            { 
                path: 'leave-management/sick-leave', 
                component: SickLeaveComponent,
                canActivate: [roleGuard(['admin', 'hr', 'manager'])]
            },
            { 
                path: 'file-index', 
                component: IndexOfFileComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'payroll', 
                component: PayrollComponent,
                canActivate: [roleGuard(['admin', 'hr'])]
            },
            { 
                path: 'admin', 
                component: DashboardComponent,
                canActivate: [roleGuard(['admin'])]
            },
            { 
                path: 'user', 
                component: DashboardComponent,
                canActivate: [roleGuard(['user'])]
            },
        ]
    },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '404' },
];
