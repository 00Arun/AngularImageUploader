export type AspectRatioKey = 'free' | '1:1' | '4:3' | '3:2' | '16:9' | '9:16';
export type OutputFormat = 'png' | 'jpeg' | 'webp';

export interface AspectRatioOption {
  key: AspectRatioKey;
  label: string;
  value: number | null; // null = free-form
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { key: 'free', label: 'Free', value: null },
  { key: '1:1', label: '1:1', value: 1 },
  { key: '4:3', label: '4:3', value: 4 / 3 },
  { key: '3:2', label: '3:2', value: 3 / 2 },
  { key: '16:9', label: '16:9', value: 16 / 9 },
  { key: '9:16', label: '9:16', value: 9 / 16 }
];

export const OUTPUT_FORMATS: { value: OutputFormat; label: string; mime: string; lossy: boolean }[] = [
  { value: 'png', label: 'PNG (lossless)', mime: 'image/png', lossy: false },
  { value: 'jpeg', label: 'JPEG', mime: 'image/jpeg', lossy: true },
  { value: 'webp', label: 'WebP', mime: 'image/webp', lossy: true }
];

/**
 * Everything the uploader can be tuned with. Pass a partial object to
 * <app-image-uploader [config]="..."> or edit DEFAULT_UPLOADER_CONFIG below.
 */
export interface UploaderConfig {
  /** Allow picking / dropping / pasting several images at once. */
  multiple: boolean;
  /** Upper bound on items in the list (only enforced when `multiple` is true). */
  maxFiles: number;
  /** Per-file size limit in megabytes. */
  maxFileSizeMB: number;
  /** Accepted image subtypes (the part after "image/"). */
  allowedTypes: string[];
  /** Open the cropper for every picked image before it is added to the list. */
  cropBeforeAdd: boolean;
  /** Show a "Use original" button in the cropper so a file can skip cropping. */
  allowSkipCrop: boolean;
  /** Aspect ratio the cropper starts with. */
  defaultAspectRatio: AspectRatioKey;
  /** Format the cropped file is exported in. */
  outputFormat: OutputFormat;
  /** Quality (1-100) for lossy output formats. */
  outputQuality: number;
  /** Downscale cropped output to this width in px. 0 keeps the original scale. */
  resizeToWidth: number;
  /** Start uploading as soon as an image is added. */
  autoUpload: boolean;
  /** Allow drag-and-drop reordering of the list. */
  allowReorder: boolean;
  /** Accept images pasted from the clipboard (Ctrl/Cmd+V anywhere on the page). */
  allowPaste: boolean;
  /**
   * Multipart upload endpoint. The file is POSTed as form-data (fields: file, originalName, cropped)
   * with real progress events. Leave empty to simulate uploads in the UI.
   */
  uploadUrl: string;
}

export const DEFAULT_UPLOADER_CONFIG: UploaderConfig = {
  multiple: true,
  maxFiles: 10,
  maxFileSizeMB: 5,
  allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
  cropBeforeAdd: true,
  allowSkipCrop: true,
  defaultAspectRatio: 'free',
  outputFormat: 'png',
  outputQuality: 90,
  resizeToWidth: 0,
  autoUpload: false,
  allowReorder: true,
  allowPaste: true,
  uploadUrl: ''
};
