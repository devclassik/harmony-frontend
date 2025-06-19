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
  @Output() close = new EventEmitter<void>();

  openSection: string | null = null;

  get daysRemaining(): number {
    // Calculate days remaining based on leave data
    // This is a simplified calculation - you can make it more sophisticated
    const usedDays = this.calculateUsedDays();
    return this.totalLeaveDays - usedDays;
  }

  get daysTaken(): number {
    if (!this.leaveData.startDate || !this.leaveData.endDate) return 0;

    const startDate = new Date(this.leaveData.startDate);
    const endDate = new Date(this.leaveData.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end date

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
