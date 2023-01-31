/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component } from '@angular/core';
import { PageKeys } from '@app/components/game-card/game-card-options';

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

    slides = [
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
        { img: '..assetslogo.jpg' },
    ];
    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
    };

    config = PageKeys.Config;

    gameCreationLink = '/config';

    // TODO: Remove after the demo.
    addSlide() {
        this.slides.push({ img: '..assetslogo.jpg' });
    }

    removeSlide() {
        this.slides.length = this.slides.length - 1;
    }
}
