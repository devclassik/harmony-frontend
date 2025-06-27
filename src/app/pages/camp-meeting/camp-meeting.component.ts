import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../components/table/table.component';
import { LeaveDetailsComponent } from '../../components/leave-details/leave-details.component';

interface CampMeetingEvent {
  id: string;
  title: string;
  date: string;
  status: 'Preparation' | 'In Progress' | 'Completed';
  attendees: string[];
  documents: CampMeetingDocument[];
}

interface CampMeetingDocument {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
}

@Component({
  selector: 'app-camp-meeting',
  imports: [CommonModule, TableComponent, LeaveDetailsComponent],
  templateUrl: './camp-meeting.component.html',
  styleUrl: './camp-meeting.component.css',
})
export class CampMeetingComponent implements OnInit {
  userRole: string | null;
  currentUser: any;

  // Slide-in state
  showSlideIn = false;
  selectedMeetingData: CampMeetingEvent | null = null;

  // Calendar events for camp meetings
  campMeetingCalendarEvents = [
    {
      id: 'cm-001',
      title: 'Pre Camp Meeting',
      date: '2025-06-15',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#ffffff',
    },
    {
      id: 'cm-002',
      title: 'Camp Meeting Coordination',
      date: '2025-06-25',
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#ffffff',
    },
  ];

  // Mock camp meeting events with detailed data
  campMeetingEvents: { [key: string]: CampMeetingEvent } = {
    '2025-06-15': {
      id: 'cm-001',
      title: 'Pre Camp Meeting',
      date: '15-06-2025',
      status: 'Preparation',
      attendees: [
        'John Adegoke',
        'Jane Adesanya',
        'John Adegoke',
        'Jane Adesanya',
        'John Adegoke',
        'Jane Adesanya',
      ],
      documents: [
        {
          id: 'doc-001',
          title: 'Trustees Code of Conduct',
          type: 'Policy Document',
          status: 'pending',
          uploadDate: '06-06-2025',
        },
        {
          id: 'doc-002',
          title: 'Trustees Code of Conduct',
          type: 'Policy Document',
          status: 'approved',
          uploadDate: '05-06-2025',
        },
        {
          id: 'doc-003',
          title: 'Trustees Code of Conduct',
          type: 'Policy Document',
          status: 'rejected',
          uploadDate: '04-06-2025',
        },
      ],
    },
    '2025-06-25': {
      id: 'cm-002',
      title: 'Camp Meeting Coordination',
      date: '25-06-2025',
      status: 'In Progress',
      attendees: [
        'Mary Johnson',
        'David Smith',
        'Sarah Wilson',
        'Michael Brown',
        'Lisa Davis',
      ],
      documents: [
        {
          id: 'doc-004',
          title: 'Meeting Agenda',
          type: 'Planning Document',
          status: 'approved',
          uploadDate: '20-06-2025',
        },
        {
          id: 'doc-005',
          title: 'Venue Requirements',
          type: 'Logistics Document',
          status: 'pending',
          uploadDate: '21-06-2025',
        },
      ],
    },
  };

  constructor(private authService: AuthService) {
    this.userRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
    // Table component handles calendar initialization
  }

  handleCalendarEventClick = (info: any) => {
    const eventDate = info.event.startStr;
    const meetingData = this.campMeetingEvents[eventDate];

    if (meetingData) {
      this.selectedMeetingData = meetingData;
      this.showSlideIn = true;
    }
  };

  onTableMenuAction(event: { action: string; row: any }) {
    // Handle calendar event clicks here
    if (event.action === 'view' && event.row.date) {
      // Convert event date to our meeting data lookup
      const meetingData = this.findMeetingByDate(event.row.date);
      if (meetingData) {
        this.selectedMeetingData = meetingData;
        this.showSlideIn = true;
      }
    }
  }

  private findMeetingByDate(date: string): CampMeetingEvent | null {
    // Find meeting data by date
    for (const [key, meeting] of Object.entries(this.campMeetingEvents)) {
      if (meeting.date === date || key === date) {
        return meeting;
      }
    }
    return null;
  }

  onSlideInClose() {
    this.showSlideIn = false;
    this.selectedMeetingData = null;
  }

  getMeetingAsLeaveData(): any {
    if (!this.selectedMeetingData) {
      return {};
    }

    return {
      startDate: this.selectedMeetingData.date,
      status: this.mapCampMeetingStatus(this.selectedMeetingData.status),
      reason: `Camp Meeting: ${this.selectedMeetingData.title}`,
      attendees: this.selectedMeetingData.attendees,
      documents: this.selectedMeetingData.documents,
      requestType: 'Camp Meeting',
      substitution: 'N/A',
    };
  }

  private mapCampMeetingStatus(status: string): string {
    switch (status) {
      case 'Preparation':
        return 'Pending';
      case 'In Progress':
        return 'Approved';
      case 'Completed':
        return 'Approved';
      default:
        return 'Pending';
    }
  }
}
