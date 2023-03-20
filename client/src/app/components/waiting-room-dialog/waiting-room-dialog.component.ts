import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { Subscription } from 'rxjs';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';

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
        public classicModeService: ClassicModeService,
        private dialog: MatDialog,
        private router: Router,
        private dialogRef: MatDialogRef<WaitingRoomComponent>,
    ) {}

    ngOnInit() {
        this.rejectedSubscription = this.classicModeService.rejected$.subscribe((rejected) => {
            this.rejected = rejected;
        });

        this.acceptedSubscription = this.classicModeService.accepted$.subscribe((accepted) => {
            if (accepted) {
                this.accepted = true;
                this.classicModeService.startGame();
                this.router.navigate(['/game']);
            }
        });

        this.gameCanceledSubscription = this.classicModeService.gameCanceled$.subscribe((finished) => {
            if (!this.gameCanceled && finished) {
                this.gameCanceled = true;
                const dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { deleted: true } });
                dialogRef.afterClosed().subscribe(() => {
                    this.close();
                });
            }
        });
    }

    playerAccepted(player: string): void {
        this.classicModeService.playerAccepted(player);
    }

    playerRejected(player: string): void {
        this.classicModeService.playerRejected(player);
    }

    close() {
        this.acceptedSubscription.unsubscribe();
        this.rejectedSubscription.unsubscribe();
        this.gameCanceledSubscription.unsubscribe();
        this.dialogRef.close();
        if (!this.accepted) {
            this.classicModeService.abortGame();
            window.location.reload();
        }
    }
}
