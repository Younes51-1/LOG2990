import { Component, Input, OnChanges } from '@angular/core';
import { UserGame } from '@app/interfaces/game';

@Component({
    selector: 'app-opponent-sidebar',
    templateUrl: './opponent-sidebar.component.html',
    styleUrls: ['./opponent-sidebar.component.scss'],
})
export class OpponentSidebarComponent implements OnChanges {
    @Input() opponentDifferencesFound: number;
    @Input() userGame: UserGame;
    totalNumber: number;

    ngOnChanges() {
        if (this.userGame) {
            this.totalNumber = this.userGame.gameData.gameForm.nbDifference;
        }
    }
}
