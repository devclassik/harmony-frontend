import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
    >
      <div
        class="flex flex-col items-center justify-center p-8 bg-white bg-opacity-95 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-200"
      >
        <!-- Large Spinner -->
        <div class="relative">
          <div
            class="animate-spin rounded-full border-4 border-solid border-green-200 border-t-green-600"
            [style.width]="size"
            [style.height]="size"
          ></div>
          <!-- Inner spinning ring for more visual appeal -->
          <div
            class="absolute top-2 left-2 animate-spin rounded-full border-2 border-solid border-green-100 border-t-green-400"
            [style.width]="innerSize"
            [style.height]="innerSize"
            style="animation-direction: reverse; animation-duration: 0.8s;"
          ></div>
        </div>

        <!-- Loading Text -->
        <div class="mt-6 text-center">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-600" *ngIf="message">{{ message }}</p>
        </div>

        <!-- Animated dots -->
        <div class="flex space-x-1 mt-4">
          <div
            class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style="animation-delay: 0ms;"
          ></div>
          <div
            class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style="animation-delay: 150ms;"
          ></div>
          <div
            class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style="animation-delay: 300ms;"
          ></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-spin {
        animation: spin 1.2s linear infinite;
      }

      .animate-bounce {
        animation: bounce 1.4s ease-in-out infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `,
  ],
})
export class LoadingOverlayComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Loading...';
  @Input() message?: string;
  @Input() size: string = '64px';

  get innerSize(): string {
    const sizeNum = parseInt(this.size);
    return `${sizeNum - 16}px`;
  }
}
