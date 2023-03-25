import { Component, Input, OnInit } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';

@Component({
    selector: 'app-fake-score-board',
    templateUrl: './fake-score-board.component.html',
    styleUrls: ['./fake-score-board.component.scss'],
})
export class FakeScoreBoardComponent implements OnInit {
    @Input() gameRoom: GameRoom;
    @Input() gameName: string;
    @Input() opponentUsername: string;
    @Input() username: string;
    @Input() minutes: number = 0;
    @Input() seconds: number = 0;

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
}
