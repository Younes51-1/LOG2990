import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameData } from '@app/interfaces/game-data';
import { Timer } from '@app/interfaces/timer';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, AfterViewInit {
    // gameName = 'title of the game';
    gameName = 'testset';
    gameData: GameData;
    timer: Timer;
    player: string = 'player1';

    constructor(private communicationService: CommunicationService, private classicModeService: ClassicModeService) {}

    ngOnInit() {
        this.communicationService.getGame(this.gameName).subscribe((res) => {
            if (Object.keys(res).length !== 0) {
                this.gameData = res;
            } else {
                alert('Jeu introuvable');
            }
        });
    }
    ngAfterViewInit() {
        // this.classicModeService.initClassicMode(this.gameData, this.player);
        this.classicModeService.initClassicMode(this.gameData);
        this.timer = this.classicModeService.userGame.timer;
    }
}
