import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectConfirmPromptComponent } from './reject-confirm-prompt.component';

describe('RejectConfirmPromptComponent', () => {
  let component: RejectConfirmPromptComponent;
  let fixture: ComponentFixture<RejectConfirmPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectConfirmPromptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectConfirmPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
