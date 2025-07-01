import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { FORM_OPTIONS } from '../../shared/constants/form-options';
import { FormValidationService } from '../../shared/services/form-validation.service';
import {
  FileUploadService,
  UploadedFile,
} from '../../shared/services/file-upload.service';

@Component({
  selector: 'app-profile-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-create.component.html',
})
export class ProfileCreateComponent {
  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  uploadedFiles: UploadedFile[] = [];

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
    private validationService: FormValidationService,
    private fileUploadService: FileUploadService
  ) {
    this.profileForm = this.createForm();
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
      console.log('Form submitted:', this.profileForm.value);
      // Handle form submission here
    } else {
      console.log('Form is invalid');
      this.markAllFieldsAsTouched();
      this.scrollToFirstError();
    }
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
