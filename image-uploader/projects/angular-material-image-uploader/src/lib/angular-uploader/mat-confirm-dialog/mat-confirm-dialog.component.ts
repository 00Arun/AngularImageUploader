import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  /** Plain-text question or notice. Rendered as text, never as HTML. */
  message: string;
  /** Optional item name shown on its own line (for example a file name). */
  name?: string;
  confirmYes?: string;
  confirmNo: string;
}

@Component({
  selector: 'app-mat-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './mat-confirm-dialog.component.html',
  styleUrl: './mat-confirm-dialog.component.scss'
})
export class MatConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
