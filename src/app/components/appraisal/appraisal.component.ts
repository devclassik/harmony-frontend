import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appraisal',
  imports: [CommonModule, FormsModule],
  templateUrl: './appraisal.component.html',
  styleUrl: './appraisal.component.css'
})
export class AppraisalComponent {

  @Input() open = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  quarters = ['Apr-Jul', 'Aug-Nov', 'Dec-Mar'];
  criteria = ['Attendance', 'Voluntary Work', 'Evangelism'];
  scores = [1,2,3,4,5,6,7,8,9,10];

  form = {
    period: '',
    average: '',
    details: [
      { criteria: 'Attendance', score: '' },
      { criteria: 'Voluntary Work', score: '' },
      { criteria: 'Evangelism', score: '' }
    ]
  };

  onClose() {
    this.closed.emit();
  }

  onSubmit() {
    this.submitted.emit(this.form);
  }

  calculateAverage() {
    // Extract scores, convert to numbers, and filter out empty or invalid entries
    const scores = this.form.details
      .map(avg => Number(avg.score))
      .filter(score => !isNaN(score));

    if (scores.length === 0) {
      this.form.average = '';
      return;
    }

    // Calculate average
    const avg = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    this.form.average = avg.toFixed(2); // or just avg if you want a number
  }
}
