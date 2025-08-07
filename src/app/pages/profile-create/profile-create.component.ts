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
import {
  ConfirmPromptComponent,
  PromptConfig,
} from '../../components/confirm-prompt/confirm-prompt.component';

@Component({
  selector: 'app-profile-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingOverlayComponent,
    ConfirmPromptComponent,
  ],
  templateUrl: './profile-create.component.html',
})
export class ProfileCreateComponent implements OnInit, OnChanges {
  @Input() employeeData: EmployeeDetails | null = null;

  profileForm: FormGroup;
  avatarPreview: string | ArrayBuffer | null = null;
  uploadedFiles: UploadedFile[] = [];
  isEditMode = false;
  isSubmitting = false;

  // File upload state
  isUploadingAvatar = false;
  uploadedAvatarUrl: string | null = null; // Only for newly uploaded photos
  existingPhotoUrl: string | null = null; // For existing photos from profile data
  uploadedDocumentUrls: string[] = [];
  isUploadingDocuments = false;

  // Track which fields have been modified by the user
  private modifiedFields = new Set<string>();
  private originalFormValues: any = {};

  // Confirmation modal state
  showModal: boolean = false;
  promptConfig: PromptConfig | null = null;

  // UI state management
  accordionState = {
    employeeInfo: true,
    contactInfo: true,
    familyInfo: false,
    personalInfo: false,
    spiritualHistory: false,
    areaOfService: false,
    references: false,
    legalQuestions: false,
    uploadDocuments: false,
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

  // Dynamic location data based on country selection
  availableStates: string[] = [];
  availableCities: string[] = [];

  // Multi-select options for previous church positions
  churchPositionOptions = [
    'Pastor',
    'Assistant Pastor',
    'Elder',
    'Deacon',
    'Youth Leader',
    'Music Director',
    'Sunday School Teacher',
    'Choir Member',
    'Usher',
    'Secretary',
    'Treasurer',
    'Board Member',
    'Evangelist',
    'Missionary',
    "Children's Ministry Leader",
    "Women's Ministry Leader",
    "Men's Ministry Leader",
  ];

  selectedChurchPositions: string[] = [];
  showPositionDropdown = false;

  // Nigerian states
  nigerianStates = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
    'FCT',
  ];

  // Nigerian cities by state (sample for major states)
  nigerianCities: { [key: string]: string[] } = {
    Lagos: [
      'Ikeja',
      'Victoria Island',
      'Lekki',
      'Surulere',
      'Yaba',
      'Ikoyi',
      'Ajah',
      'Magodo',
    ],
    Abuja: [
      'Garki',
      'Wuse',
      'Maitama',
      'Asokoro',
      'Gwarinpa',
      'Kubwa',
      'Nyanya',
    ],
    Kano: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni'],
    Rivers: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Eleme', 'Ikwerre'],
    Oyo: ['Ibadan North', 'Ibadan South-West', 'Egbeda', 'Akinyele', 'Ona Ara'],
    FCT: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Nyanya'],
  };

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
    this.loadDepartments();
    this.loadUserRole();
    this.profileForm = this.createForm();
    this.checkEditMode();
    this.prefillFormIfNeeded();

