import { Component } from '@angular/core';
import { ImageUploaderComponent, UploadItem, UploaderConfig } from 'angular-material-image-uploader';

@Component({
  selector: 'app-root',
  imports: [ImageUploaderComponent],
  template: `
    <app-angular-material-uploader
      [config]="config"
      [showSettingsButton]="showSettingsButton"
      (imageDetails)="getImageDetails($event)"
      (uploadComplete)="onUploaded($event)">
    </app-angular-material-uploader>
  `
})
export class App {
  /** Configuration **/

  /** Show the gear icon that lets the user change the settings below at runtime. */
  showSettingsButton = true;

  /** Any key left out falls back to DEFAULT_UPLOADER_CONFIG from the package. */
  config: Partial<UploaderConfig> = {
    multiple: true,             // false = one image, replaced on the next pick
    maxFiles: 10,
    maxFileSizeMB: 5,
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
    cropBeforeAdd: true,        // open the cropper for every picked image
    allowSkipCrop: true,        // "Use original" button in the cropper
    defaultAspectRatio: 'free', // 'free' | '1:1' | '4:3' | '3:2' | '16:9' | '9:16'
    outputFormat: 'png',        // 'png' | 'jpeg' | 'webp'
    outputQuality: 90,
    resizeToWidth: 0,           // 0 = keep original size
    autoUpload: false,
    allowReorder: true,
    allowPaste: true,
    uploadUrl: ''               // POST endpoint; empty = simulated upload
  };

  /** Current list of images, kept in sync by the uploader. */
  imageDetails: UploadItem[] = [];

  getImageDetails(items: UploadItem[]): void {
    this.imageDetails = items;
  }

  onUploaded(item: UploadItem): void {
    console.log('Uploaded', item.name, item.file);
  }
}
