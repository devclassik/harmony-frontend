import { Component } from '@angular/core';
import {
  FilterTab,
  MenuItem,
  TableHeader,
  TableComponent,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import {
  PromptConfig,
  ConfirmPromptComponent,
} from '../../components/confirm-prompt/confirm-prompt.component';
import { SuccessModalComponent } from '../../components/success-modal/success-modal.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-index-of-file',
  imports: [
    CommonModule,
    SuccessModalComponent,
    ConfirmPromptComponent,
    EmployeeDetailsComponent,
    TableComponent,
    DocumentViewerComponent,
  ],
  templateUrl: './index-of-file.component.html',
  styleUrl: './index-of-file.component.css',
})
export class IndexOfFileComponent {
  selectedStatus: string = '';
  selectedFilter: string = '';
  searchValue: string = '';
  showModal: boolean = false;
  successModal: boolean = false;
  selectedEmployee: TableData | null = null;
  selectedEmployeeRecord: TableData | null = null;
  promptConfig: PromptConfig | null = null;
  showEmployeeDetails: boolean = false;
  showAppraisal: boolean = false;

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

  tableHeader: TableHeader[] = [
    { key: 'id', label: 'DOCUMENT ID' },
    { key: 'documentName', label: 'DOCUMENT NAME' },
    { key: 'date', label: 'DATE UPLOADED' },
    { key: 'documentType', label: 'DOCUMENT TYPE' },
    { key: 'action', label: 'ACTION' },
  ];

  // Documents data
  documentsData: TableData[] = [
    {
      id: 'FL-755787',
      documentName: 'Code of Conduct',
      date: '06-20-2024',
      documentType: 'PDF',
    },
    {
      id: 'FL-755788',
      documentName: 'Standard Operating Procedure',
      date: '06-20-2024',
      documentType: 'DOC',
    },
    {
      id: 'FL-755789',
      documentName: 'Conduct Manual',
      date: '06-20-2024',
      documentType: 'JPG',
    },
    {
      id: 'FL-755790',
      documentName: 'Conduct Manual',
      date: '06-20-2024',
      documentType: 'XLS',
    },
    {
      id: 'FL-755791',
      documentName: 'Code of Conduct',
      date: '06-20-2024',
      documentType: 'PDF',
    },
    {
      id: 'FL-755792',
      documentName: 'Standard Operating Procedure',
      date: '06-20-2024',
      documentType: 'DOC',
    },
    {
      id: 'FL-755793',
      documentName: 'Conduct Manual',
      date: '06-20-2024',
      documentType: 'JPG',
    },
    {
      id: 'FL-755794',
      documentName: 'Conduct Manual',
      date: '06-20-2024',
      documentType: 'XLS',
    },
    // Add more sample data to test pagination
    {
      id: 'FL-755795',
      documentName: 'Employee Handbook',
      date: '06-19-2024',
      documentType: 'PDF',
    },
    {
      id: 'FL-755796',
      documentName: 'Safety Guidelines',
      date: '06-18-2024',
      documentType: 'DOC',
    },
    {
      id: 'FL-755797',
      documentName: 'Training Manual',
      date: '06-17-2024',
      documentType: 'PDF',
    },
    {
      id: 'FL-755798',
      documentName: 'Company Policies',
      date: '06-16-2024',
      documentType: 'XLS',
    },
    {
      id: 'FL-755799',
      documentName: 'Org Chart',
      date: '06-15-2024',
      documentType: 'JPG',
    },
    {
      id: 'FL-755800',
      documentName: 'Budget Report',
      date: '06-14-2024',
      documentType: 'XLS',
    },
    {
      id: 'FL-755801',
      documentName: 'Meeting Minutes',
      date: '06-13-2024',
      documentType: 'DOC',
    },
  ];

