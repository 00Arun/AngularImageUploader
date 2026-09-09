import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { AlertService } from '../../_services/alert.service';
import { ImageUtilService } from '../../_services/image-util.service';
import { ASPECT_RATIOS, AspectRatioKey, OUTPUT_FORMATS, OutputFormat, UploaderConfig } from '../../_config/uploader.config';
import { CropResult } from '../../_models/upload-item.model';

export interface CropDialogData {
  files: File[];
  config: UploaderConfig;
}

export interface CropDialogResult {
  event: 'done' | 'cancel';
  results: CropResult[];
}

interface Size { width: number; height: number; }

@Component({
  selector: 'app-ng-image-cropper',
  imports: [
    FormsModule, ImageCropperComponent, MatDialogModule, MatButtonModule, MatButtonToggleModule,
    MatFormFieldModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule, MatSelectModule,
    MatSliderModule, MatSlideToggleModule, MatTooltipModule
  ],
  templateUrl: './ng-image-cropper.component.html',
  styleUrl: './ng-image-cropper.component.scss'
})
export class NgImageCropperComponent implements OnInit {
  @ViewChild(ImageCropperComponent) cropperCmp?: ImageCropperComponent;

  private readonly alertService = inject(AlertService);
  private readonly imageUtil = inject(ImageUtilService);
  readonly dialogRef = inject<MatDialogRef<NgImageCropperComponent, CropDialogResult>>(MatDialogRef);
  readonly data = inject<CropDialogData>(MAT_DIALOG_DATA);

  readonly aspectRatios = ASPECT_RATIOS;
  readonly outputFormats = OUTPUT_FORMATS;

  // Batch state
  readonly queue = signal<File[]>([]);
  readonly index = signal(0);
  readonly thumbs = signal<string[]>([]);
  readonly currentFile = signal<File | undefined>(undefined);
  readonly originalSize = signal<Size | null>(null);
  private results: CropResult[] = [];
  private currentDataUrl = '';

  // Cropper state (edited through events / ngModel)
  readonly loading = signal(true);
  readonly aspectKey = signal<AspectRatioKey>('free');
  readonly maintainAspectRatio = signal(false);
  readonly aspectRatio = signal(4 / 3);
  roundCropper = false;
  readonly canvasRotation = signal(0);
  readonly transform = signal<ImageTransform>({});
  readonly zoom = signal(1);
  format: OutputFormat = 'png';
  quality = 90;
  resizeToWidth = 0;

  // Output state (emitted by the cropper library)
  readonly croppedImage = signal('');
  readonly croppedWidth = signal(0);
  readonly croppedHeight = signal(0);
  readonly croppedBytes = signal(0);

  readonly total = computed(() => this.queue().length);
  readonly isBatch = computed(() => this.total() > 1);
  readonly isLast = computed(() => this.index() >= this.total() - 1);
  readonly zoomPercent = computed(() => Math.round(this.zoom() * 100));
  readonly currentName = computed(() => this.currentFile()?.name ?? '');
  readonly currentSize = computed(() => this.currentFile()?.size ?? 0);

  get isLossy(): boolean { return this.format !== 'png'; }
  get canSkip(): boolean { return this.data.config.allowSkipCrop; }

  ngOnInit(): void {
    const cfg = this.data.config;
    const files = [...(this.data.files || [])];
    this.queue.set(files);
    this.format = cfg.outputFormat;
    this.quality = cfg.outputQuality;
    this.resizeToWidth = cfg.resizeToWidth;
    this.setAspect(cfg.defaultAspectRatio);
    this.thumbs.set(files.map(() => ''));
    files.forEach((file, i) =>
      this.imageUtil.fileToDataUrl(file).then(url =>
        this.thumbs.update(list => list.map((t, j) => (j === i ? url : t)))
      )
    );
    this.loadCurrent();
  }

  // ---------- batch navigation ----------

  private loadCurrent(): void {
    const file = this.queue()[this.index()];
    this.currentFile.set(file);
    this.loading.set(true);
    this.croppedImage.set('');
    this.originalSize.set(null);
    this.resetAdjustments();
    if (!file) { return; }
    this.imageUtil.fileToDataUrl(file).then(url => {
      this.currentDataUrl = url;
      return this.imageUtil.getImageDimensions(url);
    }).then(dim => this.originalSize.set(dim))
      .catch(() => this.loadImageFailed());
  }

