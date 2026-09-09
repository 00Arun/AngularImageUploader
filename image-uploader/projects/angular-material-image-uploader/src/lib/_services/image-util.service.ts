import { Injectable } from '@angular/core';
import { OUTPUT_FORMATS, OutputFormat } from '../_config/uploader.config';

@Injectable({ providedIn: 'root' })
export class ImageUtilService {
  private counter = 0;

  uid(): string {
    this.counter += 1;
    return `${Date.now().toString(36)}-${this.counter}-${Math.random().toString(36).slice(2, 7)}`;
  }

  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Could not read image dimensions'));
      img.src = dataUrl;
    });
  }

  dataUrlToBlob(dataUrl: string): Blob {
    const [header, data] = dataUrl.split(',');
    const mimeMatch = /data:([^;]+)/.exec(header);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  dataUrlToFile(dataUrl: string, name: string): File {
    const blob = this.dataUrlToBlob(dataUrl);
    return new File([blob], name, { type: blob.type, lastModified: Date.now() });
  }

  /** Approximate decoded byte size of a base64 data URL without decoding it. */
  estimateDataUrlBytes(dataUrl: string): number {
    if (!dataUrl) { return 0; }
    const data = dataUrl.substring(dataUrl.indexOf(',') + 1);
    const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
    return Math.round(data.length * 3 / 4) - padding;
  }

  replaceExtension(name: string, format: OutputFormat): string {
    const ext = format === 'jpeg' ? 'jpg' : format;
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.substring(0, dot) : name;
    return `${base}.${ext}`;
  }

  mimeForFormat(format: OutputFormat): string {
    const found = OUTPUT_FORMATS.find(f => f.value === format);
    return found ? found.mime : 'image/png';
  }

  formatBytes(bytes: number): string {
    if (!bytes) { return '0 B'; }
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  }

  download(file: Blob, name: string): void {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
