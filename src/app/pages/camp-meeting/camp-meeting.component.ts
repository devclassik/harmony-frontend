import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../components/table/table.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import {
  CampMeetingService,
  CampMeetingRecord,
  CampMeetingApiResponse,
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

  // Loading states
  isLoading = false;

  // Real data from API
  campMeetings: CampMeetingRecord[] = [];

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  // Calendar events for display
  campMeetingCalendarEvents: any[] = [];

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
