import { Component } from '@angular/core';
import { PageKeys } from '@app/components/game-card/game-card-options';
import { GameForm } from '@app/interfaces/game-form';
import { CommunicationService } from '@app/services/communicationService/communication.service';

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
    slides: GameForm[];

    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
    };

    config = PageKeys.Config;
    constructor(private readonly communicationService: CommunicationService) {
        this.getSlidesFromServer();
    }

    getSlidesFromServer(): void {
        const component = this;
        this.communicationService.getAllGames().subscribe((res) => {
            component.slides = res;
        });
    }
}