    // Initialize form change tracking after form is set up
    this.initializeFormChangeTracking();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employeeData'] && this.employeeData) {
      this.checkEditMode();
      this.prefillFormIfNeeded();
      // Re-initialize tracking when employee data changes
      this.initializeFormChangeTracking();
    }
  }

  private checkEditMode() {
    this.isEditMode = !!this.employeeData;
  }

  private prefillFormIfNeeded() {
    if (this.employeeData) {
      this.prefillForm(this.employeeData);
      // Load any additional spiritual/service data that might be available
      this.loadAdditionalEmployeeData();
    }
  }

  private loadAdditionalEmployeeData() {
    // This method can be extended to load additional spiritual/service data
    // if the API provides extended endpoints for complete employee profiles
    if (!this.employeeData) return;

    // Check if we have additional data in the employee response
    // that might be nested or in different properties
    this.mapExtendedEmployeeData(this.employeeData);
  }

  private mapExtendedEmployeeData(employeeData: any) {
    // Extract additional fields that may not be in the basic structure
    const safeSetValue = (fieldName: string, value: any) => {
      const control = this.profileForm.get(fieldName);
      if (control) {
        control.setValue(value || '');
      }
    };

    // Convert API boolean values to form-friendly strings
    const boolToString = (value: any): string => {
      if (value === true || value === 'true') return 'Yes';
      if (value === false || value === 'false') return 'No';
      return '';
    };

    // Handle additional mappings that might not be covered in main prefill
    const convertChildGender = (apiGender: string | null): string => {
      if (!apiGender) return '';
      const genderMap: { [key: string]: string } = {
        MALE: 'MALE',
        FEMALE: 'FEMALE',
      };
      return genderMap[apiGender.toUpperCase()] || apiGender;
    };

    // Additional field mappings can be added here as needed
    // This method provides flexibility for handling extended API responses

    // Example: Handle any special cases or computed fields
    if (employeeData.computedFields) {
      // Process computed fields if they exist
    }
  }

  private prefillForm(employeeData: EmployeeDetails) {
    // Helper function to properly format image URLs
    const formatImageUrl = (url: string | null): string => {
      if (!url) return 'assets/svg/gender.svg';

      // If it's already a complete URL, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // If it's a relative path, prepend the base URL
      const baseUrl = 'https://harmoney-backend.onrender.com';
      return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    };

    // Set avatar preview if photoUrl exists, otherwise use default fallback
    const formattedPhotoUrl = formatImageUrl(employeeData.photoUrl);
    this.avatarPreview = formattedPhotoUrl;
    this.existingPhotoUrl = employeeData.photoUrl; // Store original URL for API

    // Load existing documents if any
    if (employeeData.documents && employeeData.documents.length > 0) {
      this.uploadedDocumentUrls = employeeData.documents.map((doc) => doc.url);
      this.uploadedFiles = employeeData.documents.map((doc) => ({
        name: doc.title || 'Document',
        size: 0, // Unknown size for existing documents
        file: null as any, // No file object for existing documents
        uploadStatus: 'completed' as const,
        progress: 100,
        url: doc.url,
      }));
    }

    // Helper function to safely get email from user object
    const getEmailFromUser = () => {
      if (employeeData.user && employeeData.user.email) {
        return employeeData.user.email;
      }
      return '';
    };

    // Helper function to convert boolean to string for dropdowns
    const booleanToString = (value: any): string => {
      if (value === null || value === undefined || value === '') {
        return '';
      }

      // Handle string booleans
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === 'yes') return 'Yes';
        if (lowerValue === 'false' || lowerValue === 'no') return 'No';
        return '';
      }

      // Handle actual booleans
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }

      return '';
    };

    // Helper function to format dates
    const formatDate = (dateString: string | null): string => {
      if (!dateString) return '';
      try {
        return new Date(dateString).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    // Helper functions to convert API values to form option values
    const convertTitle = (apiTitle: string | null): string => {
      if (!apiTitle) return '';
      const titleMap: { [key: string]: string } = {
        MR: 'Mr',
        MRS: 'Mrs',
        MS: 'Ms',
        DR: 'Dr',
        PROF: 'Prof',
      };
      return titleMap[apiTitle.toUpperCase()] || apiTitle;
    };

    const convertGender = (apiGender: string | null): string => {
      if (!apiGender) return '';
      const genderMap: { [key: string]: string } = {
        MALE: 'Male',
        FEMALE: 'Female',
        OTHER: 'Other',
      };
      return genderMap[apiGender.toUpperCase()] || apiGender;
    };

    const convertMaritalStatus = (apiStatus: string | null): string => {
      if (!apiStatus) return '';
      const statusMap: { [key: string]: string } = {
        SINGLE: 'Single',
        MARRIED: 'Married',
        DIVORCED: 'Divorced',
        WIDOWED: 'Widowed',
        SEPARATED: 'Separated',
      };
      return statusMap[apiStatus.toUpperCase()] || apiStatus;
    };

    const convertPhoneType = (apiType: string | null): string => {
      if (!apiType) return '';
      const typeMap: { [key: string]: string } = {
        HOME: 'HOME',
        WORK: 'WORK',
        CELL: 'CELL',
        MOBILE: 'CELL', // In case API uses MOBILE instead of CELL
      };
      return typeMap[apiType.toUpperCase()] || apiType;
    };

    const convertEmploymentType = (apiType: string | null): string => {
      if (!apiType) return '';
      const typeMap: { [key: string]: string } = {
        STAFF: 'STAFF',
        CONTRACT: 'CONTRACT',
        VOLUNTEER: 'VOLUNTEER',
      };
      return typeMap[apiType.toUpperCase()] || apiType;
    };

    // Convert role from WORKER to worker for role checks
    const convertRole = (apiRole: string | null): string => {
      if (!apiRole) return '';
      return apiRole.toLowerCase();
    };

    // Get department ID if departments exist
    const getDepartmentId = (): string => {
      if (employeeData.departments && employeeData.departments.length > 0) {
        return employeeData.departments[0].id.toString();
      }
      return '';
    };

    // STEP 1: Pre-fill basic employee and address information
    const basicFormData = {
      // Basic employee info - Apply conversions to match form options
      title: convertTitle(employeeData.title),
      legalFirstName: employeeData.firstName || '',
      legalMiddleName: employeeData.middleName || '',
      legalLastName: employeeData.lastName || '',
      profferedName: employeeData.profferedName || '',
      gender: convertGender(employeeData.gender),
      email: getEmailFromUser(),
      altEmail: employeeData.altEmail || '',
      employmentType: convertEmploymentType(employeeData.employmentType),
      departmentId: getDepartmentId(),
      role: convertRole(employeeData.user?.role?.name || ''),

      // Personal info
      maritalStatus: convertMaritalStatus(employeeData.maritalStatus),
      everDivorced: booleanToString(employeeData.everDivorced),
      dateOfBirth: formatDate(employeeData.dob),

      // Contact info - Apply phone type conversions
      primaryPhone: employeeData.primaryPhone || '',
      primaryPhoneType: convertPhoneType(employeeData.primaryPhoneType),
      altPhone: employeeData.altPhone || '',
      altPhoneType: convertPhoneType(employeeData.altPhoneType),

      // Home Address - Handle homeAddress object structure
      homeAddress: employeeData.homeAddress?.address || '',
      homeCity: employeeData.homeAddress?.city || '',
      homeState: employeeData.homeAddress?.state || '',
      homeCountry: employeeData.homeAddress?.country || 'Nigeria',
      homeZipCode: employeeData.homeAddress?.zipCode || '',

      // Mailing Address - Handle mailingAddress object structure
      mailingAddress: employeeData.mailingAddress?.address || '',
      mailingCity: employeeData.mailingAddress?.city || '',
      mailingState: employeeData.mailingAddress?.state || '',
      mailingCountry: employeeData.mailingAddress?.country || 'Nigeria',
      mailingZipCode: employeeData.mailingAddress?.zipCode || '',

      // Legal questions - Handle actual boolean values
      beenConvicted: booleanToString(employeeData.beenConvicted),
      hasQuestionableBackground: booleanToString(
        employeeData.hasQuestionableBackground
      ),
      hasBeenInvestigatedForMisconductOrAbuse: booleanToString(
        employeeData.hasBeenInvestigatedForMisconductOrAbuse
      ),
    };

    // Patch the form with basic data
    this.profileForm.patchValue(basicFormData);

    // STEP 2: Handle spiritual history if exists - Map all available spiritual fields
    if (employeeData.spiritualHistory) {
      const spiritual = employeeData.spiritualHistory as any; // Cast to any since interface doesn't match API response

      const spiritualFormData = {
        // Core spiritual fields
        yearSaved: spiritual.yearSaved || '',
        sanctified: booleanToString(spiritual.sanctified),
        baptizedWithHolySpirit: booleanToString(spiritual.baptizedWithWater), // Map API field to form field
        yearOfWaterBaptism: spiritual.yearOfWaterBaptism || '',
        firstYearInApostolicChurch: spiritual.firstYearInChurch || '',
        isFaithfulInTithing: booleanToString(spiritual.isFaithfulInTithing),

        // Sermon and pastoral info
        dateOfFirstSermon: formatDate(spiritual.dateOfFirstSermon),
        firstSermonPastorArea: spiritual.firstSermonPastor || '',
        currentChurchPastorArea: spiritual.currentPastor || '',

        // First sermon location details
        firstSermonLocation: spiritual.locationOfFirstSermon?.address || '',
        firstSermonCityArea: spiritual.locationOfFirstSermon?.city || '',
        firstSermonStateArea: spiritual.locationOfFirstSermon?.state || '',
        firstSermonCountryArea: spiritual.locationOfFirstSermon?.country || '',
        firstSermonZipCodeArea: spiritual.locationOfFirstSermon?.zipCode || '',

        // Current church location details
        currentChurchLocationArea:
          spiritual.currentChurchLocation?.address || '',
        currentChurchCityArea: spiritual.currentChurchLocation?.city || '',
        currentChurchStateArea: spiritual.currentChurchLocation?.state || '',
        currentChurchCountryArea:
          spiritual.currentChurchLocation?.country || '',
        currentChurchZipCodeArea:
          spiritual.currentChurchLocation?.zipCode || '',
      };

      // Patch spiritual data
      this.profileForm.patchValue(spiritualFormData);
    }

    // STEP 3: Handle spouse info if exists - Updated for API structure
    if (employeeData.spouse) {
      const spouseFormData = {
        spouseFirstName: employeeData.spouse.firstName || '',
        spouseMiddleName: employeeData.spouse.middleName || '',
        spouseDob: formatDate(employeeData.spouse.dob),
        weddingDate: formatDate((employeeData.spouse as any).weddingDate), // weddingDate from API
      };

      this.profileForm.patchValue(spouseFormData);
    }

    // STEP 4: Handle children array if exists - Updated for API structure (name field)
    if (employeeData.children && employeeData.children.length > 0) {
      const childrenArray = this.profileForm.get('children') as FormArray;
      childrenArray.clear();

      employeeData.children.forEach((child: any) => {
        // Helper to convert child gender from API format to form format
        const convertChildGender = (apiGender: string | null): string => {
          if (!apiGender) return '';
          const genderMap: { [key: string]: string } = {
            MALE: 'MALE',
            FEMALE: 'FEMALE',
          };
          return genderMap[apiGender.toUpperCase()] || apiGender;
        };

        const childGroup = this.fb.group({
          childName: [
            child.name || child.firstName || '',
            [Validators.required],
          ], // API uses 'name' field
          childDob: [formatDate(child.dob), [Validators.required]],
          childGender: [
            convertChildGender(child.gender),
            [Validators.required],
          ],
        });
        childrenArray.push(childGroup);
      });
    }

    // STEP 5: Handle previous positions if exists - Updated for API structure
    if (
      employeeData.previousPositions &&
      employeeData.previousPositions.length > 0
    ) {
      const positionsArray = this.profileForm.get(
        'previousPositions'
      ) as FormArray;
      positionsArray.clear();

      employeeData.previousPositions.forEach((position: any) => {
        const positionGroup = this.fb.group({
          previousPositionTitle: [position.title || ''], // API has title field
          previousPosition: [position.title || ''], // Use title for both fields since API doesn't have department
          previousPositionDate: [''], // API doesn't provide dates in this structure
        });
        positionsArray.push(positionGroup);
      });
    }

    // STEP 6: Handle credentials if exists - Updated for API structure
    if (employeeData.credentials && employeeData.credentials.length > 0) {
      const credential = employeeData.credentials[0]; // Use first credential
      const credentialFormData = {
        credentialName: (credential as any).name || credential.degree || '',
        credentialNumber:
          (credential as any).number || credential.institution || '',
        credentialIssuedDate:
          formatDate((credential as any).issuedDate) ||
          (credential.graduationYear
            ? `${credential.graduationYear}-01-01`
            : ''),
        credentialExpirationDate:
          formatDate((credential as any).expirationDate) || '',
      };

      this.profileForm.patchValue(credentialFormData);
    }

    // STEP 7: Final form validation and debugging
    // Debug which fields are populated vs missing
    this.debugFieldMapping();

    // Force form to recognize the new values
    this.profileForm.updateValueAndValidity();
  }

  // Debug method to identify field mapping issues
  private debugFieldMapping() {
    const formValue = this.profileForm.getRawValue();

    // List of all expected fields for debugging
    const expectedFields = [
      'legalFirstName',
      'legalLastName',
      'legalMiddleName',
      'profferedName',
      'email',
      'altEmail',
      'title',
      'gender',
      'employmentType',
      'departmentId',
      'primaryPhone',
      'primaryPhoneType',
      'altPhone',
      'altPhoneType',
      'dateOfBirth',
      'maritalStatus',
      'everDivorced',
      'homeAddress',
      'homeCity',
      'homeState',
      'homeCountry',
      'homeZipCode',
      'mailingAddress',
      'mailingCity',
      'mailingState',
      'mailingCountry',
      'mailingZipCode',
      'spouseFirstName',
      'spouseMiddleName',
      'spouseDob',
      'weddingDate',
      'yearSaved',
      'sanctified',
      'baptizedWithHolySpirit',
      'yearOfWaterBaptism',
      'firstYearInApostolicChurch',
      'isFaithfulInTithing',
    ];

    // Separate populated vs empty fields
    const populatedFields: string[] = [];
    const emptyFields: string[] = [];

    expectedFields.forEach((field) => {
      const value = formValue[field];
      if (value !== null && value !== undefined && value !== '') {
        populatedFields.push(field);
      } else {
        emptyFields.push(field);
      }
    });

    // Check boolean field values specifically
    const booleanFields = [
      'everDivorced',
      'sanctified',
      'baptizedWithHolySpirit',
      'isFaithfulInTithing',
      'beenConvicted',
      'hasQuestionableBackground',
      'hasBeenInvestigatedForMisconductOrAbuse',
    ];
    const booleanValues: { [key: string]: any } = {};
    booleanFields.forEach((field) => {
      booleanValues[field] = formValue[field];
    });

    // Check address fields specifically
    const addressFields = {
      home: [
        'homeAddress',
        'homeCity',
        'homeState',
        'homeCountry',
        'homeZipCode',
      ],
      mailing: [
        'mailingAddress',
        'mailingCity',
        'mailingState',
        'mailingCountry',
        'mailingZipCode',
      ],
    };

    const addressValues: { [key: string]: any } = {};
    Object.keys(addressFields).forEach((addressType) => {
      addressValues[addressType] = {};
      addressFields[addressType as keyof typeof addressFields].forEach(
        (field) => {
          addressValues[addressType][field] = formValue[field];
        }
      );
    });
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
    // Define validators conditionally based on edit mode
    const getValidators = (validators: any[]): any[] => {
      // In edit mode, remove most validators to allow partial updates
      if (this.isEditMode) {
        return []; // No validators in edit mode
      }
      return validators; // Full validators in create mode
    };

    const getRequiredValidators = (validators: any[]): any[] => {
      // In edit mode, keep only basic format validators (no required)
      if (this.isEditMode) {
        return validators.filter(
          (validator) =>
            validator !== Validators.required &&
            !validator.toString().includes('required')
        );
      }
      return validators; // Full validators in create mode
    };

    return this.fb.group({
      // Employee Basic Info - Required for ALL roles in create mode only
      title: ['', getValidators([Validators.required])],
      legalFirstName: [
        '',
        getValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ]),
      ],
      legalMiddleName: [
        '',
        getRequiredValidators([
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ]),
      ],
      legalLastName: [
        '',
        getValidators([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ]),
      ],
      profferedName: [
        '',
        getRequiredValidators([
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s]*$/),
        ]),
      ],
      gender: ['', getValidators([Validators.required])],
      email: [
        '',
        getRequiredValidators([
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ]),
      ],
      altEmail: [
        '',
        getRequiredValidators([
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ]),
      ],
      departmentId: [''],
      role: [''],
      employmentType: [''],
      location: [''],

      // Contact Information - Required for ALL roles in create mode only
      homeAddress: [
        '',
        getValidators([
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ]),
      ],
      homeCity: ['', getValidators([Validators.required])],
      homeState: ['', getValidators([Validators.required])],
      homeCountry: ['Nigeria', getValidators([Validators.required])],
      homeZipCode: [
        '',
        getRequiredValidators([
          Validators.required,
          Validators.pattern(/^\d{6}$/),
        ]),
      ],
      mailingAddress: ['', getRequiredValidators([Validators.maxLength(200)])],
      mailingCity: [''],
      mailingState: [''],
      mailingCountry: ['Nigeria'],
      mailingZipCode: [
        '',
        getRequiredValidators([Validators.pattern(/^\d{6}$/)]),
      ],
      primaryPhone: [
        '',
        getRequiredValidators([
          Validators.required,
          Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/),
        ]),
      ],
      primaryPhoneType: ['', getValidators([Validators.required])],
      altPhone: [
        '',
        getRequiredValidators([Validators.pattern(/^[\+]?[0-9][\d]{0,15}$/)]),
      ],
      altPhoneType: [''],

      // Personal Information - Required for ALL roles in create mode only
      maritalStatus: ['', getValidators([Validators.required])],
      everDivorced: ['', getValidators([Validators.required])],
      dateOfBirth: ['', getValidators([Validators.required])],

      // Legal Questions - Required for ALL roles in create mode only
      beenConvicted: ['', getValidators([Validators.required])],
      hasQuestionableBackground: ['', getValidators([Validators.required])],
      hasBeenInvestigatedForMisconductOrAbuse: [
        '',
        getValidators([Validators.required]),
      ],

      // Spiritual History - Required for ALL roles in create mode only
      yearSaved: ['', getValidators([Validators.required])],
      sanctified: ['', getValidators([Validators.required])],
      baptizedWithHolySpirit: ['', getValidators([Validators.required])],
      yearOfWaterBaptism: ['', getValidators([Validators.required])],
      firstYearInApostolicChurch: ['', getValidators([Validators.required])],
      isFaithfulInTithing: ['', getValidators([Validators.required])],

      // Worker-specific fields - Will be conditionally required in create mode only
      nationIdNumber: [''], // Required only for worker role in create mode
      areaOfService: [''], // Required only for worker role in create mode
      everServedInApostolicChurch: [''], // Required only for worker role in create mode
      serviceDate: [''], // Required only for worker role in create mode
      serviceLocation: [''], // Required only for worker role in create mode
      serviceCity: [''], // Required only for worker role in create mode
      serviceState: [''], // Required only for worker role in create mode
      serviceCountry: [''], // Required only for worker role in create mode
      servicePastor: [''], // Required only for worker role in create mode
      ordained: [''], // Required only for worker role in create mode
      ordainedDate: [''],

      // Spouse Information - Optional
      spouseFirstName: [''],
      spouseMiddleName: [''],
      spouseDob: [''],
      weddingDate: [''],
      spouseMaidenName: [''],

      // Children (FormArray) - Optional
      children: this.fb.array([]),

      // Previous Positions (FormArray) - Required only for worker role in create mode
      previousPositions: this.fb.array([
        this.fb.group({
          previousPositionTitle: [''],
          previousPosition: [''],
          previousPositionDate: [''],
        }),
      ]),

      // References (FormArray) - Required only for worker role in create mode
      references: this.fb.array([
        this.fb.group({
          referenceName: [''],
          referencePhone: [''],
          referenceEmail: [''],
          referenceAddress: [''],
          referenceCity: [''],
          referenceState: [''],
          referenceCountry: [''],
          referenceZipCode: [''],
          relationshipToReference: [''],
        }),
      ]),

      // Credentials - Optional
      credentialName: [''],
      credentialNumber: [''],
      credentialIssuedDate: [''],
      credentialExpirationDate: [''],

      // Area Of Service fields (for non-worker roles) - Optional
      previousChurchPositions: [[]],
      dateOfFirstSermon: [''],
      firstSermonLocation: [''],
      firstSermonCityArea: [''],
      firstSermonStateArea: [''],
      firstSermonCountryArea: [''],
      firstSermonZipCodeArea: [''],
      firstSermonPastorArea: [''],
      currentStatusArea: [''],
      recentCredentialsNameArea: [''],
      credentialNumberArea: [''],
      credentialDateIssuedArea: [''],
      credentialExpirationDateArea: [''],
      currentChurchLocationArea: [''],
      currentChurchCityArea: [''],
      currentChurchStateArea: [''],
      currentChurchCountryArea: [''],
      currentChurchZipCodeArea: [''],
      currentChurchPastorArea: [''],

      // Additional fields
      other: [''],
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Set preview immediately
      const reader = new FileReader();
      reader.onload = (e) => (this.avatarPreview = reader.result);
      reader.readAsDataURL(file);

      // Upload file immediately
      this.isUploadingAvatar = true;
      this.fileUploadService.uploadSingleFileWithProgress(file).subscribe({
        next: (event) => {
          if (event.response) {
            // Upload completed - store the URL
            this.uploadedAvatarUrl = event.response.file;
            this.isUploadingAvatar = false;

            // Only track photo as modified if user actually uploaded a new image
            this.modifiedFields.add('photoUrl');

            this.alertService.success('Profile image uploaded successfully!');
          }
        },
        error: (error) => {
          this.isUploadingAvatar = false;
          console.error('Avatar upload failed:', error);
          this.alertService.error(
            'Failed to upload profile image. Please try again.'
          );
          // Reset preview on error
          this.avatarPreview = null;
          this.uploadedAvatarUrl = null;
        },
      });
    }
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    // In edit mode, skip form validation since we allow partial updates
    if (this.isEditMode || this.profileForm.valid) {
      if (this.isEditMode) {
        // Show confirmation modal for updates
        this.showConfirmModal();
      } else {
        // Direct submission for create mode
        this.isSubmitting = true;
        this.createProfile();
      }
    } else {
      this.markAllFieldsAsTouched();
      this.scrollToFirstError();
    }
  }

  private showConfirmModal() {
    // Set up the confirmation modal configuration
    const modifiedFieldsCount = this.modifiedFields.size;
    const hasUploadedFiles =
      this.uploadedAvatarUrl || this.uploadedDocumentUrls.length > 0;

    let confirmText = 'Are you sure you want to update your profile?';
    if (modifiedFieldsCount > 0) {
      confirmText += ` You have ${modifiedFieldsCount} field(s) that will be updated.`;
    }
    if (hasUploadedFiles) {
      confirmText += ' Your uploaded files will also be saved.';
    }

    this.promptConfig = {
      title: 'Update Profile',
      text: confirmText,
      imageUrl: undefined, // Will use default question gif
      yesButtonText: 'Update',
      noButtonText: 'Cancel',
    };

    // Show the modal
    this.showModal = true;
  }

  onModalConfirm(confirmed: boolean) {
    this.showModal = false;

    if (confirmed) {
      this.isSubmitting = true;
      this.updateProfile();
    }
  }

  onModalClose() {
    this.showModal = false;
  }

  private updateProfile() {
    if (!this.employeeData) {
      this.isSubmitting = false;
      return;
    }

    const updateData: UpdateEmployeeRequest = this.mapFormToUpdateRequest();

    // Check if there are any changes to update
    if (Object.keys(updateData).length === 0) {
      this.isSubmitting = false;
      this.alertService.info(
        'No changes detected. Please modify some fields before updating.'
      );
      return;
    }

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
        // Check for HTTP 200 status code to determine success
        if (response) {
          // Update the user profile data in auth service and localStorage
          if (this.uploadedAvatarUrl || this.modifiedFields.size > 0) {
            // Extract the updated data from the form for localStorage update
            const formValue = this.profileForm.getRawValue();
            const updatedProfileData: Partial<UpdateEmployeeRequest> = {};

            // Include photo if updated
            if (this.uploadedAvatarUrl) {
              updatedProfileData.photoUrl = this.uploadedAvatarUrl;
            }

            // Include modified form fields
            if (this.modifiedFields.has('legalFirstName')) {
              updatedProfileData.firstName = formValue.legalFirstName;
            }
            if (this.modifiedFields.has('legalLastName')) {
              updatedProfileData.lastName = formValue.legalLastName;
            }
            if (this.modifiedFields.has('profferedName')) {
              updatedProfileData.profferedName = formValue.profferedName;
            }
            if (this.modifiedFields.has('email')) {
              updatedProfileData.email = formValue.email;
            }

            // Update auth service with the changes
            this.authService.updateUserProfile(updatedProfileData);
          }

          // Reset modified fields tracking for future edits
          this.modifiedFields.clear();

          // Show success message
          this.alertService.success('Profile updated successfully!');

          // Navigate to profile view component
          this.router.navigate(['/profile-view']);
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
    // If no fields are modified, return empty object
    if (this.modifiedFields.size === 0 && !this.uploadedAvatarUrl) {
      return {} as UpdateEmployeeRequest;
    }

    // Build payload with only modified fields
    return this.buildSelectivePayload();
  }

  private buildSelectivePayload(): UpdateEmployeeRequest {
    const formValue = this.profileForm.getRawValue();
    const payload: Partial<UpdateEmployeeRequest> = {};

    // Helper functions
    const toBooleanOrUndefined = (value: any): boolean | undefined => {
      if (value === 'Yes' || value === 'true' || value === true) return true;
      if (value === 'No' || value === 'false' || value === false) return false;
      if (value === '') return undefined;
      return undefined;
    };

    const cleanValue = (value: any): any => {
      return value === '' ? undefined : value;
    };

    const capitalizeTitle = (title: string): string => {
      if (!title) return '';
      const titleMap: { [key: string]: string } = {
        Mr: 'MR',
        Mrs: 'MRS',
        Ms: 'MS',
        Dr: 'DR',
        Prof: 'PROF',
      };
      return titleMap[title] || title.toUpperCase();
    };

    const capitalizeGender = (gender: string): string => {
      return gender ? gender.toUpperCase() : '';
    };

    const capitalizeMaritalStatus = (status: string): string => {
      return status ? status.toUpperCase() : '';
    };

    const capitalizePhoneType = (type: string): string => {
      return type ? type.toUpperCase() : '';
    };

    const capitalizeRole = (role: string): string => {
      return role ? role.toUpperCase() : '';
    };

    // Map only modified fields
    const fieldMapping: { [key: string]: () => void } = {
      // Basic Employee Info
      employeeId: () => (payload.employeeId = cleanValue(formValue.employeeId)),
      legalFirstName: () =>
        (payload.firstName = cleanValue(formValue.legalFirstName)),
      legalLastName: () =>
        (payload.lastName = cleanValue(formValue.legalLastName)),
      legalMiddleName: () =>
        (payload.middleName = cleanValue(formValue.legalMiddleName)),
      title: () => (payload.title = capitalizeTitle(formValue.title)),
      gender: () => (payload.gender = capitalizeGender(formValue.gender)),
      profferedName: () =>
        (payload.profferedName = cleanValue(formValue.profferedName)),
      email: () => (payload.email = cleanValue(formValue.email)),
      altEmail: () => (payload.altEmail = cleanValue(formValue.altEmail)),
      departmentId: () =>
        (payload.departmentId = cleanValue(formValue.departmentId)),
      role: () => (payload.role = capitalizeRole(formValue.role)),
      employmentType: () =>
        (payload.employmentType = cleanValue(formValue.employmentType)),
      location: () => (payload.location = cleanValue(formValue.location)),

      // Contact Info
      primaryPhone: () =>
        (payload.primaryPhone = cleanValue(formValue.primaryPhone)),
      primaryPhoneType: () =>
        (payload.primaryPhoneType = capitalizePhoneType(
          formValue.primaryPhoneType
        )),
      altPhone: () =>
        (payload.altPhone =
          cleanValue(formValue.altPhone) || cleanValue(formValue.primaryPhone)),
      altPhoneType: () =>
        (payload.altPhoneType =
          capitalizePhoneType(formValue.altPhoneType) ||
          capitalizePhoneType(formValue.primaryPhoneType)),

      // Personal Info
      dateOfBirth: () => (payload.dob = cleanValue(formValue.dateOfBirth)),
      maritalStatus: () =>
        (payload.maritalStatus = capitalizeMaritalStatus(
          formValue.maritalStatus
        )),
      everDivorced: () =>
        (payload.everDivorced = toBooleanOrUndefined(formValue.everDivorced)),

      // Legal Questions
      beenConvicted: () =>
        (payload.beenConvicted = toBooleanOrUndefined(formValue.beenConvicted)),
      hasQuestionableBackground: () =>
        (payload.hasQuestionableBackground = toBooleanOrUndefined(
          formValue.hasQuestionableBackground
        )),
      hasBeenInvestigatedForMisconductOrAbuse: () =>
        (payload.hasBeenInvestigatedForMisconductOrAbuse = toBooleanOrUndefined(
          formValue.hasBeenInvestigatedForMisconductOrAbuse
        )),

      // Address Info
      homeAddress: () =>
        (payload.homeAddress = cleanValue(formValue.homeAddress)),
      homeCity: () => (payload.homeCity = cleanValue(formValue.homeCity)),
      homeState: () => (payload.homeState = cleanValue(formValue.homeState)),
      homeCountry: () =>
        (payload.homeCountry = cleanValue(formValue.homeCountry)),
      homeZipCode: () =>
        (payload.homeZipCode = cleanValue(formValue.homeZipCode)),
      mailingAddress: () =>
        (payload.mailingAddress = cleanValue(formValue.mailingAddress)),
      mailingCity: () =>
        (payload.mailingCity = cleanValue(formValue.mailingCity)),
      mailingState: () =>
        (payload.mailingState = cleanValue(formValue.mailingState)),
      mailingCountry: () =>
        (payload.mailingCountry = cleanValue(formValue.mailingCountry)),
      mailingZipCode: () =>
        (payload.mailingZipCode = cleanValue(formValue.mailingZipCode)),

      // Spouse Info
      spouseFirstName: () =>
        (payload.spouseFirstName = cleanValue(formValue.spouseFirstName)),
      spouseMiddleName: () =>
        (payload.spouseMiddleName = cleanValue(formValue.spouseMiddleName)),
      spouseDob: () => (payload.spouseDob = cleanValue(formValue.spouseDob)),
      weddingDate: () =>
        (payload.weddingDate = cleanValue(formValue.weddingDate)),

      // Spiritual History
      yearSaved: () => (payload.yearSaved = cleanValue(formValue.yearSaved)),
      sanctified: () =>
        (payload.sanctified = toBooleanOrUndefined(formValue.sanctified)),
      baptizedWithHolySpirit: () =>
        (payload.baptizedWithWater = toBooleanOrUndefined(
          formValue.baptizedWithHolySpirit
        )),
      yearOfWaterBaptism: () =>
        (payload.yearOfWaterBaptism = cleanValue(formValue.yearOfWaterBaptism)),
      firstYearInApostolicChurch: () =>
        (payload.firstYearInChurch = cleanValue(
          formValue.firstYearInApostolicChurch
        )),
      isFaithfulInTithing: () =>
        (payload.isFaithfulInTithing = toBooleanOrUndefined(
          formValue.isFaithfulInTithing
        )),
      firstSermonPastorArea: () =>
        (payload.firstSermonPastor = cleanValue(
          formValue.firstSermonPastorArea
        )),
      currentChurchPastorArea: () =>
        (payload.currentPastor = cleanValue(formValue.currentChurchPastorArea)),
      dateOfFirstSermon: () =>
        (payload.dateOfFirstSermon = cleanValue(formValue.dateOfFirstSermon)),

      // First Sermon Address
      firstSermonLocation: () =>
        (payload.firstSermonAddress = cleanValue(
          formValue.firstSermonLocation
        )),
      firstSermonCityArea: () =>
        (payload.firstSermonCity = cleanValue(formValue.firstSermonCityArea)),
      firstSermonStateArea: () =>
        (payload.firstSermonState = cleanValue(formValue.firstSermonStateArea)),
      firstSermonCountryArea: () =>
        (payload.firstSermonCountry = cleanValue(
          formValue.firstSermonCountryArea
        )),
      firstSermonZipCodeArea: () =>
        (payload.firstSermonZipCode = cleanValue(
          formValue.firstSermonZipCodeArea
        )),

      // Current Church Address
      currentChurchLocationArea: () =>
        (payload.currentChurchAddress = cleanValue(
          formValue.currentChurchLocationArea
        )),
      currentChurchCityArea: () =>
        (payload.currentChurchCity = cleanValue(
          formValue.currentChurchCityArea
        )),
      currentChurchStateArea: () =>
        (payload.currentChurchState = cleanValue(
          formValue.currentChurchStateArea
        )),
      currentChurchCountryArea: () =>
        (payload.currentChurchCountry = cleanValue(
          formValue.currentChurchCountryArea
        )),
      currentChurchZipCodeArea: () =>
        (payload.currentChurchZipCode = cleanValue(
          formValue.currentChurchZipCodeArea
        )),

      // Credentials
      credentialName: () =>
        (payload.credentialName = cleanValue(formValue.credentialName)),
      credentialNumber: () =>
        (payload.credentialNumber = cleanValue(formValue.credentialNumber)),
      credentialIssuedDate: () =>
        (payload.credentialIssuedDate = cleanValue(
          formValue.credentialIssuedDate
        )),
      credentialExpirationDate: () =>
        (payload.credentialExpirationDate = cleanValue(
          formValue.credentialExpirationDate
        )),

      // Photo URL - only if actually uploaded in this session
      photoUrl: () => {
        if (this.uploadedAvatarUrl) {
          payload.photoUrl = this.uploadedAvatarUrl;
        }
      },

      // Document URLs - only if actually uploaded in this session
      documentUrls: () => {
        if (this.uploadedDocumentUrls.length > 0) {
          payload.documentUrls = this.uploadedDocumentUrls;
        }
      },

      // Form Arrays
      children: () => {
        if (formValue.children) {
          payload.children = formValue.children.map((child: any) => ({
            childName: cleanValue(child.childName),
            childDob: cleanValue(child.childDob),
            childGender: capitalizeGender(child.childGender),
          }));
        }
      },
      previousPositions: () => {
        if (formValue.previousPositions) {
          payload.previousChurchPositions = formValue.previousPositions
            .map((pos: any) => cleanValue(pos.previousPosition))
            .filter((position: string) => position);
        }
      },
    };

    // Apply only modified fields
    this.modifiedFields.forEach((fieldName) => {
      if (fieldMapping[fieldName]) {
        fieldMapping[fieldName]();
      }
    });

    // Remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof UpdateEmployeeRequest] === undefined) {
        delete payload[key as keyof UpdateEmployeeRequest];
      }
    });

    return payload as UpdateEmployeeRequest;
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
    // Check basic form validity first
    if (!this.profileForm.valid) {
      // For role-specific validation, we need to check which fields are actually required
      return this.isRoleSpecificFormValid();
    }
    return true;
  }

  private isRoleSpecificFormValid(): boolean {
    const formValue = this.profileForm.value;
    const errors: string[] = [];

    // Core required fields for ALL roles
    const coreRequiredFields = [
      'title',
      'legalFirstName',
      'legalMiddleName',
      'legalLastName',
      'profferedName',
      'gender',
      'email',
      'maritalStatus',
      'everDivorced',
      'dateOfBirth',
      'homeAddress',
      'homeCity',
      'homeState',
      'homeCountry',
      'homeZipCode',
      'primaryPhone',
      'primaryPhoneType',
      'beenConvicted',
      'hasQuestionableBackground',
      'hasBeenInvestigatedForMisconductOrAbuse',
      'yearSaved',
      'sanctified',
      'baptizedWithHolySpirit',
      'yearOfWaterBaptism',
      'firstYearInApostolicChurch',
      'isFaithfulInTithing',
    ];

    // Check core required fields
    for (const field of coreRequiredFields) {
      const control = this.profileForm.get(field);
      if (!control || control.invalid) {
        errors.push(field);
      }
    }

    // Role-specific validation for worker role
    if (this.currentUserRole?.toLowerCase() === 'worker') {
      // Worker-specific fields that are available in the form but may not be in API
      const workerRequiredFields = [
        'nationIdNumber',
        'areaOfService',
        'everServedInApostolicChurch',
        'serviceDate',
        'serviceLocation',
        'serviceCity',
        'serviceState',
        'serviceCountry',
        'servicePastor',
        'ordained',
      ];

      for (const field of workerRequiredFields) {
        const control = this.profileForm.get(field);
        // Only validate if the control exists (some fields may not be in API)
        if (control && control.invalid) {
          errors.push(field);
        }
      }

      // Check if at least one previous position is filled
      const previousPositions = this.profileForm.get(
        'previousPositions'
      ) as FormArray;
      if (
        previousPositions.length === 0 ||
        !this.isAtLeastOnePositionValid(previousPositions)
      ) {
        errors.push('previousPositions');
      }

      // Check if at least one reference is filled
      const references = this.profileForm.get('references') as FormArray;
      if (
        references.length === 0 ||
        !this.isAtLeastOneReferenceValid(references)
      ) {
        errors.push('references');
      }
    }

    return errors.length === 0;
  }

  private isAtLeastOnePositionValid(positions: FormArray): boolean {
    return positions.controls.some((control) => {
      const group = control as FormGroup;
      return (
        group.get('previousPositionTitle')?.value?.trim() &&
        group.get('previousPosition')?.value?.trim() &&
        group.get('previousPositionDate')?.value?.trim()
      );
    });
  }

  private isAtLeastOneReferenceValid(references: FormArray): boolean {
    return references.controls.some((control) => {
      const group = control as FormGroup;
      return (
        group.get('referenceName')?.value?.trim() &&
        group.get('referencePhone')?.value?.trim() &&
        group.get('referenceEmail')?.value?.trim()
      );
    });
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
    // Get the file being removed
    const fileToRemove = this.uploadedFiles[index];

    // Remove from uploaded files array
    this.uploadedFiles.splice(index, 1);

    // Remove the URL from uploadedDocumentUrls if it exists
    if (fileToRemove.url) {
      const urlIndex = this.uploadedDocumentUrls.findIndex(
        (url) => url === fileToRemove.url
      );
      if (urlIndex > -1) {
        this.uploadedDocumentUrls.splice(urlIndex, 1);
      }
    }

    // Track document removal as modification for selective payload
    this.modifiedFields.add('documentUrls');
  }

  getFileType(fileName: string): string {
    return this.fileUploadService.getFileType(fileName);
  }

  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }

  // Document upload methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.handleFileUpload(files);
    }
  }

  onDocumentSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.handleFileUpload(files);
    }
    // Clear the input
    input.value = '';
  }

  private handleFileUpload(files: File[]) {
    // Process and validate files
    const newFiles = this.fileUploadService.processFiles(
      files,
      this.uploadedFiles
    );

    if (newFiles.length === 0) {
      this.alertService.warning(
        'No valid files to upload. Please check file types and sizes.'
      );
      return;
    }

    // Add files to the list
    this.uploadedFiles = [...this.uploadedFiles, ...newFiles];

    // Upload files using the multiple upload endpoint
    this.isUploadingDocuments = true;
    const filesToUpload = newFiles.map((f) => f.file);

    this.fileUploadService.uploadMultipleFiles(filesToUpload).subscribe({
      next: (response) => {
        this.isUploadingDocuments = false;
        if (response.status === 'success' && response.files) {
          // Store the uploaded URLs
          this.uploadedDocumentUrls = [
            ...this.uploadedDocumentUrls,
            ...response.files,
          ];

          // Track documents as modified for selective payload
          this.modifiedFields.add('documentUrls');

          // Update the uploaded files with their URLs
          response.files.forEach((url, index) => {
            if (newFiles[index]) {
              newFiles[index].url = url;
              newFiles[index].uploadStatus = 'completed';
            }
          });

          this.alertService.success(
            `Successfully uploaded ${response.files.length} document(s)!`
          );
        } else {
          this.alertService.error(
            'Failed to upload documents. Please try again.'
          );
        }
      },
      error: (error) => {
        this.isUploadingDocuments = false;
        console.error('Document upload failed:', error);
        this.alertService.error(
          'Failed to upload documents. Please try again.'
        );

        // Remove the failed files from the list
        newFiles.forEach((file) => {
          const index = this.uploadedFiles.findIndex(
            (f) => f.name === file.name && f.size === file.size
          );
          if (index > -1) {
            this.uploadedFiles.splice(index, 1);
          }
        });
      },
    });
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

  // References methods (for worker role only)
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
      referenceCity: ['', [Validators.required]],
      referenceState: ['', [Validators.required]],
      referenceCountry: ['', [Validators.required]],
      referenceZipCode: ['', [Validators.required]],
      relationshipToReference: ['', [Validators.required]],
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

  // Handle country selection to populate states
  onCountryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCountry = target.value;

    if (selectedCountry === 'Nigeria') {
      this.availableStates = this.nigerianStates;
    } else {
      // For other countries, you can add their states/provinces
      this.availableStates = [];
    }

    // Clear city and state when country changes
    this.availableCities = [];
    this.profileForm.patchValue({
      homeState: '',
      homeCity: '',
    });
  }

  // Handle state selection to populate cities
  onStateChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedState = target.value;

    if (selectedState && this.nigerianCities[selectedState]) {
      this.availableCities = this.nigerianCities[selectedState];
    } else {
      this.availableCities = [];
    }

    // Clear city when state changes
    this.profileForm.patchValue({
      homeCity: '',
    });
  }

  // Handle city selection (currently just for validation)
  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedCity = target.value;
    // You can add any city-specific logic here if needed
  }

  // Multi-select church positions methods
  togglePositionDropdown() {
    this.showPositionDropdown = !this.showPositionDropdown;
  }

  selectChurchPosition(position: string) {
    if (!this.selectedChurchPositions.includes(position)) {
      this.selectedChurchPositions.push(position);
      this.profileForm.patchValue({
        previousChurchPositions: this.selectedChurchPositions,
      });
    }
    this.showPositionDropdown = false;
  }

  removeChurchPosition(position: string) {
    this.selectedChurchPositions = this.selectedChurchPositions.filter(
      (p) => p !== position
    );
    this.profileForm.patchValue({
      previousChurchPositions: this.selectedChurchPositions,
    });
  }

  getAvailablePositions(): string[] {
    return this.churchPositionOptions.filter(
      (position) => !this.selectedChurchPositions.includes(position)
    );
  }

  private initializeFormChangeTracking() {
    if (!this.isEditMode) return; // Only track changes in edit mode

    // Store original values after form is prefilled
    setTimeout(() => {
      this.originalFormValues = this.profileForm.getRawValue();
      this.modifiedFields.clear();

      // Reset uploaded avatar URL since we're starting fresh tracking
      this.uploadedAvatarUrl = null;

      // Subscribe to form changes to track modified fields
      this.profileForm.valueChanges.subscribe((currentValue) => {
        this.trackModifiedFields(currentValue);
      });
    }, 100);
  }

  private trackModifiedFields(currentValue: any) {
    // Compare current values with original values
    Object.keys(currentValue).forEach((key) => {
      const isModified = this.isFieldModified(
        key,
        currentValue[key],
        this.originalFormValues[key]
      );

      if (isModified) {
        this.modifiedFields.add(key);
      } else {
        this.modifiedFields.delete(key);
      }
    });

    // Handle form arrays separately
    this.trackFormArrayChanges(currentValue);
  }

  private isFieldModified(
    fieldName: string,
    currentValue: any,
    originalValue: any
  ): boolean {
    // Handle arrays (like children, previousPositions)
    if (Array.isArray(currentValue) && Array.isArray(originalValue)) {
      return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
    }

    // Handle regular fields
    return currentValue !== originalValue;
  }

  private trackFormArrayChanges(currentValue: any) {
    // Track changes in form arrays
    const formArrayFields = ['children', 'previousPositions', 'references'];

    formArrayFields.forEach((arrayField) => {
      if (currentValue[arrayField]) {
        const currentArray = currentValue[arrayField];
        const originalArray = this.originalFormValues[arrayField] || [];

        if (JSON.stringify(currentArray) !== JSON.stringify(originalArray)) {
          this.modifiedFields.add(arrayField);
        } else {
          this.modifiedFields.delete(arrayField);
        }
      }
    });
  }
}
