import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    gameName = 'Spot the differences game';
    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    totalNumber = '10';
    totalLeft = '3'; // CALL SERVICE DIFFERENCESCOUNT
    player = 'Player name';

    minutes: number;
    seconds: number;
    milliseconds: number;
    intervalId: number;

    ngOnInit() {
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;

        this.intervalId = window.setInterval(() => {
            this.seconds++;
            if (this.seconds === 60) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.minutes === 1 && this.seconds === 1) {
                // IF END OF THE GAME
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.intervalId);
    }
}
