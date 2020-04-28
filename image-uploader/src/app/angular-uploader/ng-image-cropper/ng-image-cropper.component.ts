import { Component, OnInit, Inject } from '@angular/core';
import { AlertService } from 'src/app/_services/alert.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DialogService } from 'src/app/_services/dialog.service';

@Component({
  selector: 'app-ng-image-cropper',
  templateUrl: './ng-image-cropper.component.html',
  styleUrls: ['./ng-image-cropper.component.scss'],
  providers:[DialogService]
})
export class NgImageCropperComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  loading = true
  constructor(
    private alertService: AlertService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<NgImageCropperComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit(): void {
    this.imageChangedEvent = this.data;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
   //this.loading = false;
  }
  cropperReady() {
    this.loading = false;
  }
  loadImageFailed() {
    this.alertService.showError("", "OOps!! unable to load image.");
    this.loading = false;
  }
  crop() {
    let imageDetails = {
      Image: new File([this.croppedImage], this.data.target.files[0].name),
      name: this.data.target.files[0].name,
      type: this.data.target.files[0].type,
      base64: this.croppedImage
    }
    this.dialogRef.close({ event: 'crop', data: imageDetails });
  }
  closeDialog() {
    this.dialogRef.close({ event: 'close', data: null });
  }


}
