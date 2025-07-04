import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private hasView = false;

  @Input() appPermission!: string;
  @Input() appPermissionAction: 'view' | 'create' | 'edit' | 'delete' = 'view';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateView() {
    const hasPermission = this.permissionService.hasPermission(
      this.appPermission,
      this.appPermissionAction
    );

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