  // Training data
  trainingData: TableData[] = [
    {
      id: 'TR-445123',
      documentName: 'Safety Training Module',
      date: '06-15-2024',
      documentType: 'PDF',
    },
    {
      id: 'TR-445124',
      documentName: 'HR Orientation Video',
      date: '06-14-2024',
      documentType: 'MP4',
    },
    {
      id: 'TR-445125',
      documentName: 'Compliance Training',
      date: '06-13-2024',
      documentType: 'PDF',
    },
    {
      id: 'TR-445126',
      documentName: 'Leadership Development',
      date: '06-12-2024',
      documentType: 'MP4',
    },
    {
      id: 'TR-445127',
      documentName: 'Technical Skills Training',
      date: '06-11-2024',
      documentType: 'PDF',
    },
    {
      id: 'TR-445128',
      documentName: 'Customer Service Training',
      date: '06-10-2024',
      documentType: 'MP4',
    },
  ];

  employees: TableData[] = this.documentsData;
  filteredEmployees: TableData[] = this.employees;
  paginatedEmployees: TableData[] = [];

  filterTabs: FilterTab[] = [
    { label: 'All', value: '' },
    { label: 'PDF', value: 'PDF' },
    { label: 'DOC', value: 'DOC' },
    { label: 'XLS', value: 'XLS' },
    { label: 'JPG', value: 'JPG' },
    { label: 'MP4', value: 'MP4' },
  ];

  actionButton: MenuItem[] = [
    { label: 'View', action: 'View', icon: '/public/assets/svg/eyeOpen.svg' },
  ];

  constructor() {
    this.applyFilters();
  }

  // Tab switching methods
  switchToDocuments() {
    this.activeTab = 'documents';
    this.employees = this.documentsData;
    this.currentPage = 1;
    this.applyFilters();
  }

  switchToTraining() {
    this.activeTab = 'training';
    this.employees = this.trainingData;
    this.currentPage = 1;
    this.applyFilters();
  }

  // View switching methods
  switchToTableView() {
    this.currentView = 'table';
    this.pageSize = 10; // Different page size for table view
    this.currentPage = 1;
    this.applyFilters();
  }

  switchToCardView() {
    this.currentView = 'card';
    this.pageSize = 12; // Different page size for card view
    this.currentPage = 1;
    this.applyFilters();
  }

  // Toggle filter dropdown
  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  // Get current data count
  getCurrentDataCount(): number {
    return this.filteredEmployees.length;
  }

  // Get current tab title
  getCurrentTabTitle(): string {
    return this.activeTab === 'documents' ? 'Documents' : 'Training';
  }

