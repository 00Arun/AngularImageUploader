import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UploadItem } from '../../_models/upload-item.model';
import { ImageUtilService } from '../../_services/image-util.service';

export interface PreviewDialogData {
  items: UploadItem[];
  index: number;
}

export interface PreviewDialogResult {
  action: 'edit';
  item: UploadItem;
}

@Component({
  selector: 'app-image-preview-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './image-preview-dialog.component.html',
  styleUrl: './image-preview-dialog.component.scss'
})
export class ImagePreviewDialogComponent {
  private readonly imageUtil = inject(ImageUtilService);
  readonly dialogRef = inject<MatDialogRef<ImagePreviewDialogComponent, PreviewDialogResult>>(MatDialogRef);
  readonly data = inject<PreviewDialogData>(MAT_DIALOG_DATA);

  index = this.data.index || 0;

  get item(): UploadItem { return this.data.items[this.index]; }
  get hasPrev(): boolean { return this.index > 0; }
  get hasNext(): boolean { return this.index < this.data.items.length - 1; }

  prev(): void { if (this.hasPrev) { this.index -= 1; } }
  next(): void { if (this.hasNext) { this.index += 1; } }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') { this.prev(); }
    if (event.key === 'ArrowRight') { this.next(); }
  }

  download(): void {
    this.imageUtil.download(this.item.file, this.item.name);
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit', item: this.item });
  }

  formatBytes(bytes: number): string {
    return this.imageUtil.formatBytes(bytes);
  }
}
