import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CroppedComponent } from './cropped.component';

describe('CroppedComponent', () => {
  let component: CroppedComponent;
  let fixture: ComponentFixture<CroppedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CroppedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CroppedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
