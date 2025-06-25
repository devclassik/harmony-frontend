import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeScreenAnimationComponent } from './welcome-screen-animation.component';

describe('WelcomeScreenAnimationComponent', () => {
  let component: WelcomeScreenAnimationComponent;
  let fixture: ComponentFixture<WelcomeScreenAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeScreenAnimationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeScreenAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
