import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
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
    const words = this.text.split(' ');
    const lastWord = words.pop() || '';
    return {
      text: words.join(' '),
      lastWord
    };
  }

  closeModal() {
    this.onClose.emit();
  }

  handleInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value.length === 1) {
      if (index < this.otpInputs.length - 1) {
        this.otpInputs.toArray()[index + 1].nativeElement.focus();
      }
    }
  }

  handleBackspace(event: any, index: number): void {
    if (event.key === 'Backspace' && !event.target.value) {
      if (index > 0) {
        this.otpInputs.toArray()[index - 1].nativeElement.focus();
      }
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const digits = pastedData.split('').slice(0, this.otpInputs.length);
      digits.forEach((digit, index) => {
        if (this.otpInputs.toArray()[index]) {
          this.otpInputs.toArray()[index].nativeElement.value = digit;
        }
      });
    }
  }
}
