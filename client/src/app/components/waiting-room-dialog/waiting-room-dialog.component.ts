import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { GameService } from '@app/services/game/game.service';
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

    // Need all services in constructor
    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        private dialog: MatDialog,
        private router: Router,
        private dialogRef: MatDialogRef<WaitingRoomComponent>,
    ) {}

    ngOnInit() {
        this.rejectedSubscription = this.gameService.rejected$.subscribe((rejected) => {
            this.rejected = rejected;
        });

        this.acceptedSubscription = this.gameService.accepted$.subscribe((accepted) => {
            if (accepted) {
                this.accepted = true;
                this.gameService.startGame();
                this.router.navigate(['/game']);
            }
        });

        this.gameCanceledSubscription = this.gameService.gameCanceled$.subscribe((finished) => {
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
        this.gameService.playerAccepted(player);
    }

    playerRejected(player: string): void {
        this.gameService.playerRejected(player);
    }

    close() {
        this.acceptedSubscription.unsubscribe();
        this.rejectedSubscription.unsubscribe();
        this.gameCanceledSubscription.unsubscribe();
        this.dialogRef.close();
        if (!this.accepted) {
            this.gameService.abortGame();
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate(['/selection']);
            });
        }
    }
}