  private advance(result: CropResult | null): void {
    if (result) { this.results.push(result); }
    if (this.isLast()) {
      this.dialogRef.close({ event: 'done', results: this.results });
      return;
    }
    this.index.update(i => i + 1);
    this.loadCurrent();
  }

  cropAndNext(): void {
    const file = this.currentFile();
    if (!file) { return; }
    const cropped = this.croppedImage();
    if (!cropped) {
      this.alertService.showWarning('The image is still loading, please wait a moment.');
      return;
    }
    const name = this.imageUtil.replaceExtension(file.name, this.format);
    this.advance({
      originalFile: file,
      file: this.imageUtil.dataUrlToFile(cropped, name),
      dataUrl: cropped,
      width: this.croppedWidth(),
      height: this.croppedHeight(),
      cropped: true
    });
  }

  useOriginal(): void {
    const file = this.currentFile();
    if (!file) { return; }
    const dim = this.originalSize() ?? { width: this.croppedWidth(), height: this.croppedHeight() };
    this.advance({
      originalFile: file,
      file,
      dataUrl: this.currentDataUrl,
      width: dim.width,
      height: dim.height,
      cropped: false
    });
  }

  removeFromBatch(): void {
    if (this.isLast()) {
      this.dialogRef.close({ event: this.results.length ? 'done' : 'cancel', results: this.results });
      return;
    }
    const i = this.index();
    this.queue.update(list => list.filter((_, j) => j !== i));
    this.thumbs.update(list => list.filter((_, j) => j !== i));
    this.loadCurrent();
  }

  cancel(): void {
    this.dialogRef.close({ event: 'cancel', results: [] });
  }

  // ---------- cropper events ----------

  imageCropped(event: ImageCroppedEvent): void {
    const base64 = event.base64 ?? '';
    this.croppedImage.set(base64);
    this.croppedWidth.set(event.width);
    this.croppedHeight.set(event.height);
    this.croppedBytes.set(this.imageUtil.estimateDataUrlBytes(base64));
  }

  cropperReady(): void {
    this.loading.set(false);
  }

  loadImageFailed(): void {
    this.loading.set(false);
    this.alertService.showError(`Unable to load "${this.currentName() || 'image'}".`);
  }

  // ---------- adjustments ----------

  setAspect(key: AspectRatioKey): void {
    const option = this.aspectRatios.find(a => a.key === key) ?? this.aspectRatios[0];
    this.aspectKey.set(option.key);
    if (option.value === null) {
      this.maintainAspectRatio.set(false);
      return;
    }
    const unchanged = this.maintainAspectRatio() && this.aspectRatio() === option.value;
    this.maintainAspectRatio.set(true);
    this.aspectRatio.set(option.value);
    if (unchanged) {
      this.cropperCmp?.resetCropperPosition();
    }
  }

  rotate(direction: number): void {
    this.canvasRotation.update(r => (r + direction + 4) % 4);
  }

  flip(axis: 'h' | 'v'): void {
    this.transform.update(t => axis === 'h' ? { ...t, flipH: !t.flipH } : { ...t, flipV: !t.flipV });
  }

  setZoom(value: number | null): void {
    const zoom = Math.min(3, Math.max(0.5, Number(value) || 1));
    this.zoom.set(zoom);
    this.transform.update(t => ({ ...t, scale: zoom }));
  }

  zoomBy(delta: number): void {
    this.setZoom(Math.round((this.zoom() + delta) * 10) / 10);
  }

  resetAdjustments(): void {
    this.canvasRotation.set(0);
    this.zoom.set(1);
    this.transform.set({});
    this.roundCropper = false;
    this.setAspect(this.data.config.defaultAspectRatio);
  }

  resetCropArea(): void {
    this.cropperCmp?.resetCropperPosition();
  }

  formatBytes(bytes: number): string {
    return this.imageUtil.formatBytes(bytes);
  }
}
