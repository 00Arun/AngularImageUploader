import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgImageCropperComponent } from './ng-image-cropper.component';

describe('NgImageCropperComponent', () => {
  let component: NgImageCropperComponent;
  let fixture: ComponentFixture<NgImageCropperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgImageCropperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgImageCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
