import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TableComponent,
  TableHeader,
} from '../../components/table/table.component';
import { TableData } from '../../interfaces/employee.interface';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { EmployeeDetailsComponent } from '../../components/employee-details/employee-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { ConfirmPromptComponent } from '../../components/confirm-prompt/confirm-prompt.component';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  CampMeetingService,
  CampMeetingRecord,
  CampMeetingApiResponse,
  CreateCampMeetingRequest,
  CampMeetingAttendee,
  AttendeesApiResponse,
  CampMeetingAttendance,
} from '../../services/camp-meeting.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-camp-meeting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    LeaveDetailsComponent,
    EmployeeDetailsComponent,
    LoadingOverlayComponent,
    ConfirmPromptComponent,
  ],
  templateUrl: './camp-meeting.component.html',
  styleUrl: './camp-meeting.component.css',
})
export class CampMeetingComponent implements OnInit, OnDestroy {
  userRole: string | null;
  currentUser: any;

  // Slide-in state
  showSlideIn = false;
  selectedMeetingData: CampMeetingRecord | null = null;

  // Create/Edit slide-out state
  showCreateSlideOut = false;
  isEditMode = false;
  editingMeetingId: number | null = null;

  // Loading states
  isLoading = false;
  isCreating = false;
  isDeleting = false;

  // Delete confirmation state
  showDeleteConfirmation = false;
  meetingToDelete: CampMeetingRecord | null = null;

  // Real data from API
  campMeetings: CampMeetingRecord[] = [];

  // Tab management
  activeTab: 'camp-meeting' | 'attendees' = 'camp-meeting';

  // Attendees data
  attendees: CampMeetingAttendee[] = [];
  attendeesTableData: TableData[] = [];
  isLoadingAttendees: boolean = false;
  selectedMeetingForAttendees: CampMeetingRecord | null = null;

  // Attendee view action state
  selectedAttendee: CampMeetingAttendee | null = null;
  isAssigningAccommodation = false;

  // Attendee slide-out state
  showAttendeeSlideOut = false;

  // Menu items for attendees table (only view action)
  attendeesMenuItems = [
    {
      label: 'View',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      action: 'view',
    },
  ];

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  // Calendar events for display
  campMeetingCalendarEvents: any[] = [];

  // Role-based button visibility
  get shouldShowCreateButton(): boolean {
    return (
      this.userRole?.toLowerCase() === 'admin' ||
      this.userRole?.toLowerCase() === 'hod' ||
      this.userRole?.toLowerCase() === 'pastor'
    );
  }

  // Get loading title
  getLoadingTitle(): string {
    if (this.isAssigningAccommodation) {
      return 'Assigning Accommodation...';
    } else if (this.isLoadingAttendees) {
      return 'Loading Attendees...';
    } else if (this.isDeleting) {
      return 'Deleting Camp Meeting...';
    } else if (this.isCreating) {
      return this.isEditMode
        ? 'Updating Camp Meeting...'
        : 'Creating Camp Meeting...';
    } else {
      return 'Loading Camp Meetings...';
    }
  }

  // Get loading message
  getLoadingMessage(): string {
    if (this.isAssigningAccommodation) {
      return 'Please wait while we assign the accommodation.';
    } else if (this.isLoadingAttendees) {
      return 'Please wait while we fetch the attendees for this camp meeting.';
    } else if (this.isDeleting) {
      return 'Please wait while we delete the camp meeting.';
    } else if (this.isCreating) {
      return this.isEditMode
        ? 'Please wait while we update the camp meeting.'
        : 'Please wait while we create the camp meeting.';
    } else {
      return 'Please wait while we fetch camp meeting data.';
    }
  }

