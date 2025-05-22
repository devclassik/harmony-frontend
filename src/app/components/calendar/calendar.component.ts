import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type CalendarView = 'Weekly' | 'Monthly' | 'Yearly';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {

  @Input() view: CalendarView = 'Weekly';
  @Input() currentDate: Date = new Date();
  @Output() dateChange = new EventEmitter<Date>();
  @Output() viewChange = new EventEmitter<CalendarView>();

  get title(): string {
    if (this.view === 'Weekly') {
      // Example: "May 20 - May 26, 2025"
      const start = this.getStartOfWeek(this.currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    if (this.view === 'Monthly') {
      // Example: "May 2025"
      return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    // Yearly: "2025"
    return this.currentDate.getFullYear().toString();
  }

  changeView(view: CalendarView) {
    this.view = view;
    this.viewChange.emit(view);
  }

  prev() {
    if (this.view === 'Weekly') {
      const prev = new Date(this.currentDate);
      prev.setDate(prev.getDate() - 7);
      this.currentDate = prev;
    } else if (this.view === 'Monthly') {
      const prev = new Date(this.currentDate);
      prev.setMonth(prev.getMonth() - 1);
      this.currentDate = prev;
    } else {
      const prev = new Date(this.currentDate);
      prev.setFullYear(prev.getFullYear() - 1);
      this.currentDate = prev;
    }
    this.dateChange.emit(this.currentDate);
  }

  next() {
    if (this.view === 'Weekly') {
      const next = new Date(this.currentDate);
      next.setDate(next.getDate() + 7);
      this.currentDate = next;
    } else if (this.view === 'Monthly') {
      const next = new Date(this.currentDate);
      next.setMonth(next.getMonth() + 1);
      this.currentDate = next;
    } else {
      const next = new Date(this.currentDate);
      next.setFullYear(next.getFullYear() + 1);
      this.currentDate = next;
    }
    this.dateChange.emit(this.currentDate);
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    return new Date(d.setDate(diff));
  }

  // Add more logic to generate days/weeks/months as needed for your UI
}
