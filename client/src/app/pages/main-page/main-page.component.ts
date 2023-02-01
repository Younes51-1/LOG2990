import { Component } from '@angular/core';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'Jeu des différences';
    readonly teamName: string = '204 : NO CONTENT';
    readonly teamMembers: string[] = [
        'Coralie Brodeur',
        ' Imène Clara Ghazi',
        ' Kylian Chaussoy',
        ' Thibault Demagny',
        ' Younes Benabbou',
        ' Dumitru Zlotea',
    ];

    readonly configLink = '/config';
    readonly classiqueLink = '/selection';
    readonly limitedLink = '/home';
    readonly cheatModeLink = '/home';
}
