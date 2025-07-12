import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl mt-6 shadow-sm">
      <div class="pt-8 pb-12 px-8">
        <div class="w-full">
          <div
            class="text-base font-medium text-gray-800 border-b border-gray-100 pb-2 mb-6"
          >
            {{ title }}
            <ng-content select="[slot=header-icon]"></ng-content>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class FormSectionComponent {
  @Input() title: string = '';
}
