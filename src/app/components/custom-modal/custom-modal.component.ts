import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-modal.component.html',
  styleUrl: './custom-modal.component.css',
})
export class CustomModalComponent implements AfterViewInit {
  @Input() title: string = 'Success';
  @Input() text: string = 'Your action was successful.';
  @Input() subText?: string;
  @Input() showOtp: boolean = false;
  @Input() buttonText: string = 'Continue';
  @Input() isLoading: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<string>();
  @Output() resend = new EventEmitter<string>();

  otpValues: string[] = ['', '', '', '', '', ''];

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  ngAfterViewInit() {
    if (this.showOtp && this.otpInputs.length > 0) {
      setTimeout(() => {
        this.otpInputs.first.nativeElement.focus();
      }, 200);
    }
  }

  getFormattedText(): { text: string; lastWord: string } {
    const words = this.subText ? this.subText.split(' ') : [];
    const lastWord = words.pop() || '';
    return {
      text: words.join(' '),
      lastWord,
    };
  }

  closeModal() {
    this.onClose.emit();
  }

  onOtpInput(event: any, index: number): void {
    const target = event.target;
    let value = target.value;

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      target.value = this.otpValues[index];
      return;
    }

    // Handle single digit input
    if (value.length === 1) {
      // Clear all other values from the input to prevent carryover
      target.value = value;
      this.otpValues[index] = value;
      this.moveToNext(index);
    }
    // Handle multiple digits (paste or fast typing)
    else if (value.length > 1) {
      // Clear the current input first
      target.value = '';
      this.handleMultipleDigits(value, index);
    }
    // Handle deletion
    else {
      this.otpValues[index] = '';
      target.value = '';
    }
  }

  onOtpKeydown(event: any, index: number): void {
    const target = event.target;

    if (event.key === 'Backspace') {
      if (this.otpValues[index] === '' && index > 0) {
        // Move to previous input if current is empty
        this.moveToPrevious(index);
      } else {
        // Clear current input
        this.otpValues[index] = '';
        target.value = '';
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.moveToPrevious(index);
    } else if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.moveToNext(index);
    }
  }

  onOtpPaste(event: any, index: number): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '');

    if (digits.length > 0) {
      this.handleMultipleDigits(digits, index);
    }
  }

  private handleMultipleDigits(digits: string, startIndex: number): void {
    const digitArray = digits.split('');

    for (let i = 0; i < digitArray.length && startIndex + i < 6; i++) {
      const currentIndex = startIndex + i;
      this.otpValues[currentIndex] = digitArray[i];
      this.otpInputs.toArray()[currentIndex].nativeElement.value =
        digitArray[i];
    }

    // Focus on the next empty input or last input
    const nextIndex = Math.min(startIndex + digitArray.length, 5);
    this.focusInput(nextIndex);
  }

  private moveToNext(currentIndex: number): void {
    if (currentIndex < 5) {
      this.focusInput(currentIndex + 1);
    }
  }

  private moveToPrevious(currentIndex: number): void {
    if (currentIndex > 0) {
      this.focusInput(currentIndex - 1);
    }
  }

  private focusInput(index: number): void {
    setTimeout(() => {
      const input = this.otpInputs.toArray()[index]?.nativeElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 10);
  }

  getOtpCode(): string {
    return this.otpValues.join('');
  }

  onSubmitOtp(): void {
    this.onSubmit.emit(this.getOtpCode());
  }
}
