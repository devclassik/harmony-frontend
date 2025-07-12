import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FilterTab,
  MenuItem,
  TableHeader,
  TableComponent,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { CommonModule } from '@angular/common';
import { TemplateService, Template } from '../../services/template.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-index-of-file',
  imports: [
    CommonModule,
    TableComponent,
    DocumentViewerComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './index-of-file.component.html',
  styleUrl: './index-of-file.component.css',
})
export class IndexOfFileComponent implements OnInit, OnDestroy {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';

  // Loading states
  isLoadingTemplates: boolean = false;
  isCreatingTemplate: boolean = false;

  // Document viewer properties
  showDocumentViewer: boolean = false;
  selectedDocument: TableData | null = null;

  // Tab and view management
  activeTab: 'documents' | 'training' = 'documents';
  currentView: 'table' | 'card' = 'table';
  showFilterDropdown: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 12; // 12 items per page for card view, 10 for table
  totalPages: number = 1;

  // Dropdown management for table actions
  activeDropdownKey: string | null = null;

  // Dropdown management for card actions
  activeCardDropdownKey: string | null = null;

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'TEMPLATE ID' },
    { key: 'documentName', label: 'TEMPLATE NAME' },
    { key: 'date', label: 'DATE UPLOADED' },
    { key: 'documentType', label: 'TEMPLATE TYPE' },
    { key: 'action', label: 'ACTION' },
  ];

  // Template data from API
  templates: Template[] = [];
  documentsData: TableData[] = [];
  trainingData: TableData[] = [];

  employees: TableData[] = [];
  filteredEmployees: TableData[] = [];
  paginatedEmployees: TableData[] = [];

  filterTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'PDF', value: 'pdf' },
    { label: 'DOC', value: 'doc' },
    { label: 'XLS', value: 'xls' },
    { label: 'JPG', value: 'jpg' },
  ];

  actionButton: MenuItem[] = [
    { label: 'View', action: 'view', icon: 'assets/svg/eyeOpen.svg' },
    { label: 'Download', action: 'download', icon: 'assets/svg/download.svg' },
  ];

  constructor(
    private templateService: TemplateService,
    private alertService: AlertService
  ) {
    this.updateCurrentData();
  }

  ngOnInit() {
    this.loadTemplates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadTemplates() {
    this.isLoadingTemplates = true;

    const loadSub = this.templateService.getTemplates().subscribe({
      next: (response) => {
        this.isLoadingTemplates = false;
        if (response.status === 'success') {
          this.templates = response.data;
          this.transformTemplateData();
          this.updateCurrentData();
          this.applyFilters();
        }
      },
      error: (error) => {
        this.isLoadingTemplates = false;
        console.error('Error loading templates:', error);
        this.alertService.error('Failed to load templates. Please try again.');
      },
    });

    this.subscriptions.push(loadSub);
  }

  transformTemplateData() {
    this.documentsData = this.templates.map((template) => ({
      id: template.id.toString(),
      documentName: template.name,
      date: this.formatDate(template.createdAt),
      documentType: template.fileType,
      downloadUrl: template.downloadUrl,
      templateType: template.fileType,
    }));

    // For now, keeping training data empty as it's not part of the template API
    // If you have a separate training API endpoint, you can implement it similarly
    this.trainingData = [];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }

  getFileTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'DOC';
      case 'xls':
      case 'xlsx':
        return 'XLS';
      case 'jpg':
      case 'jpeg':
        return 'JPG';
      case 'png':
        return 'PNG';
      case 'mp4':
        return 'MP4';
      default:
        return 'FILE';
    }
  }

  switchToDocuments() {
    this.activeTab = 'documents';
    this.updateCurrentData();
    this.applyFilters();
  }

  switchToTraining() {
    this.activeTab = 'training';
    this.updateCurrentData();
    this.applyFilters();
  }

  updateCurrentData() {
    this.employees =
      this.activeTab === 'documents' ? this.documentsData : this.trainingData;
    this.filteredEmployees = this.employees;
  }

  switchToTableView() {
    this.currentView = 'table';
    this.pageSize = 10;
    this.currentPage = 1;
    this.calculatePagination();
  }

  switchToCardView() {
    this.currentView = 'card';
    this.pageSize = 12;
    this.currentPage = 1;
    this.calculatePagination();
  }

  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  getCurrentDataCount(): number {
    return this.filteredEmployees.length;
  }

  getCurrentTabTitle(): string {
    return this.activeTab === 'documents' ? 'Documents' : 'Training Materials';
  }

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.applyFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.employees];

    // Apply search filter
    if (this.searchValue.trim()) {
      const searchTerm = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.documentName?.toLowerCase().includes(searchTerm) ||
          item.id?.toLowerCase().includes(searchTerm) ||
          item.documentType?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply document type filter
    if (this.selectedFilter && this.selectedFilter !== '') {
      filtered = filtered.filter(
        (item) =>
          item.documentType?.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }

    this.filteredEmployees = filtered;
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(
      startIndex,
      endIndex
    );
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    this.handleAction(event.action, event.row);
  }

  getDropdownKey(employee: TableData, index: number): string {
    return `${employee.id}-${index}`;
  }

  toggleDropdown(employee: TableData, index: number): void {
    const key = this.getDropdownKey(employee, index);
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
  }

  handleAction(action: string, employee: TableData): void {
    switch (action) {
      case 'view':
        this.viewDocument(employee);
        break;
      case 'download':
        this.downloadDocument(employee);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  getCardDropdownKey(employee: TableData, index: number): string {
    return `card-${employee.id}-${index}`;
  }

  toggleCardDropdown(employee: TableData, index: number): void {
    const key = this.getCardDropdownKey(employee, index);
    this.activeCardDropdownKey =
      this.activeCardDropdownKey === key ? null : key;
  }

  handleCardAction(action: string, employee: TableData): void {
    switch (action) {
      case 'view':
        this.viewDocument(employee);
        break;
      case 'download':
        this.downloadDocument(employee);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  viewDocument(document: TableData): void {
    this.selectedDocument = document;
    this.showDocumentViewer = true;
  }

  onDocumentViewerClose(): void {
    this.showDocumentViewer = false;
    this.selectedDocument = null;
  }

  onDocumentViewerDownload(document: TableData): void {
    this.downloadDocument(document);
  }

  downloadDocument(doc: TableData): void {
    if (doc.downloadUrl) {
      this.templateService.downloadTemplate(doc.downloadUrl);
    } else {
      this.alertService.error('Download URL not available for this template.');
    }
  }

  getFileTypeClass(fileType: string): string {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-600';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'bg-green-100 text-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'bg-purple-100 text-purple-600';
      case 'mp4':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getFileIconClass(fileType: string): string {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'fa-file-image';
      case 'mp4':
        return 'fa-file-video';
      default:
        return 'fa-file';
    }
  }

  onViewChange(viewType: string): void {
    if (viewType === 'table') {
      this.switchToTableView();
    } else if (viewType === 'card') {
      this.switchToCardView();
    }
  }
}
