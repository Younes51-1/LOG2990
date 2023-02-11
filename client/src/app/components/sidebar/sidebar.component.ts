import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { UserGame } from '@app/interfaces/user-game';

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
    @Input() userGame: UserGame;
    @Output() endGameParent: EventEmitter<unknown> = new EventEmitter();

    gameMode = 'Classic mode';
    difficulty = 'Easy mode';
    totalNumber: number;

    minutes = 0;
    seconds = 0;

    ngOnChanges() {
        this.totalNumber = this.userGame.gameData.gameForm.nbDifference;
        this.difficulty = this.userGame.gameData.gameForm.difficulte;
        this.minutes = Math.floor(this.timer / Times.MinInSec);
        this.seconds = this.timer % Times.MinInSec;
    }

    endGame() {
        this.endGameParent.emit();
    }
}
