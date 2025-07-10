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
  FormArray,
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
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

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

  // Accordion state management
  accordionState = {
    employeeInfo: true,
    contactInfo: true,
    personalInfo: true,
    spiritualHistory: true,
    legalQuestions: true,
    references: true,
    uploadDocuments: true,
  };

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
    private employeeService: EmployeeService,
    private authService: AuthService,
    private alertService: AlertService
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
      ordained: ['', [Validators.required]],
      ordainedDate: ['', [Validators.required]],
      // Previous Positions (FormArray)
      previousPositions: this.fb.array([
        this.fb.group({
          previousPositionTitle: ['', [Validators.required]],
          previousPosition: ['', [Validators.required]],
          previousPositionDate: ['', [Validators.required]],
        }),
      ]),
      // Legal Questions
      convictedOfCrime: ['', [Validators.required]],
      sexualMisconductInvestigation: ['', [Validators.required]],
      integrityQuestionableBackground: ['', [Validators.required]],
      // References (FormArray)
      references: this.fb.array([
        this.fb.group({
          referenceName: ['', [Validators.required]],
          referencePhone: [
            '',
            [Validators.required, Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)],
          ],
          referenceEmail: ['', [Validators.required, Validators.email]],
          referenceAddress: ['', [Validators.required]],
          referenceCityTown: ['', [Validators.required]],
          referenceStateProvince: ['', [Validators.required]],
          referenceCountry: ['', [Validators.required]],
          referenceZipCode: [
            '',
            [Validators.required, Validators.pattern(/^\d{6}$/)],
          ],
          howDoYouKnowThisPerson: ['', [Validators.required]],
        }),
      ]),
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
      country: ['Nigeria', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mailingAddress: ['', [Validators.maxLength(200)]],
      cityTown2: [''],
      stateProvince2: [''],
      country2: ['Nigeria'],
      zipCode2: ['', [Validators.pattern(/^\d{6}$/)]],
      primaryPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)],
      ],
      primaryPhoneType: [''],
      alternatePhone: ['', [Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)]],
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
      this.markAllFieldsAsTouched();
      this.scrollToFirstError();
    }
  }

  private updateProfile() {
    if (!this.employeeData) {
      this.isSubmitting = false;
      return;
    }

    const updateData: UpdateEmployeeRequest = this.mapFormToUpdateRequest();

    // Get employee ID from the current worker data
    const employeeId = this.authService.getCurrentEmployeeId();

    if (!employeeId) {
      this.isSubmitting = false;
      this.alertService.error('Error: No employee ID available for update');
      return;
    }

    this.employeeService.updateEmployee(employeeId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.status === 'success') {
          // Show success message
          this.alertService.success('Profile updated successfully!');

          // Navigate to profile view component
          this.router.navigate(['/profile-view']);
        } else {
          this.alertService.error(
            'Failed to update profile: ' + response.message
          );
        }
      },
      error: (error) => {
        this.isSubmitting = false;

        // Extract detailed error information
        let errorMessage = 'Error updating profile. Please try again.';
        if (error.error) {
          if (error.error.message) {
            errorMessage = `Update failed: ${error.error.message}`;
          } else if (error.error.errors) {
            // Handle validation errors
            const validationErrors = Array.isArray(error.error.errors)
              ? error.error.errors.join(', ')
              : JSON.stringify(error.error.errors);
            errorMessage = `Validation errors: ${validationErrors}`;
          }
        }

        this.alertService.error(errorMessage);
      },
    });
  }

  private createProfile() {
    // For now, just show alert as create endpoint might be different
    this.isSubmitting = false;
    this.alertService.info('Profile creation not implemented yet');
  }

  private mapFormToUpdateRequest(): UpdateEmployeeRequest {
    const formValue = this.profileForm.value;

    // Helper function to safely convert to boolean
    const toBooleanOrUndefined = (value: any): boolean | undefined => {
      if (value === 'true' || value === true) return true;
      if (value === 'false' || value === false) return false;
      return undefined;
    };

    // Helper function to handle empty strings
    const cleanValue = (value: any): any => {
      return value === '' ? undefined : value;
    };

    // Helper function to capitalize title
    const capitalizeTitle = (title: string): string => {
      return title ? title.toUpperCase() : '';
    };

    // Helper function to capitalize gender
    const capitalizeGender = (gender: string): string => {
      return gender ? gender.toUpperCase() : '';
    };

    // Helper function to capitalize marital status
    const capitalizeMaritalStatus = (status: string): string => {
      return status ? status.toUpperCase() : '';
    };

    // Helper function to capitalize phone types
    const capitalizePhoneType = (type: string): string => {
      return type ? type.toUpperCase() : '';
    };

    const updateData: UpdateEmployeeRequest = {
      firstName: cleanValue(formValue.legalFirstName),
      lastName: cleanValue(formValue.legalLastName),
      middleName: cleanValue(formValue.legalMiddleName),
      title: capitalizeTitle(formValue.title),
      gender: capitalizeGender(formValue.gender),
      profferedName: cleanValue(formValue.profferedName),
      primaryPhone: cleanValue(formValue.primaryPhone),
      primaryPhoneType: capitalizePhoneType(formValue.primaryPhoneType),
      altPhone: cleanValue(formValue.alternatePhone),
      altPhoneType: capitalizePhoneType(formValue.alternatePhoneType) ? capitalizePhoneType(formValue.alternatePhoneType) : capitalizePhoneType(formValue.primaryPhoneType),
      dob: cleanValue(formValue.dateOfBirth),
      altEmail: cleanValue(formValue.emailAddress),
      maritalStatus: capitalizeMaritalStatus(formValue.maritalStatus),
      everDivorced: toBooleanOrUndefined(formValue.everDivorced),
      employeeStatus: 'ACTIVE', // Default status
      beenConvicted: toBooleanOrUndefined(formValue.convictedOfCrime),
      hasQuestionableBackground: toBooleanOrUndefined(
        formValue.integrityQuestionableBackground
      ),
      hasBeenInvestigatedForMisconductOrAbuse: toBooleanOrUndefined(
        formValue.sexualMisconductInvestigation
      ),
      homeAddress: cleanValue(formValue.homeAddress),
      homeCity: cleanValue(formValue.cityTown),
      homeState: cleanValue(formValue.stateProvince),
      homeCountry: cleanValue(formValue.country),
      homeZipCode: cleanValue(formValue.zipCode),
      mailingAddress: cleanValue(formValue.mailingAddress),
      mailingCity: cleanValue(formValue.cityTown2),
      mailingState: cleanValue(formValue.stateProvince2),
      mailingCountry: cleanValue(formValue.country2),
      mailingZipCode: cleanValue(formValue.zipCode2),
      yearSaved: cleanValue(formValue.yearSaved),
      sanctified: toBooleanOrUndefined(formValue.sanctified),
      baptizedWithWater: toBooleanOrUndefined(formValue.baptizedWithHolySpirit),
      yearOfWaterBaptism: cleanValue(formValue.yearWaterBaptized),
      firstYearInChurch: cleanValue(formValue.firstYearInApostolicChurch),
      isFaithfulInTithing: toBooleanOrUndefined(formValue.areFaithfulInTithing),
      firstSermonPastor: cleanValue(formValue.pastor),
      dateOfFirstSermon: cleanValue(formValue.serviceDate),
      firstSermonAddress: cleanValue(formValue.serviceLocation),
      firstSermonCity: cleanValue(formValue.serviceCityTown),
      firstSermonState: cleanValue(formValue.serviceStateProvince),
      firstSermonCountry: cleanValue(formValue.serviceCountry),
      // Handle previous positions array - API expects array of strings
      previousChurchPositions:
        formValue.previousPositions
          ?.map((pos: any) => cleanValue(pos.previousPosition))
          .filter((position: string) => position) || [],
    };

    // Remove undefined fields to avoid sending them
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof UpdateEmployeeRequest] === undefined) {
        delete updateData[key as keyof UpdateEmployeeRequest];
      }
    });

    return updateData;
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

  // Helper method to check FormArray control errors
  hasFormArrayError(
    arrayName: string,
    index: number,
    fieldName: string
  ): boolean {
    const formArray = this.profileForm.get(arrayName) as FormArray;
    if (formArray && formArray.at(index)) {
      const control = formArray.at(index).get(fieldName);
      return this.validationService.hasError(control);
    }
    return false;
  }

  getFormArrayErrorMessage(
    arrayName: string,
    index: number,
    fieldName: string
  ): string {
    const formArray = this.profileForm.get(arrayName) as FormArray;
    if (formArray && formArray.at(index)) {
      const control = formArray.at(index).get(fieldName);
      return this.validationService.getErrorMessage(fieldName, control);
    }
    return '';
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

  // Accordion toggle methods
  toggleAccordion(section: string) {
    this.accordionState[section as keyof typeof this.accordionState] =
      !this.accordionState[section as keyof typeof this.accordionState];
  }

  // Previous positions methods
  get previousPositions(): FormArray {
    return this.profileForm.get('previousPositions') as FormArray;
  }

  addPreviousPosition() {
    const previousPositionGroup = this.fb.group({
      previousPositionTitle: ['', [Validators.required]],
      previousPosition: ['', [Validators.required]],
      previousPositionDate: ['', [Validators.required]],
    });
    this.previousPositions.push(previousPositionGroup);
  }

  removePreviousPosition(index: number) {
    this.previousPositions.removeAt(index);
  }

  // References methods
  get references(): FormArray {
    return this.profileForm.get('references') as FormArray;
  }

  addReference() {
    const referenceGroup = this.fb.group({
      referenceName: ['', [Validators.required]],
      referencePhone: [
        '',
        [Validators.required, Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)],
      ],
      referenceEmail: ['', [Validators.required, Validators.email]],
      referenceAddress: ['', [Validators.required]],
      referenceCityTown: ['', [Validators.required]],
      referenceStateProvince: ['', [Validators.required]],
      referenceCountry: ['', [Validators.required]],
      referenceZipCode: [
        '',
        [Validators.required, Validators.pattern(/^\d{6}$/)],
      ],
      howDoYouKnowThisPerson: ['', [Validators.required]],
    });
    this.references.push(referenceGroup);
  }

  removeReference(index: number) {
    this.references.removeAt(index);
  }

  // Helper methods
  private markAllFieldsAsTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      if (control) {
        if (control instanceof FormArray) {
          // Handle FormArray controls
          control.controls.forEach((arrayControl) => {
            if (arrayControl instanceof FormGroup) {
              Object.keys(arrayControl.controls).forEach((arrayKey) => {
                arrayControl.get(arrayKey)?.markAsTouched();
              });
            } else {
              arrayControl.markAsTouched();
            }
          });
        } else {
          control.markAsTouched();
        }
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
