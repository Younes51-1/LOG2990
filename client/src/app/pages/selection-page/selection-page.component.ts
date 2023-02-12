import { Component } from '@angular/core';
import { PageKeys } from '@app/components/game-card/game-card-options';
import { GameForm } from '@app/interfaces/game-form';
import { CommunicationService } from '@app/services/communication.service';

@Component({
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
    selection = PageKeys.Selection;

    slides: GameForm[];
    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
    };

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
