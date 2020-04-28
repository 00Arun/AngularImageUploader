import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { NgImageCropperComponent } from './ng-image-cropper/ng-image-cropper.component';
import { MatConfirmDialogComponent } from './mat-confirm-dialog/mat-confirm-dialog.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { MaterialModule } from '../MaterialModels/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [ImageUploaderComponent, NgImageCropperComponent, MatConfirmDialogComponent],
  imports: [
    CommonModule,
    ImageCropperModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,  
    BrowserAnimationsModule
  ],
  exports:[
    CommonModule,
    ImageCropperModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,  
    BrowserAnimationsModule,
    ImageUploaderComponent, NgImageCropperComponent, MatConfirmDialogComponent
  ]
})
export class AngularUploaderModule { }
