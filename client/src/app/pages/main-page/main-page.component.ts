import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly teamName = '204 : NO CONTENT';
    readonly teamMembers: string[] = [
        'Coralie Brodeur',
        ' Imène Clara Ghazi',
        ' Kylian Chaussoy',
        ' Thibault Demagny',
        ' Younes Benabbou',
        ' Dumitru Zlotea',
    ];
    dialogRef: MatDialogRef<CreateJoinGameDialogComponent>;

    constructor(private gameService: GameService, private readonly router: Router, private dialog: MatDialog) {}

    setGameMode(mode: string) {
        this.gameService.setGameMode(mode);
        if (mode === 'classic-mode') {
            this.router.navigate(['/selection']);
        } else {
            this.dialogRef = this.dialog.open(CreateJoinGameDialogComponent);
        }
    }
}
