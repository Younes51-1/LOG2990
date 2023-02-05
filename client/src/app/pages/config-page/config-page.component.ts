import { Component } from '@angular/core';
import { PageKeys } from '@app/components/game-card/game-card-options';
import { GameForm } from '@app/interfaces/game-form';
import { CommunicationService } from '@app/services/communication.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const MATERIAL_PREBUILT_THEMES = [
    {
        value: 'indigo-pink-theme',
        label: 'Indigo & Pink',
    },
    {
        value: 'deeppurple-amber-theme',
        label: 'Deep Purple & Amber',
    },
    {
        value: 'pink-bluegrey-theme',
        label: 'Pink & Blue-grey',
    },
    {
        value: 'purple-green-theme',
        label: 'Purple & Green',
    },
];

export const MATERIAL_DEFAULT_PREBUILT_THEME = MATERIAL_PREBUILT_THEMES[0];

@Component({
    selector: 'app-config-page',
    templateUrl: './config-page.component.html',
    styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent {
    readonly themes = MATERIAL_PREBUILT_THEMES;

    favoriteTheme: string = MATERIAL_DEFAULT_PREBUILT_THEME.value;

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

    removeSlide(name: string) {
        this.slides = this.slides.filter((slide) => slide.name !== name);
    }

    deleteNotify(name: string): void {
        this.removeSlide(name);
    }

    getSlidesFromServer(): void {
        const component = this;
        this.communicationService.getAllGames().subscribe((res) => {
            component.slides = res;
        });
    }
}
