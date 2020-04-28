import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatConfirmDialogComponent } from '../angular-uploader/mat-confirm-dialog/mat-confirm-dialog.component';



@Injectable({
	providedIn: 'root'
})
export class DialogService {
	constructor(private dialog: MatDialog) { }
	openConfirmDialog(msg) {
		return this.dialog.open(MatConfirmDialogComponent, {
			width: '390px',
			panelClass: 'confirm-dialog-container',
			disableClose: true,
			position: { top: "10px" },
			data: {
				message: msg,
				ConfirmYes: 'Yes',
				ConfirmNo: 'No'
			}
		});
	}

	popup(msg) {
		return this.dialog.open(MatConfirmDialogComponent, {
			width: '390px',
			panelClass: 'confirm-dialog-container',
			disableClose: true,
			position: { top: "10px" },
			data: {
				message: msg,
				ConfirmNo: 'Ok'
			}
		});
	}
}
