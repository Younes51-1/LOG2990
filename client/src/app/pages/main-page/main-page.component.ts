import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly teamName = '204 : NO CONTENT';
    readonly teamMembers: string[] = [
        'Coralie Brodeur',
        ' Imène Clara Ghazi',
        ' Kylian Chaussoy',
        ' Thibault Demagny',
        ' Younes Benabbou',
        ' Dumitru Zlotea',
    ];

    constructor(private gameService: GameService, private readonly router: Router) {}

    setGameMode(mode: string) {
        this.gameService.setGameMode(mode);
        this.router.navigate(['/selection']);
    }
}