  // Confirm prompt properties
  showConfirmPrompt = false;
  promptConfig: any = null;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private campMeetingService: CampMeetingService,
    private alertService: AlertService
  ) {
    this.userRole = this.authService.getWorkerRole();
    this.currentUser = this.authService.getCurrentWorker();
  }

  ngOnInit() {
    this.loadCampMeetings();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Tab switching
  switchToCampMeeting() {
    this.activeTab = 'camp-meeting';
  }

  switchToAttendees() {
    this.activeTab = 'attendees';
    // Load attendees for the selected meeting if available
    if (this.selectedMeetingForAttendees) {
      this.loadAttendees(this.selectedMeetingForAttendees.id);
    }
  }

  // Load attendees for a specific camp meeting
  loadAttendees(meetingId: number) {
    this.isLoadingAttendees = true;

    const attendeesSub = this.campMeetingService
      .getCampMeetingAttendees(meetingId)
      .pipe(
        finalize(() => {
          this.isLoadingAttendees = false;
        })
      )
      .subscribe({
        next: (response: AttendeesApiResponse) => {
          console.log('Full API response:', response);
          if (response.status === 'success') {
            this.attendees = response.data;
            console.log('Attendees data:', this.attendees);
            this.updateAttendeesTableData();
          } else {
            this.alertService.error('Failed to load attendees');
          }
        },
        error: (error) => {
          console.error('Error loading attendees:', error);
          this.alertService.error('Failed to load attendees');
        },
      });

    this.subscriptions.push(attendeesSub);
  }

  // Handle camp meeting selection for attendees
  onCampMeetingSelected(meeting: CampMeetingRecord | null) {
    if (meeting) {
      this.selectedMeetingForAttendees = meeting;
      this.loadAttendees(meeting.id);
    } else {
      this.selectedMeetingForAttendees = null;
      this.attendees = [];
      this.attendeesTableData = [];
    }
  }

  // Handle select change event
  onMeetingSelectChange(event: any) {
    const selectedId = event.target.value;
    if (selectedId) {
      const meeting = this.campMeetings.find((m) => m.id === +selectedId);
      this.onCampMeetingSelected(meeting || null);
    } else {
      this.onCampMeetingSelected(null);
    }
  }

  // Table headers for attendees
  attendeesTableHeader: TableHeader[] = [
    { key: 'id', label: 'EMPLOYEE ID' },
    { key: 'name', label: 'EMPLOYEE NAME' },
    { key: 'department', label: 'DEPARTMENT' },
    { key: 'role', label: 'ROLE' },
    { key: 'status', label: 'ROOM STATUS' },
    { key: 'action', label: 'ACTION' },
  ];

  // Update attendees table data
  updateAttendeesTableData() {
    this.attendeesTableData = this.attendees.map((attendee) => {
      // Check if room is assigned
      const hasAssignedRoom =
        attendee.campMeetingAttendances &&
        attendee.campMeetingAttendances.length > 0 &&
        attendee.campMeetingAttendances[0].assignedRoom !== null;

      const employeeName =
        `${attendee.firstName || ''} ${attendee.lastName || ''}`.trim() ||
        'N/A';

      const row = {
        id: attendee.employeeId || 'N/A',
        name: employeeName,
        department:
          attendee.departments?.length > 0
            ? attendee.departments[0].name
            : 'N/A',
        role: attendee.user?.role?.name || 'N/A',
        imageUrl: this.formatImageUrl(attendee.photoUrl || null),
        status: (hasAssignedRoom ? 'Assigned' : 'Unassigned') as
          | 'Assigned'
          | 'Unassigned',
        action: 'view',
      };
      return row;
    });
  }

  // Helper function to properly format image URLs
  formatImageUrl(url: string | null): string {
    // First try to get the photo URL from localStorage if no URL is provided
    if (!url) {
      const storedPhotoUrl = localStorage.getItem('workerPhotoUrl');
      if (storedPhotoUrl && storedPhotoUrl !== '') {
        url = storedPhotoUrl;
      }
    }

    // If still no URL, use a generic avatar fallback
    if (!url || url === '') {
      return 'assets/svg/gender.svg'; // Use gender.svg as fallback instead of profilePix.svg
    }

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  // Transform attendees to table data (kept for backward compatibility)
  getAttendeesTableData(): TableData[] {
    return this.attendeesTableData;
  }

  // Map employee status to valid TableData status
  private mapEmployeeStatus(
    employeeStatus: string | null | undefined
  ):
    | 'Active'
    | 'On leave'
    | 'Retired'
    | 'On Discipline'
    | 'Approved'
    | 'Pending'
    | 'Rejected'
    | undefined {
    if (!employeeStatus) return undefined;

    const status = employeeStatus.toUpperCase();
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'ON LEAVE':
        return 'On leave';
      case 'RETIRED':
        return 'Retired';
      case 'ON DISCIPLINE':
        return 'On Discipline';
      case 'APPROVED':
        return 'Approved';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Active'; // Default to Active for unknown statuses
    }
  }

  // Load camp meetings from API
  loadCampMeetings() {
    this.isLoading = true;

    const campMeetingSub = this.campMeetingService
      .getCampMeetings()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: CampMeetingApiResponse) => {
          if (response.status === 'success' && response.data) {
            this.campMeetings = response.data;
            this.campMeetingCalendarEvents =
              this.campMeetingService.transformToCalendarEvents(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading camp meetings:', error);
          this.alertService.error(
            'Failed to load camp meetings. Please try again.'
          );
        },
      });

    this.subscriptions.push(campMeetingSub);
  }

  handleCalendarEventClick = (info: any) => {
    const meetingData = info.event.extendedProps?.originalData;

    if (meetingData) {
      this.selectedMeetingData = meetingData;
      this.showSlideIn = true;
    }
  };

  onTableMenuAction(event: { action: string; row: any }) {
    // Handle calendar event clicks here
    if (event.action === 'view') {
      // Check if we're in the attendees tab
      if (this.activeTab === 'attendees') {
        // Find the attendee data from the attendees array
        const attendee = this.attendees.find(
          (a) => a.employeeId === event.row.id
        );

        if (attendee) {
          this.onAttendeeViewAction(attendee);
        }
      } else {
        // Handle camp meeting view
        const meetingData = event.row.extendedProps?.originalData;
        if (meetingData) {
          this.selectedMeetingData = meetingData;
          this.showSlideIn = true;
        }
      }
    }
  }

  // Handle create button click
  onCreateButtonClick() {
    this.showCreateSlideOut = true;
  }

  // Handle create slide-out close
  onCreateSlideOutClose() {
    this.showCreateSlideOut = false;
    this.isEditMode = false;
    this.editingMeetingId = null;
    this.selectedMeetingData = null; // Clear the selected meeting data
  }

  // Handle edit button click
  onEditButtonClick(meeting: CampMeetingRecord) {
    this.isEditMode = true;
    this.editingMeetingId = meeting.id;
    this.selectedMeetingData = meeting; // Set the meeting data for edit mode
    this.showCreateSlideOut = true;
  }

  // Handle delete button click
  onDeleteButtonClick(meeting: CampMeetingRecord) {
    // Store the meeting data for deletion
    this.meetingToDelete = meeting;
    this.showDeleteConfirmation = true;
  }

  // Handle delete confirmation
  onDeleteConfirmed(confirmed: boolean) {
    this.showDeleteConfirmation = false;

    if (confirmed && this.meetingToDelete) {
      this.isDeleting = true;

      // Close the slide-in immediately
      this.showSlideIn = false;
      this.selectedMeetingData = null;

      const deleteSub = this.campMeetingService
        .deleteCampMeeting(this.meetingToDelete.id)
        .subscribe({
          next: (response) => {
            this.isDeleting = false;
            this.meetingToDelete = null;
            if (response.status === 'success') {
              this.alertService.success('Camp meeting deleted successfully!');
              this.loadCampMeetings(); // Reload the list
            } else {
              this.alertService.error(
                'Failed to delete camp meeting. Please try again.'
              );
            }
          },
          error: (error) => {
            this.isDeleting = false;
            this.meetingToDelete = null;
            console.error('Error deleting camp meeting:', error);
            this.alertService.error(
              'Failed to delete camp meeting. Please try again.'
            );
          },
        });

      this.subscriptions.push(deleteSub);
    }
  }

  // Handle create/update form submission
  onCreateFormSubmitted(formData: any) {
    this.isCreating = true;

    // Store edit mode state before clearing
    const isEditMode = this.isEditMode;
    const editingMeetingId = this.editingMeetingId;

    // Close the slide-out immediately
    this.showCreateSlideOut = false;
    this.isEditMode = false;
    this.editingMeetingId = null;
    this.selectedMeetingData = null;

    // Transform form data to match API requirements
    const requestData: CreateCampMeetingRequest = {
      agenda: formData.agenda || formData.reason,
      startDate: formData.startDate,
      endDate: formData.startDate, // Use same date as start date since no end date
      attendees: formData.attendees || [],
    };

    let apiCall;
    if (isEditMode && editingMeetingId) {
      // Update existing camp meeting
      apiCall = this.campMeetingService.updateCampMeeting(
        editingMeetingId,
        requestData
      );
    } else {
      // Create new camp meeting
      apiCall = this.campMeetingService.createCampMeeting(requestData);
    }

    const subscription = apiCall.subscribe({
      next: (response: any) => {
        this.isCreating = false;
        if (response.status === 'success') {
          const action = isEditMode ? 'updated' : 'created';
          this.alertService.success(`Camp meeting ${action} successfully!`);
          this.loadCampMeetings(); // Reload the list
        } else {
          const action = isEditMode ? 'update' : 'create';
          this.alertService.error(
            `Failed to ${action} camp meeting. Please try again.`
          );
        }
      },
      error: (error: any) => {
        this.isCreating = false;
        const action = isEditMode ? 'updating' : 'creating';
        console.error(`Error ${action} camp meeting:`, error);
        this.alertService.error(
          `Failed to ${action} camp meeting. Please try again.`
        );
      },
    });

    this.subscriptions.push(subscription);
  }

  onSlideInClose() {
    this.showSlideIn = false;
    this.selectedMeetingData = null;
  }

  getMeetingAsLeaveData(): any {
    if (!this.selectedMeetingData) {
      return {};
    }

    return this.campMeetingService.transformForDetailView(
      this.selectedMeetingData
    );
  }

  // Attendee view action methods
  onAttendeeViewAction(attendee: CampMeetingAttendee) {
    this.selectedAttendee = attendee;
    this.showAttendeeSlideOut = true;
  }

  onAttendeeDetailsClose() {
    this.showAttendeeSlideOut = false;
    this.selectedAttendee = null;
  }

  // Accommodation assignment properties
  showAssignAccommodationSlideOut = false;
  accommodations: any[] = [];
  selectedAccommodation: any = null;
  selectedRoom: any = null;
  assignmentFormData = {
    accommodationId: '',
    accommodationName: '',
    accommodationType: '',
    roomId: '',
    roomName: '',
    capacity: '',
  };

  // Load accommodations for assignment
  loadAccommodations() {
    this.apiService.get('/accommodation').subscribe({
      next: (response: any) => {
        this.accommodations = response.data || [];
      },
      error: (error) => {
        this.alertService.error('Failed to load accommodations');
        console.error('Error loading accommodations:', error);
      },
    });
  }

  // Handle accommodation selection
  onAccommodationSelect(accommodationType: string) {
    // Find the accommodation object based on the selected type
    const accommodation = this.accommodations.find(
      (acc) => acc.type === accommodationType
    );

    if (accommodation) {
      this.selectedAccommodation = accommodation;
      this.assignmentFormData.accommodationId = accommodation.id;
      this.assignmentFormData.accommodationName = accommodation.name;
      this.assignmentFormData.accommodationType = accommodation.type;
    } else {
      this.selectedAccommodation = null;
      this.assignmentFormData.accommodationId = '';
      this.assignmentFormData.accommodationName = '';
      this.assignmentFormData.accommodationType = '';
    }

    // Reset room selection when accommodation changes
    this.selectedRoom = null;
    this.assignmentFormData.roomId = '';
    this.assignmentFormData.roomName = '';
    this.assignmentFormData.capacity = '';
  }

  // Handle room selection
  onRoomSelect(roomName: string) {
    if (!this.selectedAccommodation) return;

    // Find the room object based on the selected room name
    const room = this.selectedAccommodation.rooms?.find(
      (r: any) => r.name === roomName
    );

    if (room) {
      this.selectedRoom = room;
      this.assignmentFormData.roomId = room.id;
      this.assignmentFormData.roomName = room.name;
      this.assignmentFormData.capacity = room.capacity?.toString() || '';
    } else {
      this.selectedRoom = null;
      this.assignmentFormData.roomId = '';
      this.assignmentFormData.roomName = '';
      this.assignmentFormData.capacity = '';
    }
  }

  // Open assignment slide-out
  onAssignAccommodation() {
    this.showAssignAccommodationSlideOut = true;
    this.loadAccommodations();
    this.resetAssignmentForm();
  }

  // Close assignment slide-out
  onAssignAccommodationClose() {
    this.showAssignAccommodationSlideOut = false;
    this.resetAssignmentForm();
  }

  // Reset assignment form
  resetAssignmentForm() {
    this.selectedAccommodation = null;
    this.selectedRoom = null;
    this.assignmentFormData = {
      accommodationId: '',
      accommodationName: '',
      accommodationType: '',
      roomId: '',
      roomName: '',
      capacity: '',
    };
  }

  // Submit accommodation assignment
  onAssignAccommodationSubmit(assignmentData: any) {
    if (!this.selectedAttendee || !this.selectedRoom) {
      this.alertService.error('Please select a room for assignment');
      return;
    }

    // Show confirmation prompt
    this.promptConfig = {
      title: 'Confirm Assignment',
      message: `Are you sure you want to assign ${this.selectedAttendee.firstName} ${this.selectedAttendee.lastName} to ${this.assignmentFormData.roomName}?`,
      confirmText: 'Assign',
      cancelText: 'Cancel',
    };
    this.showConfirmPrompt = true;
  }

  // Handle confirm assignment
  onConfirmAssignment() {
    this.showConfirmPrompt = false;
    this.assignRoomToAttendee();
  }

  // Handle cancel assignment
  onCancelAssignment() {
    this.showConfirmPrompt = false;
  }

  // Assign room to attendee via API
  assignRoomToAttendee() {
    if (
      !this.selectedAttendee ||
      !this.selectedRoom ||
      !this.selectedMeetingForAttendees
    ) {
      this.alertService.error('Missing required data for assignment');
      return;
    }

    const requestBody = {
      meetingId: this.selectedMeetingForAttendees.id,
      roomId: this.selectedRoom.id,
      employeeId: this.selectedAttendee.id,
    };

    this.apiService.post('/camp-meeting/assign-room', requestBody).subscribe({
      next: (response) => {
        this.alertService.success('Accommodation assigned successfully');
        this.onAssignAccommodationClose();
        this.showAttendeeSlideOut = false;
        // Refresh attendees list to show updated status
        if (this.selectedMeetingForAttendees) {
          this.loadAttendees(this.selectedMeetingForAttendees.id);
        }
      },
      error: (error) => {
        this.alertService.error('Failed to assign accommodation');
        console.error('Error assigning room:', error);
      },
    });
  }

  // Create a basic employee object for the employee-details component
  getAttendeeForEmployeeDetails(): any {
    if (!this.selectedAttendee) {
      return null;
    }

    // Check if attendee has assigned room
    const attendances = this.selectedAttendee.campMeetingAttendances || [];
    const firstAttendance = attendances.length > 0 ? attendances[0] : null;
    const assignedRoom = firstAttendance?.assignedRoom || null;
    const hasAssignedRoom = assignedRoom !== null;

    return {
      id: this.selectedAttendee.id.toString(),
      employeeId: this.selectedAttendee.employeeId,
      firstName: this.selectedAttendee.firstName,
      lastName: this.selectedAttendee.lastName,
      middleName: this.selectedAttendee.middleName || '',
      gender: this.selectedAttendee.gender || '',
      profferedName: this.selectedAttendee.profferedName || '',
      primaryPhone: this.selectedAttendee.primaryPhone || '',
      altPhone: this.selectedAttendee.altPhone || '',
      dob: this.selectedAttendee.dob || '',
      maritalStatus: this.selectedAttendee.maritalStatus || '',
      photoUrl: this.selectedAttendee.photoUrl || '',
      altEmail: this.selectedAttendee.altEmail || '',
      employeeStatus: this.selectedAttendee.employeeStatus || '',
      employmentType: this.selectedAttendee.employmentType || '',
      serviceStartDate: this.selectedAttendee.serviceStartDate || '',
      createdAt: this.selectedAttendee.createdAt,
      updatedAt: this.selectedAttendee.updatedAt,
      departments: this.selectedAttendee.departments || [],
      user: this.selectedAttendee.user || null,
      // Add missing required properties with default values
      nationIdNumber: '',
      recentCredentialsNameArea: '',
      spouse: null,
      children: [],
      payrolls: [],
      documents: [],
      credentials: [],
      homeAddress: null,
      mailingAddress: null,
      departmentHeads: [],
      previousPositions: [],
      spiritualHistory: null,
      title: this.selectedAttendee.title || '',
      everDivorced: this.selectedAttendee.everDivorced,
      beenConvicted: this.selectedAttendee.beenConvicted,
      hasQuestionableBackground:
        this.selectedAttendee.hasQuestionableBackground,
      hasBeenInvestigatedForMisconductOrAbuse:
        this.selectedAttendee.hasBeenInvestigatedForMisconductOrAbuse,
      retiredDate: this.selectedAttendee.retiredDate || '',
      deletedAt: this.selectedAttendee.deletedAt || '',
      // Accommodation information
      hasAssignedRoom: hasAssignedRoom,
      assignedRoom: assignedRoom,
      accommodationStatus: hasAssignedRoom ? 'Assigned' : 'Unassigned',
    };
  }
}