  onFilterTabChange(value: string) {
    this.selectedFilter = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusTabChange(value: string) {
    this.selectedStatus = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.employees;
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (employee) => employee.status === this.selectedStatus
      );
    }
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (employee) => employee.documentType === this.selectedFilter
      );
    }
    if (this.searchValue) {
      const search = this.searchValue.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.documentName?.toLowerCase().includes(search) ||
          employee.id.toLowerCase().includes(search) ||
          employee.documentType?.toLowerCase().includes(search)
      );
    }
    this.filteredEmployees = filtered;
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(
      startIndex,
      endIndex
    );
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.currentPage = 1;
    this.applyFilters();
  }

  onMenuAction(event: { action: string; row: TableData }) {
    console.log(event);

    if (event.action === 'View') {
      this.viewDocument(event.row);
    } else {
      // Handle other actions if needed
      this.selectedEmployeeRecord = event.row;
    }
  }

  showEmployeeDetailsModal() {
    this.showEmployeeDetails = true;
  }

  actionToPerform(result: boolean) {
    if (result) {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to approve this document request',
        imageUrl: 'assets/svg/profilePix.svg',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    } else {
      this.promptConfig = {
        title: 'Confirm',
        text: 'Are you sure you want to reject this document request',
        imageUrl: 'assets/svg/profilePix.svg',
        yesButtonText: 'Yes',
        noButtonText: 'No',
      };
      this.showModal = true;
    }
  }

  onModalConfirm(confirmed: boolean) {
    console.log(confirmed);
    this.showModal = false;
    this.showAppraisal = false;
    this.successModal = true;
  }

  onModalClose() {
    this.showModal = false;
  }

  // Dropdown management methods for custom table
  getDropdownKey(employee: TableData, index: number): string {
    return `${employee.id}_${index}`;
  }

  toggleDropdown(employee: TableData, index: number): void {
    const key = this.getDropdownKey(employee, index);
    this.activeDropdownKey = this.activeDropdownKey === key ? null : key;
  }

  handleAction(action: string, employee: TableData): void {
    this.activeDropdownKey = null;

    if (action === 'View') {
      this.viewDocument(employee);
    } else {
      this.onMenuAction({ action, row: employee });
    }
  }

  // Card dropdown management methods
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

    if (action === 'View') {
      this.viewDocument(employee);
    } else if (action === 'Download') {
      this.downloadDocument(employee);
    }
  }

  // Document viewer methods
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
    // Implement download logic here
    console.log('Downloading document:', doc.documentName);

    // Create a simulated file download
    // In a real application, you would get the file URL from your backend API
    const fileUrl = this.getFileUrl(doc);

    if (fileUrl) {
      // Method 1: Direct download using anchor element
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = this.getFileName(doc);
      link.target = '_blank';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optional: Show success message
      console.log(`Downloaded: ${doc.documentName}`);
    } else {
      // Handle case where file URL is not available
      console.error('File URL not available for download');
      alert('Sorry, this file is not available for download at the moment.');
    }
  }

  private getFileUrl(doc: TableData): string | null {
    // In a real application, this would come from your backend API
    // For now, we'll simulate file URLs based on document type
    const baseUrl = '/assets/sample-files/'; // Adjust this to your file storage location

    switch (doc.documentType?.toUpperCase()) {
      case 'PDF':
        return `${baseUrl}${doc.id}_${doc.documentName}.pdf`;
      case 'DOC':
      case 'DOCX':
        return `${baseUrl}${doc.id}_${doc.documentName}.docx`;
      case 'XLS':
      case 'XLSX':
        return `${baseUrl}${doc.id}_${doc.documentName}.xlsx`;
      case 'JPG':
      case 'JPEG':
        return `${baseUrl}${doc.id}_${doc.documentName}.jpg`;
      case 'PNG':
        return `${baseUrl}${doc.id}_${doc.documentName}.png`;
      case 'MP4':
        return `${baseUrl}${doc.id}_${doc.documentName}.mp4`;
      default:
        // For unknown file types, try a generic approach
        return `${baseUrl}${doc.id}_${doc.documentName}`;
    }
  }

  private getFileName(doc: TableData): string {
    // Generate a proper filename for download
    const extension = this.getFileExtension(doc.documentType || '');
    const cleanName =
      doc.documentName?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') ||
      'document';
    return `${cleanName}${extension}`;
  }

  private getFileExtension(documentType: string): string {
    switch (documentType.toUpperCase()) {
      case 'PDF':
        return '.pdf';
      case 'DOC':
        return '.doc';
      case 'DOCX':
        return '.docx';
      case 'XLS':
        return '.xls';
      case 'XLSX':
        return '.xlsx';
      case 'JPG':
      case 'JPEG':
        return '.jpg';
      case 'PNG':
        return '.png';
      case 'MP4':
        return '.mp4';
      default:
        return '.file';
    }
  }

  // Alternative method for API-based downloads
  downloadDocumentFromAPI(doc: TableData): void {
    // This method would be used if you have a backend API endpoint for downloads
    const downloadUrl = `/api/documents/${doc.id}/download`;

    // Using fetch for API calls
    fetch(downloadUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`, // If authentication is required
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Download failed');
        }
        return response.blob();
      })
      .then((blob) => {
        // Create blob URL and download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.getFileName(doc);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Download error:', error);
        alert('Failed to download the file. Please try again.');
      });
  }

  private getAuthToken(): string {
    // Get authentication token from your auth service
    // return this.authService.getToken();
    return localStorage.getItem('authToken') || '';
  }

  // Helper methods for styling
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

  // Handle view change from table component
  onViewChange(viewType: string): void {
    this.currentView = viewType as 'table' | 'card';
    if (viewType === 'table') {
      this.pageSize = 10;
    } else if (viewType === 'card') {
      this.pageSize = 12;
    }
    this.currentPage = 1;
    this.applyFilters();
  }
}
