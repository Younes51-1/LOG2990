import { Component, Input, OnInit } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-fake-score-board',
    templateUrl: './replay-score-board.component.html',
    styleUrls: ['./replay-score-board.component.scss'],
})
export class ReplayScoreBoardComponent implements OnInit {
    @Input() gameRoom: GameRoom;
    @Input() gameName: string;
    @Input() opponentUsername: string;
    @Input() username: string;
    @Input() time: number;

    gameMode: string = 'mode classique';
    difficulty: string;
    nbDiff: number;
    differencesFound = 0;
    opponentDifferencesFound = 0;

    ngOnInit(): void {
        if (this.gameRoom) {
            this.nbDiff = this.gameRoom.userGame.gameData.gameForm.nbDifference;
            this.difficulty = this.gameRoom.userGame.gameData.gameForm.difficulty;
        }
    }

    getMinutes() {
        return Math.floor(this.time / Time.Sixty);
    }

    getSeconds() {
        return this.time % Time.Sixty;
    }
}
