import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, firstValueFrom } from 'rxjs';
import { AlertService } from '../../_services/alert.service';
import { DialogService } from '../../_services/dialog.service';
import { ImageUtilService } from '../../_services/image-util.service';
import { UploadService } from '../../_services/upload.service';
import { CropDialogData, CropDialogResult, NgImageCropperComponent } from '../ng-image-cropper/ng-image-cropper.component';
import { ImagePreviewDialogComponent, PreviewDialogData, PreviewDialogResult } from '../image-preview-dialog/image-preview-dialog.component';
import { CropResult, UploadItem } from '../../_models/upload-item.model';
import { ASPECT_RATIOS, DEFAULT_UPLOADER_CONFIG, OUTPUT_FORMATS, UploaderConfig } from '../../_config/uploader.config';

@Component({
  selector: 'app-angular-material-uploader, app-image-uploader',
  imports: [
    UpperCasePipe, FormsModule, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder,
    MatButtonModule, MatRippleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule,
    MatProgressBarModule, MatSelectModule, MatSlideToggleModule, MatTooltipModule
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss'
})
export class ImageUploaderComponent implements OnDestroy {
  /** Override any subset of the defaults from the parent: <app-image-uploader [config]="{ multiple: false }"> */
  @Input() set config(value: Partial<UploaderConfig> | null | undefined) {
    this.cfg = { ...DEFAULT_UPLOADER_CONFIG, ...(value ?? {}) };
  }
  get config(): Partial<UploaderConfig> { return this.cfg; }

  // ----- v1 inputs, kept so existing apps upgrade without template changes -----

  /** @deprecated v1 name for `config.allowedTypes`. */
  @Input() set allowImageType(value: string[] | null | undefined) {
    if (value?.length) { this.cfg.allowedTypes = value.map(t => t.trim().replace(/^\./, '').toLowerCase()); }
  }
  /** @deprecated v1 name for `config.maxFileSizeMB`. */
  @Input() set sizeLimit(value: number | null | undefined) {
    if (value != null) { this.cfg.maxFileSizeMB = Number(value); }
  }
  /** @deprecated v1 name for `config.cropBeforeAdd`. */
  @Input() set Iscrop(value: boolean | null | undefined) {
    if (value != null) { this.cfg.cropBeforeAdd = !!value; }
  }

  /** Show the gear icon that opens the in-page settings panel. */
  readonly showSettingsButton = input(true);

  /** Emits the current list whenever an image is added, edited, reordered, uploaded, or removed. */
  readonly imageDetails = output<UploadItem[]>();

  /** Emits an item when its upload finishes successfully. */
  readonly uploadComplete = output<UploadItem>();

  @ViewChild('uploader') uploadInput?: ElementRef<HTMLInputElement>;

  private readonly dialog = inject(MatDialog);
  private readonly alertService = inject(AlertService);
  private readonly dialogService = inject(DialogService);
  private readonly imageUtil = inject(ImageUtilService);
  private readonly uploadService = inject(UploadService);

  /** Settings are edited through ngModel, so a plain object is enough here. */
  cfg: UploaderConfig = { ...DEFAULT_UPLOADER_CONFIG };

  readonly items = signal<UploadItem[]>([]);
  readonly isDragOver = signal(false);
  readonly showSettings = signal(false);
  readonly busy = signal(false);

  readonly totalSize = computed(() => this.items().reduce((sum, i) => sum + i.size, 0));
  readonly readyItems = computed(() => this.items().filter(i => i.status === 'ready' || i.status === 'error'));
  readonly uploadingCount = computed(() => this.items().filter(i => i.status === 'uploading').length);
  readonly doneCount = computed(() => this.items().filter(i => i.status === 'done').length);

  readonly aspectRatios = ASPECT_RATIOS;
  readonly outputFormats = OUTPUT_FORMATS;

  private uploads = new Map<string, Subscription>();

  constructor() {
    effect(() => this.imageDetails.emit(this.items()));
  }

  ngOnDestroy(): void {
    this.uploads.forEach(sub => sub.unsubscribe());
  }

  // ---------- derived state ----------

  get acceptAttr(): string { return this.cfg.allowedTypes.map(t => `.${t}`).join(','); }
  get allowedTypesLabel(): string { return this.cfg.allowedTypes.join(', '); }
  get remainingSlots(): number { return this.cfg.multiple ? Math.max(0, this.cfg.maxFiles - this.items().length) : 1; }
  get canAddMore(): boolean { return this.cfg.multiple ? this.remainingSlots > 0 : true; }

  /** Re-emit the list after an item was mutated in place so the view refreshes. */
  private touch(): void {
    this.items.update(list => [...list]);
  }

  // ---------- picking files ----------

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // allow picking the same file again later
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    this.handleFiles(event.dataTransfer ? Array.from(event.dataTransfer.files) : []);
  }

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    if (!this.cfg.allowPaste || this.dialog.openDialogs.length || !event.clipboardData) { return; }
    const files: File[] = [];
    Array.from(event.clipboardData.items).forEach((item, i) => {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const ext = file.type.split('/')[1] || 'png';
          const name = file.name && file.name !== 'image.png' ? file.name : `pasted-${Date.now()}-${i + 1}.${ext}`;
          files.push(new File([file], name, { type: file.type }));
        }
      }
    });
    if (files.length) {
      event.preventDefault();
      this.handleFiles(files);
    }
  }

  private handleFiles(picked: File[]): void {
    if (!picked.length || this.busy()) { return; }
    let files = picked;

    if (!this.cfg.multiple && files.length > 1) {
      this.alertService.showInfo('Multiple upload is turned off, so only the first image was taken.');
      files = [files[0]];
    }
    if (!this.cfg.multiple && this.items().length) {
      // Single mode: the new image replaces the old one.
      this.items().forEach(i => this.cancelUpload(i));
      this.items.set([]);
    }
    if (this.cfg.multiple && files.length > this.remainingSlots) {
      if (this.remainingSlots === 0) {
        this.alertService.showWarning(`You can add at most ${this.cfg.maxFiles} images.`);
        return;
      }
      this.alertService.showWarning(`Only ${this.remainingSlots} more image(s) can be added (limit ${this.cfg.maxFiles}).`);
      files = files.slice(0, this.remainingSlots);
    }

    const valid = files.filter(f => this.validate(f));
    if (!valid.length) { return; }

    if (this.cfg.cropBeforeAdd) {
      this.openCropper(valid).then(results => results.forEach(r => this.addResult(r)));
    } else {
      valid.forEach(f => this.addUncropped(f));
    }
  }

  private validate(file: File): boolean {
    const ext = (file.type.split('/')[1] || '').toLowerCase();
    if (!file.type.startsWith('image/') || !this.cfg.allowedTypes.includes(ext)) {
      this.alertService.showError(`"${file.name}" is not allowed. Use ${this.allowedTypesLabel}.`);
      return false;
    }
    if (file.size / 1024 / 1024 > this.cfg.maxFileSizeMB) {
      this.alertService.showError(`"${file.name}" is larger than ${this.cfg.maxFileSizeMB} MB.`);
      return false;
    }
    if (this.items().some(i => i.originalFile.name === file.name && i.originalFile.size === file.size)) {
      this.alertService.showWarning(`"${file.name}" is already in the list.`);
      return false;
    }
    return true;
  }

  // ---------- cropping ----------

  private async openCropper(files: File[]): Promise<CropResult[]> {
    this.busy.set(true);
    const data: CropDialogData = { files, config: this.cfg };
    const ref = this.dialog.open<NgImageCropperComponent, CropDialogData, CropDialogResult>(NgImageCropperComponent, {
      width: '960px',
      maxWidth: '96vw',
      maxHeight: '95vh',
      data,
      disableClose: true,
      autoFocus: false,
      panelClass: 'cropper-dialog'
    });
    const result = await firstValueFrom(ref.afterClosed());
    this.busy.set(false);
    return result && result.event === 'done' ? result.results : [];
  }

  editItem(item: UploadItem): void {
    if (item.status === 'uploading') {
      this.alertService.showInfo('Wait for the upload to finish before editing.');
      return;
    }
    this.openCropper([item.originalFile]).then(results => {
      if (!results.length) { return; }
      const r = results[0];
      Object.assign(item, {
        name: r.file.name,
        type: r.file.type,
        size: r.file.size,
        width: r.width,
        height: r.height,
        file: r.file,
        previewUrl: r.dataUrl,
        cropped: r.cropped,
        status: 'ready',
        progress: 0,
        error: undefined
      });
      this.touch();
      this.alertService.showSuccess(`"${item.name}" updated.`);
      if (this.cfg.autoUpload) { this.upload(item); }
    });
  }

  // ---------- list management ----------

  private addResult(r: CropResult): void {
    const item: UploadItem = {
      id: this.imageUtil.uid(),
      name: r.file.name,
      type: r.file.type,
      size: r.file.size,
      width: r.width,
      height: r.height,
      originalFile: r.originalFile,
      file: r.file,
      previewUrl: r.dataUrl,
      cropped: r.cropped,
      status: 'ready',
      progress: 0,
      addedAt: new Date()
    };
    this.items.update(list => [...list, item]);
    if (this.cfg.autoUpload) { this.upload(item); }
  }

  private addUncropped(file: File): void {
    this.imageUtil.fileToDataUrl(file).then(url =>
      this.imageUtil.getImageDimensions(url).then(dim =>
        this.addResult({ originalFile: file, file, dataUrl: url, width: dim.width, height: dim.height, cropped: false })
      )
    ).catch(() => this.alertService.showError(`Could not read "${file.name}".`));
  }

  preview(item: UploadItem): void {
    const data: PreviewDialogData = { items: this.items(), index: this.items().indexOf(item) };
    this.dialog.open<ImagePreviewDialogComponent, PreviewDialogData, PreviewDialogResult>(ImagePreviewDialogComponent, {
      width: '900px',
      maxWidth: '96vw',
      data,
      autoFocus: false,
      panelClass: 'preview-dialog-panel'
    }).afterClosed().subscribe(res => {
      if (res?.action === 'edit') { this.editItem(res.item); }
    });
  }

  download(item: UploadItem): void {
    this.imageUtil.download(item.file, item.name);
  }

  remove(item: UploadItem): void {
    this.dialogService.openConfirmDialog(`Remove <b>${item.name}</b> from the list?`)
      .afterClosed().subscribe(yes => {
        if (!yes) { return; }
        this.cancelUpload(item);
        this.items.update(list => list.filter(i => i !== item));
      });
  }

  clearAll(): void {
    if (!this.items().length) { return; }
    this.dialogService.openConfirmDialog(`Remove all ${this.items().length} images?`)
      .afterClosed().subscribe(yes => {
        if (!yes) { return; }
        this.items().forEach(i => this.cancelUpload(i));
        this.items.set([]);
      });
  }

  reorder(event: CdkDragDrop<UploadItem[]>): void {
    this.items.update(list => {
      const next = [...list];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }

  // ---------- uploading ----------

  upload(item: UploadItem): void {
    if (item.status === 'uploading' || item.status === 'done') { return; }
    item.status = 'uploading';
    item.progress = 0;
    item.error = undefined;
    this.touch();
    const sub = this.uploadService.upload(item, this.cfg.uploadUrl).subscribe({
      next: progress => { item.progress = progress; this.touch(); },
      error: (err: unknown) => {
        item.status = 'error';
        item.error = (err instanceof Error && err.message) || 'Upload failed';
        this.uploads.delete(item.id);
        this.touch();
        this.alertService.showError(`"${item.name}" failed to upload.`);
      },
      complete: () => {
        item.status = 'done';
        item.progress = 100;
        this.uploads.delete(item.id);
        this.touch();
        this.uploadComplete.emit(item);
        this.alertService.showSuccess(`"${item.name}" uploaded.`);
      }
    });
    this.uploads.set(item.id, sub);
  }

  uploadAll(): void {
    const pending = this.readyItems();
    if (!pending.length) {
      this.alertService.showInfo('Nothing to upload.');
      return;
    }
    pending.forEach(i => this.upload(i));
  }

  cancelUpload(item: UploadItem): void {
    const sub = this.uploads.get(item.id);
    if (sub) {
      sub.unsubscribe();
      this.uploads.delete(item.id);
    }
    if (item.status === 'uploading') {
      item.status = 'ready';
      item.progress = 0;
      this.touch();
    }
  }

  // ---------- settings ----------

  onMultipleChanged(): void {
    if (!this.cfg.multiple && this.items().length > 1) {
      this.alertService.showInfo('Single mode keeps only the first image.');
      this.items().slice(1).forEach(i => this.cancelUpload(i));
      this.items.update(list => list.slice(0, 1));
    }
  }

  formatBytes(bytes: number): string {
    return this.imageUtil.formatBytes(bytes);
  }
}
