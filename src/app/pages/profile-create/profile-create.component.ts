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
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../dto/department.dto';

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

  // Additional options for new fields
  employmentTypeOptions = ['STAFF', 'CONTRACT', 'VOLUNTEER'];
  departments: Department[] = []; // Loaded from API
  phoneTypeOptions = ['HOME', 'WORK', 'CELL'];
  genderOptionsChildren = ['MALE', 'FEMALE'];
  currentUserRole: string = ''; // User's role from API

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private router: Router,
    private validationService: FormValidationService,
    private fileUploadService: FileUploadService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private alertService: AlertService,
    private departmentService: DepartmentService
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit() {
    this.checkEditMode();
    this.prefillFormIfNeeded();
    this.loadDepartments();
    this.loadUserRole();
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

    // Helper function to safely get email from user object
    const getEmailFromUser = () => {
      if (employeeData.user && employeeData.user.email) {
        return employeeData.user.email;
      }
      return '';
    };

    // Pre-fill form with employee data
    this.profileForm.patchValue({
      // Basic employee info
      title: employeeData.title || '',
      legalFirstName: employeeData.firstName || '',
      legalMiddleName: employeeData.middleName || '',
      legalLastName: employeeData.lastName || '',
      profferedName: employeeData.profferedName || '',
      gender: employeeData.gender || '',
      email: getEmailFromUser(),
      altEmail: employeeData.altEmail || '',
      employmentType: employeeData.employmentType || '',

      // Personal info
      maritalStatus: employeeData.maritalStatus || '',
      everDivorced: employeeData.everDivorced || false,
      dateOfBirth: employeeData.dob
        ? new Date(employeeData.dob).toISOString().split('T')[0]
        : '',

      // Contact info
      primaryPhone: employeeData.primaryPhone || '',
      primaryPhoneType: employeeData.primaryPhoneType || '',
      altPhone: employeeData.altPhone || '',
      altPhoneType: employeeData.altPhoneType || '',

      // Address info - Handle mailingAddress object structure
      homeAddress: employeeData.mailingAddress?.address || '',
      homeCity: employeeData.mailingAddress?.city || '',
      homeState: employeeData.mailingAddress?.state || '',
      homeCountry: employeeData.mailingAddress?.country || '',
      homeZipCode: employeeData.mailingAddress?.zipCode || '',

      // Mailing address (copy from mailingAddress if exists)
      mailingAddress: employeeData.mailingAddress?.address || '',
      mailingCity: employeeData.mailingAddress?.city || '',
      mailingState: employeeData.mailingAddress?.state || '',
      mailingCountry: employeeData.mailingAddress?.country || '',
      mailingZipCode: employeeData.mailingAddress?.zipCode || '',

      // Legal questions
      beenConvicted: employeeData.beenConvicted || false,
      hasQuestionableBackground:
        employeeData.hasQuestionableBackground || false,
      hasBeenInvestigatedForMisconductOrAbuse:
        employeeData.hasBeenInvestigatedForMisconductOrAbuse || false,
    });

    // Handle children array if exists
    if (employeeData.children && employeeData.children.length > 0) {
      const childrenArray = this.profileForm.get('children') as FormArray;
      childrenArray.clear();

      employeeData.children.forEach((child) => {
        const childGroup = this.fb.group({
          childName: [child.firstName || '', [Validators.required]],
          childDob: [
            child.dob ? new Date(child.dob).toISOString().split('T')[0] : '',
            [Validators.required],
          ],
          childGender: [child.gender || '', [Validators.required]],
        });
        childrenArray.push(childGroup);
      });
    }

    // Handle spouse info if exists
    if (employeeData.spouse) {
      this.profileForm.patchValue({
        spouseFirstName: employeeData.spouse.firstName || '',
        spouseMiddleName: employeeData.spouse.middleName || '',
        spouseDob: employeeData.spouse.dob
          ? new Date(employeeData.spouse.dob).toISOString().split('T')[0]
          : '',
      });
    }

    // Handle previous positions if exists
    if (
      employeeData.previousPositions &&
      employeeData.previousPositions.length > 0
    ) {
      const positionsArray = this.profileForm.get(
        'previousPositions'
      ) as FormArray;
      positionsArray.clear();

      employeeData.previousPositions.forEach((position) => {
        const positionGroup = this.fb.group({
          previousPositionTitle: [position.title || '', [Validators.required]],
          previousPosition: [position.department || '', [Validators.required]],
          previousPositionDate: [
            position.startDate
              ? new Date(position.startDate).toISOString().split('T')[0]
              : '',
            [Validators.required],
          ],
        });
        positionsArray.push(positionGroup);
      });
    }

    // Handle spiritual history if exists
    if (employeeData.spiritualHistory) {
      this.profileForm.patchValue({
        yearOfWaterBaptism: employeeData.spiritualHistory.baptismDate
          ? new Date(employeeData.spiritualHistory.baptismDate)
              .getFullYear()
              .toString()
          : '',
        dateOfFirstSermon: employeeData.spiritualHistory.baptismDate
          ? new Date(employeeData.spiritualHistory.baptismDate)
              .toISOString()
              .split('T')[0]
          : '',
      });
    }

    // Handle credentials if exists
    if (employeeData.credentials && employeeData.credentials.length > 0) {
      const credential = employeeData.credentials[0]; // Use first credential
      this.profileForm.patchValue({
        credentialName: credential.degree || '',
        credentialNumber: credential.institution || '',
        credentialIssuedDate: credential.graduationYear
          ? `${credential.graduationYear}-01-01`
          : '',
      });
    }
  }

  private loadDepartments() {
    this.departmentService.getActiveDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.alertService.error(
          'Failed to load departments. Please try again.'
        );
        // Fallback to empty array to prevent form errors
        this.departments = [];
      },
    });
  }

  private loadUserRole() {
    // Get current user's role from AuthService
    const currentWorker = this.authService.getCurrentWorker();
    if (currentWorker?.role) {
      this.currentUserRole = currentWorker.role;
      // Set the role in the form and disable it
      this.profileForm.patchValue({ role: this.currentUserRole });
      this.profileForm.get('role')?.disable();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Employee Basic Info
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
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      altEmail: [
        '',
        [
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      departmentId: ['', [Validators.required]],
      role: ['', [Validators.required]],
      employmentType: ['', [Validators.required]],
      location: ['', [Validators.required]],
      avatar: [null],
      // Personal Information
      maritalStatus: ['', [Validators.required]],
      everDivorced: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      highestQualification: [''], // Added to match HTML template
      // Spiritual History
      yearSaved: ['', [Validators.required]],
      sanctified: ['', [Validators.required]],
      baptizedWithWater: ['', [Validators.required]],
      yearOfWaterBaptism: ['', [Validators.required]],
      firstYearInChurch: ['', [Validators.required]],
      isFaithfulInTithing: ['', [Validators.required]],
      firstSermonPastor: ['', [Validators.required]],
      currentPastor: [''],
      dateOfFirstSermon: ['', [Validators.required]],
      spiritualStatus: ['ACTIVE'],
      firstSermonAddress: ['', [Validators.required]],
      firstSermonCity: ['', [Validators.required]],
      firstSermonState: ['', [Validators.required]],
      firstSermonCountry: ['', [Validators.required]],
      firstSermonZipCode: ['', [Validators.required]],
      currentChurchAddress: [''],
      currentChurchCity: [''],
      currentChurchState: [''],
      currentChurchCountry: [''],
      currentChurchZipCode: [''],
      // Previous Positions (FormArray)
      previousPositions: this.fb.array([
        this.fb.group({
          previousPositionTitle: ['', [Validators.required]],
          previousPosition: ['', [Validators.required]],
          previousPositionDate: ['', [Validators.required]],
        }),
      ]),
      // Additional fields to match HTML
      ordained: [''],
      ordainedDate: [''],
      // Spouse Information
      spouseFirstName: [''],
      spouseMiddleName: [''],
      spouseDob: [''],
      weddingDate: [''],
      // Children (FormArray)
      children: this.fb.array([]),
      // Legal Questions
      beenConvicted: ['', [Validators.required]],
      hasQuestionableBackground: ['', [Validators.required]],
      hasBeenInvestigatedForMisconductOrAbuse: ['', [Validators.required]],
      // Credentials
      credentialName: [''],
      credentialNumber: [''],
      credentialIssuedDate: [''],
      credentialExpirationDate: [''],
      // Contact Information
      homeAddress: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      homeCity: ['', [Validators.required]],
      homeState: ['', [Validators.required]],
      homeCountry: ['Nigeria', [Validators.required]],
      homeZipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mailingAddress: ['', [Validators.maxLength(200)]],
      mailingCity: [''],
      mailingState: [''],
      mailingCountry: ['Nigeria'],
      mailingZipCode: ['', [Validators.pattern(/^\d{6}$/)]],
      primaryPhone: [
        '',
        [Validators.required, Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)],
      ],
      primaryPhoneType: ['', [Validators.required]],
      altPhone: ['', [Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)]],
      altPhoneType: [''],
      other: [''], // Additional information field
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
    // Get form value including disabled controls
    const formValue = this.profileForm.getRawValue();

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

    // Helper function to capitalize role
    const capitalizeRole = (role: string): string => {
      return role ? role.toUpperCase() : '';
    };

    const updateData: UpdateEmployeeRequest = {
      // Basic Employee Info
      employeeId: cleanValue(formValue.employeeId),
      firstName: cleanValue(formValue.legalFirstName),
      lastName: cleanValue(formValue.legalLastName),
      middleName: cleanValue(formValue.legalMiddleName),
      title: capitalizeTitle(formValue.title),
      gender: capitalizeGender(formValue.gender),
      profferedName: cleanValue(formValue.profferedName),
      email: cleanValue(formValue.email),
      altEmail: cleanValue(formValue.altEmail),
      departmentId: cleanValue(formValue.departmentId),
      role: capitalizeRole(formValue.role),
      employmentType: cleanValue(formValue.employmentType),
      location: cleanValue(formValue.location),

      // Contact Info
      primaryPhone: cleanValue(formValue.primaryPhone),
      primaryPhoneType: capitalizePhoneType(formValue.primaryPhoneType),
      altPhone:
        cleanValue(formValue.altPhone) || cleanValue(formValue.primaryPhone), // Use primary if alt is empty
      altPhoneType:
        capitalizePhoneType(formValue.altPhoneType) ||
        capitalizePhoneType(formValue.primaryPhoneType),

      // Personal Info
      dob: cleanValue(formValue.dateOfBirth),
      maritalStatus: capitalizeMaritalStatus(formValue.maritalStatus),
      everDivorced: toBooleanOrUndefined(formValue.everDivorced),
      employeeStatus: 'ACTIVE', // Default status

      // Legal Questions
      beenConvicted: toBooleanOrUndefined(formValue.beenConvicted),
      hasQuestionableBackground: toBooleanOrUndefined(
        formValue.hasQuestionableBackground
      ),
      hasBeenInvestigatedForMisconductOrAbuse: toBooleanOrUndefined(
        formValue.hasBeenInvestigatedForMisconductOrAbuse
      ),

      // Address Info
      homeAddress: cleanValue(formValue.homeAddress),
      homeCity: cleanValue(formValue.homeCity),
      homeState: cleanValue(formValue.homeState),
      homeCountry: cleanValue(formValue.homeCountry),
      homeZipCode: cleanValue(formValue.homeZipCode),
      mailingAddress: cleanValue(formValue.mailingAddress),
      mailingCity: cleanValue(formValue.mailingCity),
      mailingState: cleanValue(formValue.mailingState),
      mailingCountry: cleanValue(formValue.mailingCountry),
      mailingZipCode: cleanValue(formValue.mailingZipCode),

      // Spouse Info
      spouseFirstName: cleanValue(formValue.spouseFirstName),
      spouseMiddleName: cleanValue(formValue.spouseMiddleName),
      spouseDob: cleanValue(formValue.spouseDob),
      weddingDate: cleanValue(formValue.weddingDate),

      // Children Array
      children:
        formValue.children?.map((child: any) => ({
          childName: cleanValue(child.childName),
          childDob: cleanValue(child.childDob),
          childGender: capitalizeGender(child.childGender),
        })) || [],

      // Spiritual History
      yearSaved: cleanValue(formValue.yearSaved),
      sanctified: toBooleanOrUndefined(formValue.sanctified),
      baptizedWithWater: toBooleanOrUndefined(formValue.baptizedWithWater),
      yearOfWaterBaptism: cleanValue(formValue.yearOfWaterBaptism),
      firstYearInChurch: cleanValue(formValue.firstYearInChurch),
      isFaithfulInTithing: toBooleanOrUndefined(formValue.isFaithfulInTithing),
      firstSermonPastor: cleanValue(formValue.firstSermonPastor),
      currentPastor: cleanValue(formValue.currentPastor),
      dateOfFirstSermon: cleanValue(formValue.dateOfFirstSermon),
      spiritualStatus: cleanValue(formValue.spiritualStatus) || 'ACTIVE',
      firstSermonAddress: cleanValue(formValue.firstSermonAddress),
      firstSermonCity: cleanValue(formValue.firstSermonCity),
      firstSermonState: cleanValue(formValue.firstSermonState),
      firstSermonCountry: cleanValue(formValue.firstSermonCountry),
      firstSermonZipCode: cleanValue(formValue.firstSermonZipCode),
      currentChurchAddress: cleanValue(formValue.currentChurchAddress),
      currentChurchCity: cleanValue(formValue.currentChurchCity),
      currentChurchState: cleanValue(formValue.currentChurchState),
      currentChurchCountry: cleanValue(formValue.currentChurchCountry),
      currentChurchZipCode: cleanValue(formValue.currentChurchZipCode),

      // Credentials
      credentialName: cleanValue(formValue.credentialName),
      credentialNumber: cleanValue(formValue.credentialNumber),
      credentialIssuedDate: cleanValue(formValue.credentialIssuedDate),
      credentialExpirationDate: cleanValue(formValue.credentialExpirationDate),

      // Previous Positions Array - API expects array of strings
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

  // Children methods
  get children(): FormArray {
    return this.profileForm.get('children') as FormArray;
  }

  addChild() {
    const childGroup = this.fb.group({
      childName: ['', [Validators.required]],
      childDob: ['', [Validators.required]],
      childGender: ['', [Validators.required]],
    });
    this.children.push(childGroup);
  }

  removeChild(index: number) {
    this.children.removeAt(index);
  }

  // Helper methods
  private markAllFieldsAsTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      if (control) {
        if (control instanceof FormArray) {
          // Handle FormArray controls (previousPositions, children)
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
