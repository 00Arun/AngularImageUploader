import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';
import { UploadItem } from '../_models/upload-item.model';

/**
 * Uploads a single item and reports progress as 0-100.
 *
 * When `uploadUrl` is set the file is POSTed as multipart/form-data
 * (field name "file") with real progress events. When it is empty the upload is
 * simulated so the UI can be exercised without a backend.
 */
@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly http = inject(HttpClient);

  upload(item: UploadItem, uploadUrl = ''): Observable<number> {
    return uploadUrl ? this.uploadToServer(uploadUrl, item) : this.simulate(item);
  }

  private uploadToServer(url: string, item: UploadItem): Observable<number> {
    const form = new FormData();
    form.append('file', item.file, item.name);
    form.append('originalName', item.originalFile.name);
    form.append('cropped', String(item.cropped));
    const req = new HttpRequest('POST', url, form, { reportProgress: true });
    return this.http.request(req).pipe(
      filter(event => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          return event.total ? Math.round((100 * event.loaded) / event.total) : 0;
        }
        return 100;
      })
    );
  }

  private simulate(item: UploadItem): Observable<number> {
    // Bigger files "take longer": roughly 1.5s per MB, at least 1.2s.
    const durationMs = Math.max(1200, (item.size / 1024 / 1024) * 1500);
    const tickMs = 80;
    const ticks = Math.ceil(durationMs / tickMs);
    return timer(0, tickMs).pipe(
      map(i => Math.min(100, Math.round((i / ticks) * 100))),
      takeWhile(p => p < 100, true)
    );
  }
}
