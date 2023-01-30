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
    selector: 'app-selection-page',
    templateUrl: './selection-page.component.html',
    styleUrls: ['./selection-page.component.scss'],
})
export class SelectionPageComponent {
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
    };

    selection = PageKeys.Selection;

    addSlide() {
        this.slides.push({ img: '..assetslogo.jpg' });
    }

    removeSlide() {
        this.slides.length = this.slides.length - 1;
    }
}