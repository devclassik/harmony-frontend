import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoItem {
  label: string;
  text: string;
}

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.css'],
})
export class InfoSectionComponent implements OnInit {
  @Input() title: string = '';
  @Input() data: InfoItem[] = [];
  @Input() columns: number = 3;
  @Input() isExpanded: boolean = true;

  constructor() {}

  ngOnInit(): void {}

  toggleAccordion(): void {
    this.isExpanded = !this.isExpanded;
  }

  getGridClass(): string {
    switch (this.columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 lg:grid-cols-2';
      case 3:
        return 'grid-cols-1 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4';
      default:
        return 'grid-cols-1 lg:grid-cols-3';
    }
  }
}
