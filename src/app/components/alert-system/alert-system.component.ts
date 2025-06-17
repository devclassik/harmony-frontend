import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert, AlertService } from '../../services/alert.service';
import { Observable, Subscription } from 'rxjs';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-alert-system',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  templateUrl: './alert-system.component.html',
  styleUrl: './alert-system.component.css',
})
export class AlertSystemComponent implements OnInit, OnDestroy {
  alerts$: Observable<Alert[]>;
  private subscription?: Subscription;

  constructor(private alertService: AlertService) {
    this.alerts$ = this.alertService.alerts$;
  }

  ngOnInit(): void {
    this.subscription = this.alerts$.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  showSuccessAlert() {
    this.alertService.success('Operation successful!', { autoClose: true });
  }

  showErrorAlert() {
    this.alertService.error('Something went wrong.');
  }

  showWarningAlert() {
    this.alertService.warning('Please check your input.');
  }

  showInfoAlert() {
    this.alertService.info('This is an informational message.', { autoClose: true });
  }

  closeAlert(id: number) {
    this.alertService.closeAlert(id);
  }
}
