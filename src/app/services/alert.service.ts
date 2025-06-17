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
  showAlert(
    type: AlertType,
    message: string,
    options: AlertOptions = {}
  ) {
    const { autoClose = false, autoCloseTime = 5000 } = options;
    
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
}
