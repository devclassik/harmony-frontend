import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RbacService } from '../services/rbac.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input() appHasPermission!: string; // Format: "resource:action"
  @Input() appHasPermissionElse?: TemplateRef<unknown>;

  private subscription?: Subscription;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService,
    private rbacService: RbacService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView() {
    const userRole = this.authService.getUserRole();

    if (!userRole || !this.appHasPermission) {
      this.showElseTemplate();
      return;
    }

    const [resource, action] = this.appHasPermission.split(':');

    if (!resource || !action) {
      console.warn(
        'HasPermissionDirective: Invalid permission format. Use "resource:action"'
      );
      this.showElseTemplate();
      return;
    }

    const hasPermission = this.rbacService.hasPermission(
      userRole,
      resource,
      action
    );

    if (hasPermission) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.showElseTemplate();
    }
  }

  private showElseTemplate() {
    this.viewContainer.clear();
    if (this.appHasPermissionElse) {
      this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
    }
  }
}
