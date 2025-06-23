import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  TemplateRef,
  OnInit,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableData } from '../../interfaces/employee.interface';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'; // needed for dayClick

import { CalendarEvent, CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

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
  imports: [CommonModule, FormsModule, FullCalendarModule, CalendarModule],
})
export class TableComponent implements OnInit, OnChanges {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  @Input() tableTitle: string = '';
  @Input() tableData: TableData[] = [];
  @Input() tableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'status', label: 'STATUS' },
    { key: 'action', label: 'ACTION' },
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
  @Input() showButtonStyle: string = 'bg-green-600 hover:bg-green-700';
  @Input() showViewAll: boolean = true;
  @Input() showCalendar: boolean = false;
  @Input() showCalendarIcon: string = '';
  @Input() showList: boolean = false;
  @Input() showListIcon: string = '';
  @Input() showCard: boolean = false;
  @Input() showCardIcon: string = '';
  @Input() currentView: 'table' | 'card' | 'calendar' | 'list' = 'table';
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
  @Input() calendarEvents: any[] = [];
  @Input() customEventClick: ((info: any) => void) | null = null;

  @Output() search = new EventEmitter<string>();
  @Output() filter = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() filterTabChange = new EventEmitter<string>();
  @Output() statusTabChange = new EventEmitter<string>();
  @Output() showButtonActionClick = new EventEmitter<boolean>();
  @Output() menuAction = new EventEmitter<{ action: string; row: TableData }>();
  @Output() showListCalendarClick = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<string>();
  calendarDate: Date = new Date();

  @Input() menuItems: MenuItem[] = [
    {
      label: 'View all',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      action: 'view',
    },
    {
      label: 'Approve',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      action: 'approve',
    },
    {
      label: 'Delete',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      action: 'delete',
    },
  ];

  activeDropdownKey: string | null = null;
  selectedRows = new Set<string>();
  showFilterDropdown: boolean = false;
  activeView: string = 'table';

  constructor(private eRef: ElementRef) {}

  ngOnInit() {
    // Synchronize activeView with currentView input
    this.activeView = this.currentView === 'table' ? 'list' : this.currentView;

    // Set calendar events with a small delay to ensure component is ready
    setTimeout(() => {
      this.updateCalendarEvents();
    }, 100);
  }

  ngOnChanges() {
    // Update activeView when currentView input changes
    this.activeView = this.currentView === 'table' ? 'list' : this.currentView;

    // Update calendar events when calendarEvents input changes
    this.updateCalendarEvents();
  }

  private updateCalendarEvents() {
    let eventsToSet: any[] = [];

    if (this.calendarEvents && this.calendarEvents.length > 0) {
      eventsToSet = this.calendarEvents;
    } else {
      // Default events if no custom events provided
      eventsToSet = [
        {
          id: 'default-1',
          title: 'leave 1',
          date: '2025-05-01',
          backgroundColor: '#12C16F',
          borderColor: '#12C16F',
        },
        {
          id: 'default-2',
          title: 'leave 2',
          date: '2025-05-15',
          backgroundColor: '#12C16F',
          borderColor: '#12C16F',
        },
      ];
    }

    // Update the events in the existing calendar options
    this.calendarOptions = {
      ...this.calendarOptions,
      events: eventsToSet,
    };
  }

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
    return (
      this.tableData.length > 0 &&
      this.tableData.every((emp) =>
        this.selectedRows.has((emp as Record<string, any>)[this.rowIdKey])
      )
    );
  }

  toggleSelectAll(checked: boolean) {
    if (checked) {
      this.tableData.forEach((emp) =>
        this.selectedRows.add((emp as Record<string, any>)[this.rowIdKey])
      );
    } else {
      this.tableData.forEach((emp) =>
        this.selectedRows.delete((emp as Record<string, any>)[this.rowIdKey])
      );
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
      this.currentView = 'list';
      this.viewChange.emit('list');
    } else if (event === 'card') {
      this.activeView = event;
      this.currentView = 'card';
      this.viewChange.emit('card');
    } else {
      this.activeView = event;
      this.currentView = 'calendar';
      this.viewChange.emit('calendar');
    }
  }

  // Enhanced view switching for table, card, calendar, and list
  switchView(viewType: 'table' | 'card' | 'calendar' | 'list') {
    this.currentView = viewType;
    this.activeView = viewType === 'table' ? 'list' : viewType;
    this.viewChange.emit(viewType);
  }

  // Helper methods for card view styling
  getFileTypeClass(fileType: string): string {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-100 text-blue-800';
      case 'XLS':
      case 'XLSX':
        return 'bg-green-100 text-green-800';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
        return 'bg-purple-100 text-purple-800';
      case 'MP4':
      case 'AVI':
      case 'MOV':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getFileIconClass(fileType: string): string {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return 'bg-red-500';
      case 'DOC':
      case 'DOCX':
        return 'bg-blue-500';
      case 'XLS':
      case 'XLSX':
        return 'bg-green-500';
      case 'JPG':
      case 'JPEG':
      case 'PNG':
        return 'bg-purple-500';
      case 'MP4':
      case 'AVI':
      case 'MOV':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Card dropdown management
  activeCardDropdownKey: string | null = null;

  getCardDropdownKey(employee: TableData, index: number): string {
    return `card_${employee.id}_${index}`;
  }

  toggleCardDropdown(employee: TableData, index: number): void {
    const key = this.getCardDropdownKey(employee, index);
    this.activeCardDropdownKey =
      this.activeCardDropdownKey === key ? null : key;
  }

  handleCardAction(action: string, employee: TableData): void {
    this.activeCardDropdownKey = null;
    this.menuAction.emit({ action, row: employee });
  }

  calendarOptions: CalendarOptions = {
    //month view
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [
      {
        id: 'test-1',
        title: 'Test Event 1',
        date: '2025-06-15',
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        textColor: '#ffffff',
      },
      {
        id: 'test-2',
        title: 'Test Event 2',
        date: '2025-06-25',
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        textColor: '#ffffff',
      },
    ],
    eventClick: (info) => this.handleCalendarEventClick(info),
    height: 600,
    contentHeight: 600,
    aspectRatio: 1.35,
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    eventDisplay: 'block',
    displayEventTime: false,
    fixedWeekCount: true,
    showNonCurrentDates: true,
    dayHeaders: true,
    dayHeaderFormat: { weekday: 'short' },
    expandRows: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: '',
    },
  };

  handleCalendarEventClick(info: any) {
    if (this.customEventClick) {
      this.customEventClick(info);
    } else {
      alert('Event: ' + info.event.title);
    }
  }

  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      start: new Date('2025-06-15'),
      title: 'Pre Camp Meeting',
      color: { primary: '#10b981', secondary: '#D1E8FF' },
    },
    {
      start: new Date('2025-06-25'),
      title: 'Camp Meeting Coordination',
      color: { primary: '#10b981', secondary: '#D1E8FF' },
    },
  ];

  dayClicked(day: any): void {
    console.log('Clicked day:', day.date);
  }
}
