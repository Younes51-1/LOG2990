import { Component } from '@angular/core';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    game_name = "Spot the differences game";
    game_mode = "Classic mode";
    difficulty = "Easy mode";
    total_number = "10";
    total_left = "3"; // CALL SERVICE DIFFERENCESCOUNT
    player = "Player name";

    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    intervalId = 0;

    ngOnInit() {
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;

        this.intervalId = setInterval(() => {
            this.seconds++;
            if (this.seconds === 60) {
                this.seconds = 0;
                this.minutes++;
            }
            if (this.seconds == 10) { // IF END OF THE GAME
                clearInterval(this.intervalId);
            }
        }, 1000);
    }
}
