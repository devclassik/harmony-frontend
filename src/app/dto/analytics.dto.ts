import { ApiResponse } from './common.dto';

export interface DepartmentBreakdown {
  departmentId: number;
  departmentName: string;
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
}

export interface EmploymentTypeBreakdown {
  employmentType: string;
  count: number;
  percentage: number;
}

export interface RecentHire {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  hireDate: string;
  position: string;
}

export interface UpcomingRetirement {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  retirementDate: string;
  yearsOfService: number;
}

export interface LeaveRequestStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalThisMonth: number;
  mostRequestedType: string;
}

export interface PayrollSummary {
  totalPayroll: number;
  averageSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  payrollMonth: string;
}

export interface MonthlyLeaveData {
  month: string;
  SICK: number;
  ABSENCE: number;
  ANNUAL: number;
}

export type LeaveStatistics = MonthlyLeaveData[];

export interface AnalyticsOverview {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentBreakdown: DepartmentBreakdown[];
  employmentTypeBreakdown: EmploymentTypeBreakdown[];
  recentHires: RecentHire[];
  upcomingRetirements: UpcomingRetirement[];
  leaveRequests: LeaveRequestStats;
  payrollSummary: PayrollSummary;
}

export interface GenderBreakdown {
  male: number;
  female: number;
  malePercent: number;
  femalePercent: number;
}

export interface AgeGroups {
  '15-20': number;
  '21-29': number;
  '30-39': number;
  '40-59': number;
  '60-75': number;
  '76-100': number;
}

export interface LocationData {
  city: string | null;
  state: string | null;
  count: string;
}

export interface ServiceYears {
  lessThan15: number;
  between16And30: number;
  between31And45: number;
  greaterThan46: number;
  lessThan15Percent: number;
  between16And30Percent: number;
  between31And45Percent: number;
  greaterThan46Percent: number;
}

export interface EmployeeDemographics {
  gender: GenderBreakdown;
  ageGroups: AgeGroups;
  locations: LocationData[];
  serviceYears: ServiceYears;
}

export type GetAnalyticsOverviewResponse = ApiResponse<AnalyticsOverview>;
export type GetLeaveStatisticsResponse = ApiResponse<LeaveStatistics>;
export type GetEmployeeDemographicsResponse = ApiResponse<EmployeeDemographics>;
