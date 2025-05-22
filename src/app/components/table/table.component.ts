import { Component, Input, Output, EventEmitter, ElementRef, HostListener, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableData } from '../../interfaces/employee.interface';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // needed for dayClick

export interface MenuItem {
  label: string;
  icon: string;
  action: string;
}

export interface TableHeader {
  key: string;
  label: string;
  class?: string;
}

export interface FilterTab {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule]
})
export class TableComponent {
  @Input() tableTitle: string = '';
  @Input() tableData: TableData[] = [];
  @Input() tableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' }
  ];
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = 'Search';
  @Input() showFilter: boolean = true;
  @Input() showStatusTab: boolean = true;
  @Input() statusTabs: FilterTab[] = [];
  @Input() activeTab: string = '';
  @Input() showPagination: boolean = true;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() pageSize: number = 10;
  @Input() showButton: boolean = false;
  @Input() showButtonText: string = 'Create Incidence';
  @Input() showButtonIcon: string = '';
  @Input() showViewAll: boolean = true;
  @Input() showCalendar: boolean = false;
  @Input() showCalendarIcon: string = '';
  @Input() showList: boolean = false;
  @Input() showListIcon: string = '';
  @Input() viewAllText: string = 'View all';
  @Input() viewAllLink: string = '#';
  @Input() emptyStateImage: string = 'assets/svg/emptyState.svg';
  @Input() emptyStateText: string = 'No records found.';
  @Input() emptyStateTemplate?: TemplateRef<any>;
  @Input() showSelectCheckbox: boolean = true;
  @Input() rowIdKey: string = 'id';
  @Input() filterTabs: FilterTab[] = [];
  @Input() activeFilterTab: string = '';
  @Input() searchValue: string = '';
  @Input() activeStatusTab: string = '';

  @Output() search = new EventEmitter<string>();
  @Output() filter = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() filterTabChange = new EventEmitter<string>();
  @Output() statusTabChange = new EventEmitter<string>();
  @Output() showButtonActionClick = new EventEmitter<boolean>();
  @Output() menuAction = new EventEmitter<{ action: string, row: TableData }>();
  @Output() showListCalendarClick = new EventEmitter<string>();
  calendarDate: Date = new Date();


  @Input() menuItems: MenuItem[] = [
    { label: 'View all', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z', action: 'view' },
    { label: 'Approve', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', action: 'approve' },
    { label: 'Delete', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: 'delete' }
  ];

  activeDropdownKey: string | null = null;
  selectedRows = new Set<string>();
  showFilterDropdown: boolean = false;
  activeView: string = 'list';

  constructor(private eRef: ElementRef) { }

  getDropdownKey(employee: TableData, index: number): string {
    return `${employee.id}_${index}`;
  }

  toggleDropdown(employee: TableData, index: number): void {
    const key = this.getDropdownKey(employee, index);
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
  }

  handleAction(action: string, employee: TableData): void {
    this.activeDropdownKey = null;
    this.menuAction.emit({ action, row: employee });
  }

  onSearchChange(value: string) {
    this.search.emit(value);
  }

  onTabChange(tab: FilterTab) {
    this.tabChange.emit(tab.value);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  isAllSelected(): boolean {
    return this.tableData.length > 0 && this.tableData.every(emp => this.selectedRows.has((emp as Record<string, any>)[this.rowIdKey]));
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.tableData.forEach(emp => this.selectedRows.add((emp as Record<string, any>)[this.rowIdKey]));
    } else {
      this.tableData.forEach(emp => this.selectedRows.delete((emp as Record<string, any>)[this.rowIdKey]));
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  toggleRowSelection(emp: any, checked: boolean) {
    const id = (emp as Record<string, any>)[this.rowIdKey];
    if (checked) {
      this.selectedRows.add(id);
    } else {
      this.selectedRows.delete(id);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  isRowSelected(emp: any): boolean {
    return this.selectedRows.has((emp as Record<string, any>)[this.rowIdKey]);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeDropdownKey = null;
      this.showFilterDropdown = false;
    }
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  onFilterTabClick(tab: FilterTab) {
    this.filterTabChange.emit(tab.value);
    this.showFilterDropdown = false;
  }

  onStatusTabClick(tab: FilterTab) {
    this.statusTabChange.emit(tab.value);
  }

  onButtonClick(event: boolean) {
    this.showButtonActionClick.emit(event);
  }


  toggleListCalendar(event: string) {
    if (event === 'list') {
      this.activeView = event;
      this.showListCalendarClick.emit(event);
    } else {
      this.activeView = event;
      this.showListCalendarClick.emit(event);
    }
  }

  calendarOptions: CalendarOptions = {
    //month view
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    // dateClick: (arg) => this.handleDateClick(arg),
    events: [
      { title: 'leave 1', date: '2025-05-01' },
      { title: 'leave 1', editable: true, date: '2025-05-15', backgroundColor: '#12C16F', borderColor: '#12C16F' },
      { title: 'leave Opemipo', date: '2025-05-20', end: '2025-05-21', editable: true, },
    ],
    eventClick: function (info) {
      alert('Event: ' + info.event.title);
    }
    // week view,
    // plugins: [dayGridPlugin],
    // initialView: 'dayGridWeek',
    // headerToolbar: {
    //   left: 'prev,next',
    //   center: 'title',
    //   right: 'dayGridWeek,dayGridDay' // user can switch between the two
    // }

    //year view
    // plugins: [dayGridPlugin],
    // initialView: 'dayGridYear'
  };

  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr)
  }
//   onDateClick(date: { dateStr: string; }) {
//     this.modalRef = this.modalService.show(this.viewModal);
//     this.date = date.dateStr;
//   }
  
// createEvent() {
//     let newEvent = {
//       title: this.eventName,
//       date: this.date
//     };
//     this.newEvents.push(newEvent);
//     this.calendarOptions.events = [...this.newEvents];
//     this.eventName = "";
//   }

// handleEventClick(arg){
//     this.deleteEventTitle = arg.event._def.title;
//   }

//   deleteEvent(arg){
//     for (var i = 0; i < this.newEvents.length; i++) {
//       if (this.newEvents[i].title == this.deleteEventTitle) {
//         this.newEvents.splice(i, 1);
//         this.calendarOptions.events=[];
//         break;
//       }
//     }
//     this.calendarOptions.events = [...this.newEvents];
//   }
}
