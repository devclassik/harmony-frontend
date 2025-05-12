import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-incidence-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './incidence-form.component.html',
  styleUrl: './incidence-form.component.css'
})
export class IncidenceFormComponent {
  @Input() open = false;
  @Input() formTitle: string = 'Create Incidence';
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;

  quarters = ['Apr-Jul', 'Aug-Nov', 'Dec-Mar'];
  criteria = ['Attendance', 'Voluntary Work', 'Evangelism'];
  scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  dropdownOpen = false;
  searchTerm = '';
  selectedName: string | null = null;

  // Simulated source data — could be API-loaded
  allNames = ['John Adegoke', 'Jane Adesanya', 'John Adegoke', 'Jane Adesanya'];
  filteredList = [...this.allNames];

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


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectName(name: string) {
    this.selectedName = name;
    this.dropdownOpen = false;
  }

  onSearch(term: string) {
    // 👇 Replace this with your API call or function
    this.filteredList = this.allNames.filter(name =>
      name.toLowerCase().includes(term.toLowerCase())
    );

    // Example API call placeholder:
    // this.apiService.searchNames(term).subscribe(res => this.filteredList = res);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownOpen &&
      this.dropdownWrapper &&
      !this.dropdownWrapper.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }
}
