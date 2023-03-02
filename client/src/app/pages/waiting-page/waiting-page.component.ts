import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

@Component({
    selector: 'app-waiting-page',
    templateUrl: './waiting-page.component.html',
    styleUrls: ['./waiting-page.component.scss'],
})
export class WaitingPageComponent implements OnInit, OnDestroy {
    rejected = false;
    accepted = false;
    gameCanceled = false;
    constructor(public classicModeService: ClassicModeService, private readonly router: Router) {}

    ngOnInit() {
        this.classicModeService.rejected$.subscribe((rejected) => {
            this.rejected = rejected;
        });
        this.classicModeService.accepted$.subscribe((accepted) => {
            this.accepted = accepted;
        });
        this.classicModeService.gameCanceled$.subscribe((finished) => {
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
        this.classicModeService.abortGame();
    }
}
