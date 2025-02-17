import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCaptionComponent } from './login-caption.component';

describe('LoginCaptionComponent', () => {
  let component: LoginCaptionComponent;
  let fixture: ComponentFixture<LoginCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCaptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCaptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
