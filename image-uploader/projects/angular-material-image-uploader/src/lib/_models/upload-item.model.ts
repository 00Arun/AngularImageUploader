export type UploadStatus = 'ready' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  /** The file exactly as the user picked it (kept so the image can be re-cropped). */
  originalFile: File;
  /** The file that will be uploaded: cropped output, or the original if cropping was skipped. */
  file: File;
  /** Data URL used for thumbnails and previews. */
  previewUrl: string;
  cropped: boolean;
  status: UploadStatus;
  progress: number;
  error?: string;
  addedAt: Date;
}

/** What the cropper dialog returns for each image in a batch. */
export interface CropResult {
  originalFile: File;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  cropped: boolean;
}
