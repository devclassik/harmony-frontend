import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  // Field display names mapping
  private fieldNames: { [key: string]: string } = {
    title: 'Title',
    legalFirstName: 'Legal First Name',
    legalMiddleName: 'Legal Middle Name',
    legalLastName: 'Legal Last Name',
    profferedName: 'Proffered Name',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    everDivorced: 'Ever Divorced',
    dateOfBirth: 'Date of Birth',
    nationalIdNumber: 'National Identification Number',
    yearSaved: 'Year Saved',
    sanctified: 'Sanctified',
    baptizedWithHolySpirit: 'Baptized With Holy Spirit',
    yearWaterBaptized: 'Year Water Baptized',
    firstYearInApostolicChurch: 'First Year In Apostolic Church',
    areFaithfulInTithing: 'Are You Faithful In Tithing',
    areaOfService: 'Area Of Service',
    everServedInApostolicChurch: 'Ever Served In An Apostolic Church',
    serviceDate: 'Service Date',
    serviceLocation: 'Service Location',
    serviceCityTown: 'Service City/Town',
    serviceStateProvince: 'Service State/Province',
    serviceCountry: 'Service Country',
    pastor: 'Pastor',
    previousPosition: 'Previous Position',
    previousPositionTitle: 'Previous Position Title',
    previousPositionDate: 'Previous Position Date',
    ordained: 'Ordained',
    ordainedDate: 'Ordained Date',
    convictedOfCrime: 'Convicted of Crime',
    sexualMisconductInvestigation: 'Sexual Misconduct Investigation',
    integrityQuestionableBackground: 'Integrity Questionable Background',
    homeAddress: 'Home Address',
    cityTown: 'City/Town',
    stateProvince: 'State/Province',
    country: 'Country',
    zipCode: 'Zip Code',
    mailingAddress: 'Mailing Address',
    cityTown2: 'Mailing City/Town',
    stateProvince2: 'Mailing State/Province',
    country2: 'Mailing Country',
    zipCode2: 'Mailing Zip Code',
    primaryPhone: 'Primary Phone',
    primaryPhoneType: 'Primary Phone Type',
    alternatePhone: 'Alternate Phone',
    alternatePhoneType: 'Alternate Phone Type',
    emailAddress: 'Email Address',
    other: 'Other Information',
    referenceName: 'Reference Name',
    referencePhone: 'Reference Phone',
    referenceEmail: 'Reference Email',
    referenceAddress: 'Reference Address',
    referenceCityTown: 'Reference City/Town',
    referenceStateProvince: 'Reference State/Province',
    referenceCountry: 'Reference Country',
    referenceZipCode: 'Reference Zip Code',
    howDoYouKnowThisPerson: 'How Do You Know This Person',
    highestAcademicQualification: 'Highest Academic Qualification',
    fieldOfStudy: 'Field of Study',
    highestAcademicQualificationDetails:
      'Highest Academic Qualification Details',
    detailsOfCurrentEmployment: 'Details of Current Employment',
  };

  hasError(control: AbstractControl | null, errorType?: string): boolean {
    if (!control) return false;

    if (errorType) {
      return control.hasError(errorType) && (control.dirty || control.touched);
    }
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(fieldName: string, control: AbstractControl | null): string {
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${
        errors['minlength'].requiredLength
      } characters`;
    }
    if (errors['maxlength']) {
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${
        errors['maxlength'].requiredLength
      } characters`;
    }
    if (errors['pattern']) {
      return this.getPatternErrorMessage(fieldName);
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }

    return 'Invalid input';
  }

  private getFieldDisplayName(fieldName: string): string {
    return this.fieldNames[fieldName] || fieldName;
  }

  private getPatternErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'legalFirstName':
      case 'legalMiddleName':
      case 'legalLastName':
      case 'profferedName':
        return 'Name can only contain letters and spaces';
      case 'zipCode':
      case 'zipCode2':
        return 'Please enter a valid Nigerian postal code (e.g., 100001)';
      case 'nationalIdNumber':
        return 'Please enter a valid national identification number';
      case 'primaryPhone':
        return 'Please enter a valid phone number (e.g., 08023034230 or +2348023034230)';
      case 'alternatePhone':
        return 'Please enter a valid phone number (e.g., 08023034230 or +2348023034230)';
      case 'emailAddress':
        return 'Please enter a valid email address';
      default:
        return 'Invalid format';
    }
  }
}
