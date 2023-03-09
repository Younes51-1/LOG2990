import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';

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
export class SidebarComponent implements OnChanges {
    @Input() gameName: string;
    @Input() timer: number;
    @Input() differencesFound: number;
    @Input() opponentDifferencesFound: number;
    @Input() opponentUsername: string;
    @Input() gameRoom: GameRoom;
    @Output() endGameParent: EventEmitter<unknown> = new EventEmitter();

    gameMode: string = 'classique solo';
    difficulty: string;
    totalNumber: number;

    minutes = 0;
    seconds = 0;

    ngOnChanges() {
        if (this.gameRoom) {
            this.totalNumber = this.gameRoom.userGame.gameData.gameForm.nbDifference;
            this.difficulty = this.gameRoom.userGame.gameData.gameForm.difficulte;
            this.minutes = Math.floor(this.timer / Times.MinInSec);
            this.seconds = this.timer % Times.MinInSec;
        }
    }
}
