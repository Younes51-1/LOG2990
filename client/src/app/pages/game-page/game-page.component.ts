import { Component } from '@angular/core';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    // @ViewChild('name', { static: false }) name: SidebarComponent;

    gameName = 'testClient';
    player: string;

    // gameName = this.name.gameName;
}
