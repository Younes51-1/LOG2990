import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-dialog',
    templateUrl: './waiting-room-dialog.component.html',
    styleUrls: ['./waiting-room-dialog.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    rejected = false;
    accepted = false;
    gameCanceled = false;
    private rejectedSubscription: Subscription;
    private acceptedSubscription: Subscription;
    private gameCanceledSubscription: Subscription;

    constructor(public waitingRoomService: WaitingRoomService, private dialog: MatDialog, private dialogRef: MatDialogRef<WaitingRoomComponent>) {}

    ngOnInit() {
        this.waitingRoomService.gameMode = 'classic-mode';
        this.rejectedSubscription = this.waitingRoomService.rejected$.subscribe((rejected) => {
            this.rejected = rejected;
        });

        this.acceptedSubscription = this.waitingRoomService.accepted$.subscribe((accepted) => {
            if (accepted) {
                this.accepted = true;
                this.waitingRoomService.startGame();
            }
        });

        this.gameCanceledSubscription = this.waitingRoomService.gameCanceled$.subscribe((finished) => {
            if (!this.gameCanceled && finished) {
                this.gameCanceled = true;
                const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { action: 'deleted' } });
                if (dialogRef) {
                    dialogRef.afterClosed().subscribe(() => {
                        this.close();
                    });
                }
            }
        });
    }

    playerAccepted(player: string): void {
        this.waitingRoomService.playerAccepted(player);
    }

    playerRejected(player: string): void {
        this.waitingRoomService.playerRejected(player);
    }

    close() {
        this.acceptedSubscription.unsubscribe();
        this.rejectedSubscription.unsubscribe();
        this.gameCanceledSubscription.unsubscribe();
        this.dialogRef.close();
        if (!this.accepted) {
            this.waitingRoomService.abortGame();
        }
    }
}
