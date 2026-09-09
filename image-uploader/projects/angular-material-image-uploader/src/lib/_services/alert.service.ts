import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private toastr = inject(ToastrService);

  showSuccess(message: string, title = ''): void { this.toastr.success(message, title); }
  showError(message: string, title = ''): void { this.toastr.error(message, title); }
  showInfo(message: string, title = ''): void { this.toastr.info(message, title); }
  showWarning(message: string, title = ''): void { this.toastr.warning(message, title); }
}
