import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../_services/dialog.service';
import { AlertService } from '../_services/alert.service';
import { CroppedComponent } from '../cropped/cropped.component';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  urlsDetails = [];
  constructor(
    public dialog: MatDialog,
    private alertService: AlertService,
    public dialogService: DialogService
  ) { }

  ngOnInit(): void {
  }
  public UploadFile(files) {
    const dialogRef = this.dialog.open(CroppedComponent, {
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
      }
    });
  }
  public dropFiles(event): void {
    if (event.dataTransfer) {
      if (event.dataTransfer.types[0] === "Files") {

      } else {
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
  public onDeleteCall() {

  }

}
