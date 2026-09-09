import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  message: string;
  confirmYes?: string;
  confirmNo: string;
}

@Component({
  selector: 'app-mat-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './mat-confirm-dialog.component.html',
  styleUrl: './mat-confirm-dialog.component.scss'
})
export class MatConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
