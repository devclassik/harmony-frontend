import { Component } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { TopNavComponent } from '../top-nav/top-nav.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SideBarComponent, TopNavComponent, RouterOutlet, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  sidebarToggle = false;

  onSidebarToggle() {
    this.sidebarToggle = !this.sidebarToggle;
  }
}
