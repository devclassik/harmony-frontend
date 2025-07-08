import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FORM_OPTIONS } from '../../shared/constants/form-options';
import { FormValidationService } from '../../shared/services/form-validation.service';
import {
  FileUploadService,
  UploadedFile,
} from '../../shared/services/file-upload.service';
import { EmployeeDetails, UpdateEmployeeRequest } from '../../dto/employee.dto';
import { EmployeeService } from '../../services/employee.service';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-profile-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingOverlayComponent],
  templateUrl: './profile-create.component.html',
})
export class ProfileCreateComponent implements OnInit, OnChanges {
  @Input() employeeData: EmployeeDetails | null = null;

  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  uploadedFiles: UploadedFile[] = [];
  isEditMode = false;
  isSubmitting = false;

  // Form options from constants
  titles = FORM_OPTIONS.titles;
  genders = FORM_OPTIONS.genders;
  maritalStatuses = FORM_OPTIONS.maritalStatuses;
  everDivorcedOptions = FORM_OPTIONS.yesNoOptions;
  sanctifiedOptions = FORM_OPTIONS.yesNoOptions;
  baptizedOptions = FORM_OPTIONS.yesNoOptions;
  tithingOptions = FORM_OPTIONS.yesNoOptions;
  apostolicChurchOptions = FORM_OPTIONS.yesNoOptions;
  cities = FORM_OPTIONS.cities;
  states = FORM_OPTIONS.states;
  countries = FORM_OPTIONS.countries;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private validationService: FormValidationService,
    private fileUploadService: FileUploadService,
    private employeeService: EmployeeService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.checkEditMode();
    this.prefillFormIfNeeded();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employeeData']) {
      this.checkEditMode();
      this.prefillFormIfNeeded();
    }
  }

  private checkEditMode() {
    this.isEditMode = this.employeeData !== null;
  }

  private prefillFormIfNeeded() {
    if (this.employeeData) {
      this.prefillForm(this.employeeData);
    }
  }

  private prefillForm(employeeData: EmployeeDetails) {
    // Set avatar preview if photoUrl exists, otherwise use default fallback
    if (employeeData.photoUrl) {
      this.avatarPreview = employeeData.photoUrl;
    } else {
      this.avatarPreview = 'assets/svg/gender.svg';
    }

    // Pre-fill form with employee data
    this.profileForm.patchValue({
      title: employeeData.title || '',
      legalFirstName: employeeData.firstName || '',
      legalMiddleName: employeeData.middleName || '',
      legalLastName: employeeData.lastName || '',
      profferedName: employeeData.profferedName || '',
      gender: employeeData.gender || '',
      maritalStatus: employeeData.maritalStatus || '',
      dateOfBirth: employeeData.dob
        ? new Date(employeeData.dob).toISOString().split('T')[0]
        : '',
      primaryPhone: employeeData.primaryPhone || '',
      alternatePhone: employeeData.altPhone || '',
      emailAddress: employeeData.altEmail || '',
      homeAddress: employeeData.homeAddress
        ? `${employeeData.homeAddress.street || ''}, ${
            employeeData.homeAddress.city || ''
          }, ${employeeData.homeAddress.state || ''}`.replace(
            /^,\s*|,\s*$/g,
            ''
          )
        : '',
      mailingAddress: employeeData.mailingAddress
        ? `${employeeData.mailingAddress.street || ''}, ${
            employeeData.mailingAddress.city || ''
          }, ${employeeData.mailingAddress.state || ''}`.replace(
            /^,\s*|,\s*$/g,
            ''
          )
        : '',
      cityTown: employeeData.homeAddress?.city || '',
      stateProvince: employeeData.homeAddress?.state || '',
      country: employeeData.homeAddress?.country || '',
      zipCode: employeeData.homeAddress?.zipCode || '',
      cityTown2: employeeData.mailingAddress?.city || '',
      stateProvince2: employeeData.mailingAddress?.state || '',
      country2: employeeData.mailingAddress?.country || '',
      zipCode2: employeeData.mailingAddress?.zipCode || '',
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required]],
      legalFirstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      legalMiddleName: [
        '',
        [Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      legalLastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      profferedName: [
        '',
        [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]*$/)],
      ],
      gender: ['', [Validators.required]],
      avatar: [null],
      // Personal Information
      maritalStatus: ['', [Validators.required]],
      everDivorced: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      nationalIdNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
        ],
      ],
      // Spiritual History
      yearSaved: ['', [Validators.required]],
      sanctified: ['', [Validators.required]],
      baptizedWithHolySpirit: ['', [Validators.required]],
      yearWaterBaptized: ['', [Validators.required]],
      firstYearInApostolicChurch: ['', [Validators.required]],
      areFaithfulInTithing: ['', [Validators.required]],
      areaOfService: ['', [Validators.required]],
      everServedInApostolicChurch: ['', [Validators.required]],
      serviceDate: ['', [Validators.required]],
      serviceLocation: ['', [Validators.required]],
      serviceCityTown: ['', [Validators.required]],
      serviceStateProvince: ['', [Validators.required]],
      serviceCountry: ['', [Validators.required]],
      pastor: ['', [Validators.required]],
      previousPosition: ['', [Validators.required]],
      previousPositionTitle: ['', [Validators.required]],
      previousPositionDate: ['', [Validators.required]],
      ordained: ['', [Validators.required]],
      ordainedDate: ['', [Validators.required]],
      // Legal Questions
      convictedOfCrime: ['', [Validators.required]],
      sexualMisconductInvestigation: ['', [Validators.required]],
      integrityQuestionableBackground: ['', [Validators.required]],
      // References
      referenceName: ['', [Validators.required]],
      referencePhone: [
        '',
        [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)],
      ],
      referenceEmail: ['', [Validators.required, Validators.email]],
      referenceAddress: ['', [Validators.required]],
      referenceCityTown: ['', [Validators.required]],
      referenceStateProvince: ['', [Validators.required]],
      referenceCountry: ['', [Validators.required]],
      referenceZipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],
      howDoYouKnowThisPerson: ['', [Validators.required]],
      highestAcademicQualification: ['', [Validators.required]],
      fieldOfStudy: ['', [Validators.required]],
      highestAcademicQualificationDetails: ['', [Validators.required]],
      detailsOfCurrentEmployment: ['', [Validators.required]],
      // Contact Information
      homeAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      cityTown: ['', [Validators.required]],
      stateProvince: ['', [Validators.required]],
      country: ['', [Validators.required]],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)],
      ],
      mailingAddress: ['', [Validators.maxLength(200)]],
      cityTown2: [''],
      stateProvince2: [''],
      country2: [''],
      zipCode2: ['', [Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      primaryPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)],
      ],
      primaryPhoneType: [''],
      alternatePhone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      alternatePhoneType: [''],
      emailAddress: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      other: ['', [Validators.maxLength(500)]],
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.profileForm.patchValue({ avatar: file });
      const reader = new FileReader();
      reader.onload = (e) => (this.avatarPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;

      if (this.isEditMode) {
        this.updateProfile();
      } else {
        this.createProfile();
      }
    } else {
      console.log('Form is invalid');
      this.markAllFieldsAsTouched();
      this.scrollToFirstError();
    }
  }

  private updateProfile() {
    if (!this.employeeData) {
      console.error('Employee data not available for update');
      this.isSubmitting = false;
      return;
    }

    const updateData: UpdateEmployeeRequest = this.mapFormToUpdateRequest();

    // ======= TEMPORARY TESTING OVERRIDE - REMOVE BEFORE PRODUCTION =======
    const employeeId = 18; // Using the same ID as in dashboard
    // ======= END TEMPORARY TESTING OVERRIDE =======

    this.employeeService.updateEmployee(employeeId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'success') {
          console.log('Profile updated successfully:', response.data);

          // Navigate to profile view component
          this.router.navigate(['/profile-view']);
        } else {
          console.error('Update failed:', response.message);
          alert('Failed to update profile: ' + response.message);
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      },
    });
  }

  private createProfile() {
    // For now, just show alert as create endpoint might be different
    this.isSubmitting = false;
    alert('Profile creation not implemented yet');
  }

  private mapFormToUpdateRequest(): UpdateEmployeeRequest {
    const formValue = this.profileForm.value;

    return {
      firstName: formValue.legalFirstName,
      lastName: formValue.legalLastName,
      middleName: formValue.legalMiddleName,
      title: formValue.title,
      gender: formValue.gender,
      profferedName: formValue.profferedName,
      primaryPhone: formValue.primaryPhone,
      primaryPhoneType: formValue.primaryPhoneType,
      altPhone: formValue.alternatePhone,
      altPhoneType: formValue.alternatePhoneType,
      dob: formValue.dateOfBirth,
      altEmail: formValue.emailAddress,
      maritalStatus: formValue.maritalStatus,
      everDivorced: formValue.everDivorced === 'true',
      employeeStatus: 'ACTIVE', // Default status
      beenConvicted: formValue.convictedOfCrime === 'true',
      hasQuestionableBackground:
        formValue.integrityQuestionableBackground === 'true',
      hasBeenInvestigatedForMisconductOrAbuse:
        formValue.sexualMisconductInvestigation === 'true',
      homeAddress: formValue.homeAddress,
      homeCity: formValue.cityTown,
      homeState: formValue.stateProvince,
      homeCountry: formValue.country,
      homeZipCode: formValue.zipCode,
      mailingAddress: formValue.mailingAddress,
      mailingCity: formValue.cityTown2,
      mailingState: formValue.stateProvince2,
      mailingCountry: formValue.country2,
      mailingZipCode: formValue.zipCode2,
      yearSaved: formValue.yearSaved,
      sanctified: formValue.sanctified === 'true',
      baptizedWithWater: formValue.baptizedWithHolySpirit === 'true',
      yearOfWaterBaptism: formValue.yearWaterBaptized,
      firstYearInChurch: formValue.firstYearInApostolicChurch,
      isFaithfulInTithing: formValue.areFaithfulInTithing === 'true',
      firstSermonPastor: formValue.pastor,
      dateOfFirstSermon: formValue.serviceDate,
      firstSermonAddress: formValue.serviceLocation,
      firstSermonCity: formValue.serviceCityTown,
      firstSermonState: formValue.serviceStateProvince,
      firstSermonCountry: formValue.serviceCountry,
      previousChurchPositions: formValue.previousPosition
        ? [formValue.previousPosition]
        : [],
      // Add other fields as needed
    };
  }

  // Validation methods using service
  hasError(fieldName: string, errorType?: string): boolean {
    const control = this.profileForm.get(fieldName);
    return this.validationService.hasError(control, errorType);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    return this.validationService.getErrorMessage(fieldName, control);
  }

  isFormValid(): boolean {
    return this.profileForm.valid;
  }

  // File upload methods using service
  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    const newFiles = this.fileUploadService.processFiles(
      files,
      this.uploadedFiles
    );
    this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  getFileType(fileName: string): string {
    return this.fileUploadService.getFileType(fileName);
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  // Helper methods
  private markAllFieldsAsTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  private scrollToFirstError() {
    const firstErrorField = document.querySelector('.border-red-500');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
