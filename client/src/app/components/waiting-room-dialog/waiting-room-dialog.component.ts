import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-dialog',
    templateUrl: './waiting-room-dialog.component.html',
    styleUrls: ['./waiting-room-dialog.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    rejected = false;
    accepted = false;
    gameCanceled = false;
    private rejectedSubscription: Subscription;
    private acceptedSubscription: Subscription;
    private gameCanceledSubscription: Subscription;
    constructor(public classicModeService: ClassicModeService, private readonly router: Router) {}

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
                alert('Game canceled');
                this.classicModeService.abortGame();
                this.router.navigate(['/selection']);
            }
        });
    }

    playerAccepted(player: string): void {
        this.classicModeService.playerAccepted(player);
    }

    playerRejected(player: string): void {
        this.classicModeService.playerRejected(player);
    }

    ngOnDestroy() {
        this.acceptedSubscription.unsubscribe();
        this.rejectedSubscription.unsubscribe();
        this.gameCanceledSubscription.unsubscribe();
        if (!this.accepted) {
            this.classicModeService.abortGame();
        }
    }
}
