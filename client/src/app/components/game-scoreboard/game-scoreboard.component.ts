import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
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

    @Output() sendDifferencesFound = new EventEmitter<number>();
    @Output() sendOpponentDifferencesFound = new EventEmitter<number>();

    gameMode: string = 'mode classique';
    difficulty: string;
    totalNumber: number;
    lastDifferencesFound: number = 0;
    lastOpponentDifferencesFound: number = 0;

    minutes = 0;
    seconds = 0;

    ngOnChanges() {
        if (this.gameRoom) {
            this.totalNumber = this.gameRoom.userGame.gameData.gameForm.nbDifference;
            this.difficulty = this.gameRoom.userGame.gameData.gameForm.difficulty;
            this.minutes = Math.floor(this.timer / Time.Sixty);
            this.seconds = this.timer % Time.Sixty;
        }
        if (this.lastDifferencesFound !== this.differencesFound) {
            this.lastDifferencesFound = this.differencesFound;
            this.sendDifferencesFound.emit(this.differencesFound);
        }
        if (this.lastOpponentDifferencesFound !== this.opponentDifferencesFound) {
            this.lastOpponentDifferencesFound = this.opponentDifferencesFound;
            this.sendOpponentDifferencesFound.emit(this.opponentDifferencesFound);
        }
    }
}
