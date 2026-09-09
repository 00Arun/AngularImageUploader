import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatConfirmDialogComponent, ConfirmDialogData } from '../angular-uploader/mat-confirm-dialog/mat-confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private dialog = inject(MatDialog);

  openConfirmDialog(message: string): MatDialogRef<MatConfirmDialogComponent, boolean> {
    return this.dialog.open<MatConfirmDialogComponent, ConfirmDialogData, boolean>(MatConfirmDialogComponent, {
      width: '390px',
      disableClose: true,
      autoFocus: false,
      data: { message, confirmYes: 'Yes', confirmNo: 'No' }
    });
  }

  popup(message: string): MatDialogRef<MatConfirmDialogComponent, boolean> {
    return this.dialog.open<MatConfirmDialogComponent, ConfirmDialogData, boolean>(MatConfirmDialogComponent, {
      width: '390px',
      disableClose: true,
      autoFocus: false,
      data: { message, confirmNo: 'Ok' }
    });
  }
}
