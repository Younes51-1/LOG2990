import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnDestroy {
    readonly teamMembers: string[] = [
        'Coralie Brodeur',
        ' Imène Clara Ghazi',
        ' Kylian Chaussoy',
        ' Thibault Demagny',
        ' Younes Benabbou',
        ' Dumitru Zlotea',
    ];
    dialogRef: MatDialogRef<CreateJoinGameDialogComponent>;

    constructor(private readonly router: Router, private dialog: MatDialog) {}

    setGameMode(mode: string) {
        if (mode === 'mode classique') {
            this.router.navigate(['/selection']);
        } else {
            this.dialogRef = this.dialog.open(CreateJoinGameDialogComponent);
        }
    }

    ngOnDestroy() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
