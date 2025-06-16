import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexOfFileComponent } from './index-of-file.component';

describe('IndexOfFileComponent', () => {
  let component: IndexOfFileComponent;
  let fixture: ComponentFixture<IndexOfFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexOfFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexOfFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
