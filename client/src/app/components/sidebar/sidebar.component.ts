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

    ngOnInit() {
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;

        const intervalId = setInterval(() => {
            this.seconds++;
            if (this.seconds === 60) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.seconds === 10) {
                // IF END OF THE GAME
                clearInterval(intervalId);
            }
        }, 1000);
    }
}
