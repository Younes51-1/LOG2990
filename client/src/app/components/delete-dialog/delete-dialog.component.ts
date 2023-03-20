import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
    selector: 'app-delete-modal-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss'],
})
export class DeleteDialogComponent {
    constructor(private dialogRef: MatDialogRef<DeleteDialogComponent>) {}

    emitSupp(supp: boolean) {
        this.dialogRef.close(supp);
    }
}
