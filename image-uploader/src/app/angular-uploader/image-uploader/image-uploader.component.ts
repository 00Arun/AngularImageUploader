import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'src/app/_services/alert.service';
import { DialogService } from 'src/app/_services/dialog.service';
import { NgImageCropperComponent } from '../ng-image-cropper/ng-image-cropper.component';


@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  urlsDetails = [];
  @ViewChild("uploader") uploadInput: ElementRef;

  constructor(
    public dialog: MatDialog,
    private alertService: AlertService,
    public dialogService: DialogService
  ) { }
  ngOnInit(): void {
  }
  public UploadFile(files) {
    let imgae = files.target.files[0];
    let IsValidUpload = false;
    let StatusMessage: string;
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileItem = imgae.size / 1024 / 1024;
    const FileExt = imgae.type.split("/")[1];
    for (let i = 0; i < allowedExtensions.length; i++) {
      if (FileExt === allowedExtensions[i]) {
        IsValidUpload = true;
        if (fileItem > 5) {
          StatusMessage = "File size should be less than 5 MB.";
          IsValidUpload = false;
        }
        break;
      } else {
        StatusMessage = "OOps!! Only jpg, jpeg and png files are allowed.";
        IsValidUpload = false;
      }
    }
    if (IsValidUpload === false) {
      this.alertService.showWarning("", StatusMessage);
    } else {
      const dialogRef = this.dialog.open(NgImageCropperComponent, {
        width: "590px",
        height: "484px",
        data: files,
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result.event != 'close') {
          this.urlsDetails.push({
            Url: result.data.base64,
            DisplayName: result.data.name
          });
        } else {
          this.uploadInput.nativeElement.value = ''
        }
      });
    }
  }
  public dropFiles(event): void {
    if (event.dataTransfer) {
      if (event.dataTransfer.types[0] === "Files") {
        let inputMarkup = {
          target: {
            files: event.dataTransfer.files
          }
        }
        this.UploadFile(inputMarkup);
      } else {
        this.alertService.showError("", "OOps!! something goes wrong");
        return;
      }
    }
  }
  public ondragover(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }
  public ondrop(event): void {
    event.stopPropagation();
    event.preventDefault();
    this.dropFiles(event);
  }
  public onDeleteCall(name: string, index: number) {
    this.dialogService
      .openConfirmDialog("Are you sure you want delete this image.")
      .afterClosed()
      .subscribe(res => {
        if (res) {
          if (index !== -1) {
            console.log(this.uploadInput);
            this.uploadInput.nativeElement.value = ''
            this.urlsDetails.splice(index, 1);
          }
        }
      });
  }

}
