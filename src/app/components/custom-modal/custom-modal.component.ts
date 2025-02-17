import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-modal.component.html',
  styleUrl: './custom-modal.component.css'
})
export class CustomModalComponent {
  @Input() title: string = 'Success';
  @Input() text: string = 'Your action was successful.';
  @Input() subText?: string;
  @Input() showOtp: boolean = false;
  @Input() buttonText: string = 'Continue';

  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<string>();

  otpCode: string[] = new Array(6).fill('');

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;


  getFormattedText(): { text: string; lastWord: string } {
    if (!this.subText) return { text: '', lastWord: '' };;

    const words = this.subText.split(' ');
    const lastWord = words.pop() || '';
    const remainingText = words.join(' '); 

    return { text: remainingText, lastWord };
  }

  closeModal() {
    this.onClose.emit();
  }


  handleInput(event: any, index: number): void {
    const input = event.target;
    let value = input.value.trim();

    // Allow only numbers (0-9) and prevent multiple characters
    if (!/^\d$/.test(value)) {
      input.value = ''; // Reset invalid input
      return;
    }

    // Update the array **after** validation
    this.otpCode[index] = value;

    // Move to the next input field if available
    if (index < this.otpCode.length - 1) {
      setTimeout(() => this.otpInputs.get(index + 1)?.nativeElement.focus(), 50);
    }
  }

  handleBackspace(event: any, index: number): void {
    if (event.key === 'Backspace') {
      this.otpCode[index] = ''; // Clear the value

      // Move focus to the previous input if available
      if (index > 0) {
        setTimeout(() => this.otpInputs.get(index - 1)?.nativeElement.focus(), 50);
      }
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text')?.trim() || '';

    if (/^\d{6}$/.test(pastedData)) {
      this.otpCode = pastedData.split('');
      setTimeout(() => this.otpInputs.last.nativeElement.focus(), 50);
    }
  }
}
