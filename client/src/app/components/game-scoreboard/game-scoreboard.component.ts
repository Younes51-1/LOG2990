import { Component, Input, OnChanges } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-game-scoreboard',
    templateUrl: './game-scoreboard.component.html',
    styleUrls: ['./game-scoreboard.component.scss'],
})
export class GameScoreboardComponent implements OnChanges {
    @Input() gameName: string;
    @Input() timer: number;
    @Input() differencesFound: number;
    @Input() opponentDifferencesFound: number;
    @Input() username: string;
    @Input() opponentUsername: string;
    @Input() gameRoom: GameRoom;
    @Input() penaltyTime: number;

    gameMode: string = 'mode classique';
    difficulty: string;
    totalNumber: number;

    minutes = 0;
    seconds = 0;

    ngOnChanges() {
        if (this.gameRoom) {
            this.totalNumber = this.gameRoom.userGame.gameData.gameForm.nbDifference;
            this.difficulty = this.gameRoom.userGame.gameData.gameForm.difficulty;
            this.minutes = Math.floor(this.timer / Time.MinInSec);
            this.seconds = this.timer % Time.MinInSec;
        }
    }
}
