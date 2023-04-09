import { Component, OnInit } from '@angular/core';
import { GameFinderService } from '@app/services/game-finder/game-finder.service';
import { GameSetupService } from '@app/services/game-setup/game-setup.service';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';

@Component({
    selector: 'app-create-join-game-dialog',
    templateUrl: './create-join-game-dialog.component.html',
    styleUrls: ['./create-join-game-dialog.component.scss'],
})
export class CreateJoinGameDialogComponent implements OnInit {
    applyBorder = false;
    showInput1 = false;
    showInput2 = false;
    inputValue1: string;
    inputValue2: string;
    gameExists = false;
    soloBestTime: { name: string; time: string }[];
    vsBestTime: { name: string; time: string }[];

    // eslint-disable-next-line max-params
    constructor(
        private gameFinderService: GameFinderService,
        private dialog: MatDialog,
        private verifyService: VerifyInputService,
        private gameSetupService: GameSetupService,
        private dialogRef: MatDialogRef<CreateJoinGameDialogComponent>,
    ) {}

    ngOnInit() {
        this.gameFinderService.gameMode = 'limited-time-mode';
        this.gameSetupService.gameMode = 'limited-time-mode';
        this.gameFinderService.gameExists$.subscribe((gameExists) => {
            this.gameExists = gameExists;
        });
    }

    focusInput() {
        setTimeout(() => {
            const input = document.querySelector('input');
            if (input) {
                input.focus();
            }
        }, 0);
    }

    checkGame() {
        if (!this.gameExists) {
            this.gameFinderService.checkGame();
        }
    }

    verifySoloInput() {
        if (!this.verifyService.verify(this.inputValue1) || this.gameSetupService.getSlides().length === 0) {
            this.applyBorder = true;
        } else {
            this.startSoloGame();
        }
    }

    verifyMultiInput() {
        if (!this.verifyService.verify(this.inputValue2) || this.gameSetupService.getSlides().length === 0) {
            this.applyBorder = true;
        } else {
            this.applyBorder = false;
            this.gameFinderService.connectSocket();
            this.createJoinMultiGame();
        }
    }

    joinGame() {
        this.gameSetupService.joinGame(this.inputValue2);
        this.dialogRef.close();
        this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    private startSoloGame() {
        this.gameSetupService.initGameRoom(this.inputValue1, true);
        this.gameSetupService.initGameMode();
    }

    private createJoinMultiGame() {
        if (this.gameExists) {
            this.canJoinGame();
        } else {
            this.createGame();
        }
    }

    private createGame() {
        this.gameSetupService.initGameRoom(this.inputValue2, false);
        this.gameSetupService.initGameMode();
        this.dialogRef.close();
        this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    private canJoinGame() {
        this.gameFinderService.canJoinGame(this.inputValue2, this);
    }
}
