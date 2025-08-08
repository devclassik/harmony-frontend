import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { EmployeeDetails } from '../../dto/employee.dto';
import { Subscription } from 'rxjs';
import { DashboardInformationComponent } from '../../components/dashboard-information/dashboard-information.component';
import { EmployeeInfo } from '../../interfaces/employee.interface';
import {
  InfoSectionComponent,
  InfoItem,
} from '../../components/info-section/info-section.component';
import { CreateRetirementRequestComponent } from '../../components/create-retirement-request/create-retirement-request.component';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    LoadingOverlayComponent,
    DashboardInformationComponent,
    InfoSectionComponent,
    CreateRetirementRequestComponent,
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.css'],
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  employeeData: EmployeeDetails | null = null;
  isLoadingProfile = false;
  currentWorker: any;
  workerName: string = '';
  employeeInfo: EmployeeInfo | null = null;
  otherInformationData: InfoItem[] = [];
  personalInformationData: InfoItem[] = [];
  spiritualHistoryData: InfoItem[] = [];
  familyInformationData: InfoItem[] = [];
  areaOfServiceData: InfoItem[] = [];
  referencesData: InfoItem[] = [];
  uploadDocumentsData: InfoItem[] = [];
  legalQuestionsData: InfoItem[] = [];
  currentUserRole: string = '';
  showRetirementModal: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadEmployeeProfile();
    this.loadUserRole();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadEmployeeProfile() {
    this.isLoadingProfile = true;

    // Get employee ID from the current worker's data
    const employeeId = this.authService.getCurrentEmployeeId();

    if (!employeeId) {
      this.isLoadingProfile = false;
      this.employeeData = null;
      return;
    }

    const profileSub = this.employeeService
      .getEmployeeById(employeeId)
      .subscribe({
        next: (response) => {
          this.isLoadingProfile = false;
          if (response.status === 'success' && response.data) {
            this.workerName = response.data.profferedName as string;
            this.employeeData = response.data;
            this.employeeInfo = {
              id: this.employeeData.employeeId,
              firstName: this.employeeData.firstName,
              lastName: this.employeeData.lastName,
              middleName: this.employeeData.middleName || 'Not specified',
              title: this.employeeData.title || 'Not specified',
              preferredName:
                this.employeeData.profferedName ||
                `${this.employeeData.firstName} ${this.employeeData.lastName}`,
              gender: this.employeeData.gender || 'Not specified',
              profileImage: this.formatImageUrl(this.employeeData.photoUrl),
              department:
                this.employeeData.departments[0]?.name || 'Not specified',
              location:
                this.employeeData.homeAddress?.address || 'Not specified',
              email: this.employeeData.user?.email || 'Not specified',
              role: this.employeeData.user?.role?.name || 'Not specified',
              status:
                (this.employeeData.employeeStatus as
                  | 'Active'
                  | 'On leave'
                  | 'Retired'
                  | 'On Discipline') || 'Active',
            };

            // Populate all information data
            this.populateOtherInformationData();
            this.populatePersonalInformationData();
            this.populateSpiritualHistoryData();
            this.populateFamilyInformationData();
            this.populateUploadDocumentsData();
            this.populateLegalQuestionsData();
          } else {
            this.employeeData = null;
          }
        },
        error: (error) => {
          this.isLoadingProfile = false;

          this.employeeData = null;
        },
      });

    this.subscriptions.push(profileSub);
  }

  private loadUserRole() {
    this.currentUserRole = this.authService.getCurrentWorker()?.role || '';
  }

  private formatImageUrl(url: string | null): string {
    if (!url) return 'assets/svg/gender.svg';

    // If it's already a complete URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative path, prepend the base URL
    const baseUrl = 'https://harmoney-backend.onrender.com';
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  }

  editProfile() {
    this.router.navigate(['/profile']);
  }

  retireProfile() {
    this.showRetirementModal = true;
  }

  onRetirementModalClose() {
    this.showRetirementModal = false;
  }

  onRetirementSubmit(formData: any) {
    // Get employee ID from the current worker's data
    const employeeId = this.authService.getCurrentEmployeeId();

    if (!employeeId) {
      this.alertService.error('Error: No employee ID found');
      return;
    }

    // Call the retirement API
    this.employeeService
      .createRetirementRequest(employeeId, formData.destinationReason)
      .subscribe({
        next: (response) => {
          this.alertService.success(
            'Retirement request submitted successfully!'
          );
          this.showRetirementModal = false;
          // Optionally reload the profile or update the UI
          this.loadEmployeeProfile();
        },
        error: (error) => {
          this.alertService.error(
            'Failed to submit retirement request. Please try again.'
          );
        },
      });
  }

  editSection(section: string) {
    // Navigate to profile edit with specific section focus
    this.router.navigate(['/profile'], { queryParams: { section } });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Helper methods to get formatted data
  getFullName(): string {
    if (!this.employeeData) return '';
    const parts = [
      this.employeeData.title,
      this.employeeData.firstName,
      this.employeeData.middleName,
      this.employeeData.lastName,
    ].filter(Boolean);
    return parts.join(' ');
  }

  getFormattedAddress(address: any): string {
    if (!address) return 'Not provided';
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.zipCode,
    ].filter(Boolean);
    return parts.join(', ') || 'Not provided';
  }

  getFormattedPhone(): string {
    if (!this.employeeData?.primaryPhone) return 'Not provided';
    return `${this.employeeData.primaryPhone} (${
      this.employeeData.primaryPhoneType || 'Primary'
    })`;
  }

  getFormattedDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  }

  getEmploymentStatus(): string {
    return this.employeeData?.employeeStatus || 'Not specified';
  }

  getEmploymentType(): string {
    return this.employeeData?.employmentType || 'Not specified';
  }

  getDepartments(): string {
    if (
      !this.employeeData?.departments ||
      this.employeeData.departments.length === 0
    ) {
      return 'Not assigned';
    }
    return this.employeeData.departments.map((dept) => dept.name).join(', ');
  }

  private populateOtherInformationData(): void {
    if (!this.employeeData) return;

    this.otherInformationData = [
      {
        label: 'Home Address',
        text: this.getFormattedAddress(this.employeeData.homeAddress),
      },
      {
        label: 'City/Town',
        text: this.employeeData.homeAddress?.city || 'Not specified',
      },
      {
        label: 'State/Province',
        text: this.employeeData.homeAddress?.state || 'Not specified',
      },
      {
        label: 'Country',
        text: this.employeeData.homeAddress?.country || 'Not specified',
      },
      {
        label: 'Zip Code',
        text: this.employeeData.homeAddress?.zipCode || 'Not specified',
      },
      {
        label: 'Mailing Address',
        text: this.getFormattedAddress(this.employeeData.mailingAddress),
      },
      {
        label: 'Primary Phone',
        text: this.employeeData.primaryPhone || 'Not specified',
      },
      {
        label: 'Phone Type',
        text: this.employeeData.primaryPhoneType || 'Not specified',
      },
      {
        label: 'Alternative Phone',
        text: this.employeeData.altPhone || 'Not specified',
      },
      {
        label: 'Alternative Phone Type',
        text: this.employeeData.altPhoneType || 'Not specified',
      },
      {
        label: 'Email Address',
        text: this.employeeData.user?.email || 'Not specified',
      },
    ];
  }

  private populatePersonalInformationData(): void {
    if (!this.employeeData) return;

    this.personalInformationData = [
      {
        label: 'Marital Status',
        text: this.employeeData.maritalStatus || 'Not specified',
      },
      {
        label: 'Ever Divorced',
        text: this.employeeData.everDivorced ? 'Yes' : 'No',
      },
      {
        label: 'Date of Birth',
        text: this.getFormattedDate(this.employeeData.dob),
      },
      {
        label: 'Nation Identification Number',
        text: this.employeeData.nationIdNumber || 'Not specified',
      },
    ];
  }

  private populateSpiritualHistoryData(): void {
    if (!this.employeeData) return;

    this.spiritualHistoryData = [
      {
        label: 'Year Saved',
        text: this.employeeData.spiritualHistory?.yearSaved || 'Not specified',
      },
      {
        label: 'Sanctified',
        text: this.employeeData.spiritualHistory?.sanctified ? 'Yes' : 'No',
      },
      {
        label: 'Baptized With Holy Spirit',
        text: this.employeeData.spiritualHistory?.baptizedWithWater
          ? 'Yes'
          : 'No',
      },
      {
        label: 'Year of Water Baptism',
        text:
          this.employeeData.spiritualHistory?.yearOfWaterBaptism ||
          'Not specified',
      },
      {
        label: 'First Year in Church',
        text:
          this.employeeData.spiritualHistory?.firstYearInChurch ||
          'Not specified',
      },
      {
        label: 'Are you faithful in tithing',
        text: this.employeeData.spiritualHistory?.isFaithfulInTithing
          ? 'Yes'
          : 'No',
      },
    ];

    // Add worker-specific fields
    if (this.currentUserRole === 'worker') {
      this.spiritualHistoryData.push(
        {
          label: 'Area of Service',
          text:
            this.employeeData.spiritualHistory?.areaOfService ||
            'Not specified',
        },
        {
          label: 'Ever Served in Apostolic Church',
          text: this.employeeData.spiritualHistory?.isApostolicChurchMember
            ? 'Yes'
            : 'No',
        },
        {
          label: 'Date',
          text:
            this.getFormattedDate(
              this.employeeData.spiritualHistory?.dateOfFirstSermon
            ) || 'Not specified',
        },
        {
          label: 'Location',
          text:
            this.getFormattedAddress(
              this.employeeData.spiritualHistory?.locationOfFirstSermon
            ) || 'Not specified',
        },
        {
          label: 'City/Town',
          text:
            this.employeeData.spiritualHistory?.locationOfFirstSermon?.city ||
            'Not specified',
        },
        {
          label: 'State/Province',
          text:
            this.employeeData.spiritualHistory?.currentChurchLocation?.state ||
            'Not specified',
        },
        {
          label: 'Country',
          text:
            this.employeeData.spiritualHistory?.currentChurchLocation
              ?.country || 'Not specified',
        },
        {
          label: 'Pastor',
          text:
            this.employeeData.spiritualHistory?.firstSermonPastor ||
            'Not specified',
        },
        {
          label: 'Ordained',
          text: this.employeeData.spiritualHistory?.ordained ? 'Yes' : 'No',
        },
        {
          label: 'Ordained Date',
          text:
            this.getFormattedDate(
              this.employeeData.spiritualHistory?.ordainedDate
            ) || 'Not specified',
        },
        {
          label: 'Previous Church Position',
          text:
            this.employeeData.previousPositions[0]?.title || 'Not specified',
        }
      );
    }
  }

  private populateFamilyInformationData(): void {
    if (!this.employeeData) return;

    this.familyInformationData = [
      {
        label: 'Marital Status',
        text: this.employeeData.maritalStatus || 'Not specified',
      },
      {
        label: 'Ever Divorced',
        text: this.employeeData.everDivorced ? 'Yes' : 'No',
      },
      {
        label: 'Date of Birth',
        text: this.getFormattedDate(this.employeeData.dob) || 'Not specified',
      },
      {
        label: 'Wedding Date',
        text:
          this.getFormattedDate(this.employeeData.spouse?.weddingDate) ||
          'Not specified',
      },
      {
        label: 'Spouse First Name',
        text: this.employeeData.spouse?.firstName || 'Not specified',
      },
      {
        label: 'Spouse Maiden Name',
        text: this.employeeData.spouse?.maidenName || 'Not specified',
      },
      {
        label: 'Spouse Date of Birth',
        text:
          this.getFormattedDate(this.employeeData.spouse?.dob) ||
          'Not specified',
      },
      {
        label: 'Child',
        text: this.employeeData.children[0]?.firstName || 'Not specified',
      },
      {
        label: 'Child Date of Birth',
        text:
          this.getFormattedDate(this.employeeData.children[0]?.dob) ||
          'Not specified',
      },
      {
        label: 'Child Gender',
        text: this.employeeData.children[0]?.gender || 'Not specified',
      },
    ];
  }

  private populateLegalQuestionsData(): void {
    if (!this.employeeData) return;

    this.legalQuestionsData = [
      {
        label: 'Have you ever been convicted of a crime?',
        text: this.employeeData.beenConvicted ? 'Yes' : 'No',
      },
      {
        label: 'Have you ever been investigated for misconduct or abuse?',
        text: this.employeeData.hasBeenInvestigatedForMisconductOrAbuse
          ? 'Yes'
          : 'No',
      },
      {
        label: 'Is there any questionable background?',
        text: this.employeeData.hasQuestionableBackground ? 'Yes' : 'No',
      },
    ];
  }

  private populateUploadDocumentsData(): void {
    if (!this.employeeData) return;

    this.uploadDocumentsData = [
      {
        label: 'Upload Documents',
        text: this.employeeData.documents[0]?.url || 'Not specified',
      },
    ];
  }
}
