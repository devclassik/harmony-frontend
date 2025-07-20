import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../components/table/table.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { ConfirmPromptComponent } from '../../components/confirm-prompt/confirm-prompt.component';
import {
  CampMeetingService,
  CampMeetingRecord,
  CampMeetingApiResponse,
  CreateCampMeetingRequest,
} from '../../services/camp-meeting.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-camp-meeting',
  imports: [
    CommonModule,
    TableComponent,
    LeaveDetailsComponent,
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

  constructor(
    private authService: AuthService,
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
      // Use the event data directly
      const meetingData = event.row.extendedProps?.originalData;
      if (meetingData) {
        this.selectedMeetingData = meetingData;
        this.showSlideIn = true;
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

      // Close the slide-out immediately
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
}
