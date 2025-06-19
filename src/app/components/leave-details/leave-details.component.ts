import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leave-details.component.html',
  styleUrl: './leave-details.component.css',
})
export class LeaveDetailsComponent {
  @Input() view: boolean = false;
  @Input() leaveData: any = {};
  @Input() title: string = 'Leave Details';
  @Input() leaveType: string = 'Leave';
  @Input() totalLeaveDays: number = 30;
  @Input() showRequestType: boolean = false;
  @Input() showDuration: boolean = false;
  @Input() showLocation: boolean = false;
  @Input() showEndDate: boolean = true;
  @Input() showSubstitution: boolean = true;
  @Output() close = new EventEmitter<void>();

  openSection: string | null = null;

  get daysRemaining(): number {
    // Calculate days remaining based on leave data
    // This is a simplified calculation - you can make it more sophisticated
    const usedDays = this.calculateUsedDays();
    return this.totalLeaveDays - usedDays;
  }

  get daysTaken(): number {
    if (
      !this.leaveData.startDate ||
      (!this.leaveData.endDate && !this.leaveData.duration)
    )
      return 0;

    if (this.leaveData.duration) {
      // Parse duration like "1 Week", "2 Months", etc.
      const durationStr = this.leaveData.duration.toLowerCase();
      const match = durationStr.match(/(\d+)\s*(day|week|month|year)s?/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        switch (unit) {
          case 'day':
            return value;
          case 'week':
            return value * 7;
          case 'month':
            return value * 30;
          case 'year':
            return value * 365;
          default:
            return 0;
        }
      }
      return 0;
    }

    // Fallback to date calculation
    const startDate = new Date(this.leaveData.startDate);
    const endDate = new Date(this.leaveData.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff;
  }

  private calculateUsedDays(): number {
    // For now, we'll use the current leave request days
    // In a real app, you'd sum all approved leave requests for the year
    return this.daysTaken;
  }

  onClose() {
    this.close.emit();
  }
}
