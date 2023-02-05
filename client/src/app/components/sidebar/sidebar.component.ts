import { Component, OnInit } from '@angular/core';

enum Times {
    MinInSec = 60,
    SecInMil = 1000,
    TenSec = 10,
}
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    totalNumber = '10';
    totalLeft = '3'; // CALL SERVICE DIFFERENCESCOUNT

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
            if (this.seconds === Times.MinInSec) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.minutes === 1 && this.seconds === 1) {
                // IF END OF THE GAME
                clearInterval(this.intervalId);
            }
        }, Times.SecInMil);
    }

    stopTimer() {
        clearInterval(this.intervalId);
    }
}
