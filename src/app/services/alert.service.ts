import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  autoClose?: boolean;
  autoCloseTime?: number;
}

export interface AlertStyle {
  wrapper: string;
  icon: string;
  text: string;
  animation: string;
}

export interface AlertOptions {
  autoClose?: boolean;
  autoCloseTime?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  constructor() {}

  /**
   * Show a success alert
   * @param message The message to display
   * @param options Optional configuration for the alert
   */
  success(message: string, options: AlertOptions = {}) {
    this.showAlert('success', message, options);
  }

  /**
   * Show an error alert
   * @param message The message to display
   * @param options Optional configuration for the alert
   */
  error(message: string, options: AlertOptions = {}) {
    this.showAlert('error', message, options);
  }

  /**
   * Show a warning alert
   * @param message The message to display
   * @param options Optional configuration for the alert
   */
  warning(message: string, options: AlertOptions = {}) {
    this.showAlert('warning', message, options);
  }

  /**
   * Show an info alert
   * @param message The message to display
   * @param options Optional configuration for the alert
   */
  info(message: string, options: AlertOptions = {}) {
    this.showAlert('info', message, options);
  }

  /**
   * Show an alert with the specified type and message
   * @param type The type of alert
   * @param message The message to display
   * @param options Optional configuration for the alert
   */
  showAlert(type: AlertType, message: string, options: AlertOptions = {}) {
    // Set default auto-close behavior based on alert type
    const getDefaultAutoClose = (alertType: AlertType): boolean => {
      return true; // Auto-close is now default for all types
    };

    const getDefaultAutoCloseTime = (alertType: AlertType): number => {
      switch (alertType) {
        case 'success':
          return 4000; // Success messages can close faster
        case 'info':
          return 5000; // Info messages need moderate time
        case 'warning':
          return 6000; // Warnings need more time to read
        case 'error':
          return 7000; // Errors need the most time to read
        default:
          return 5000;
      }
    };

    const {
      autoClose = getDefaultAutoClose(type),
      autoCloseTime = getDefaultAutoCloseTime(type),
    } = options;

    const newAlert: Alert = {
      id: Date.now(),
      type,
      message,
      autoClose,
      autoCloseTime,
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, newAlert]);
  }

  /**
   * Close a specific alert by its ID
   * @param id The ID of the alert to close
   */
  closeAlert(id: number) {
    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next(currentAlerts.filter((alert) => alert.id !== id));
  }

  /**
   * Close all currently displayed alerts
   */
  clearAll() {
    this.alertsSubject.next([]);
  }

  // Convenience methods for manual dismissal alerts
  /**
   * Show a success alert that requires manual dismissal
   */
  successManual(message: string) {
    this.showAlert('success', message, { autoClose: false });
  }

  /**
   * Show an error alert that requires manual dismissal
   */
  errorManual(message: string) {
    this.showAlert('error', message, { autoClose: false });
  }

  /**
   * Show a warning alert that requires manual dismissal
   */
  warningManual(message: string) {
    this.showAlert('warning', message, { autoClose: false });
  }

  /**
   * Show an info alert that requires manual dismissal
   */
  infoManual(message: string) {
    this.showAlert('info', message, { autoClose: false });
  }
}
