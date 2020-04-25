import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  urlsDetails: any;
  constructor() { }

  ngOnInit(): void {
  }
  public UploadFile(files) {

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
  public onDeleteCall(dbName: string, index: number) {
    if (index !== -1) {

    }
  }

}
