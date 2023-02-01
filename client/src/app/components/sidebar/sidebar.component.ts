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
    gameName = 'Spot the differences game';
    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    totalNumber = '10';
    totalLeft = '3'; // CALL SERVICE DIFFERENCESCOUNT
    player = 'Player name';

    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    intervalId = 0;

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
            if (this.seconds === Times.TenSec) {
                // IF END OF THE GAME
                clearInterval(this.intervalId);
            }
        }, Times.SecInMil);
    }
}
