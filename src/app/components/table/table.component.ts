import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../interfaces/employee.interface';

interface MenuItem {
  label: string;
  icon: string;
  action: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TableComponent {
  @Input() employees: Employee[] = [];
  @Input() title: string = 'Employee Records';
  @Input() showViewAll: boolean = true;
  @Input() viewAllText: string = 'View all';
  @Input() viewAllLink: string = '#';

  menuItems: MenuItem[] = [
    { label: 'View all', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', action: 'view' },
    { label: 'Approve', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: 'approve' },
    { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: 'delete' }
  ];

  activeDropdownKey: string | null = null;

  constructor(private eRef: ElementRef) {}

  getDropdownKey(employee: Employee, index: number): string {
    return `${employee.id}_${index}`;
  }

  toggleDropdown(employee: Employee, index: number): void {
    const key = this.getDropdownKey(employee, index);
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
  }

  handleAction(action: string, employee: Employee): void {
    console.log(`Action: ${action} for employee: ${employee.name}`);
    this.activeDropdownKey = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeDropdownKey = null;
    }
  }
}
