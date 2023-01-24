import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

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
    selector: 'app-material-page',
    templateUrl: './material-page.component.html',
    styleUrls: ['./material-page.component.scss'],
})
export class MaterialPageComponent {
    @ViewChild('merciDialogContent')
    private readonly merciDialogContentRef: TemplateRef<HTMLElement>;

    readonly themes = MATERIAL_PREBUILT_THEMES;

    favoriteTheme: string = MATERIAL_DEFAULT_PREBUILT_THEME.value;

    slides = [{ img: '..assetslogo.jpg' }, { img: '..assetslogo.jpg' }, { img: '..assetslogo.jpg' }, { img: '..assetslogo.jpg' }];
    slideConfig = { slidesToShow: 4, slidesToScroll: 4 };

    constructor(private readonly matDialog: MatDialog) {}

    onLikeTheme(): void {
        this.matDialog.open(this.merciDialogContentRef);
    }

    addSlide() {
        this.slides.push({ img: '..assetslogo.jpg' });
    }

    removeSlide() {
        this.slides.length = this.slides.length - 1;
    }

    slickInit(e: unknown) {
        console.log(e, 'slick initialized');
    }

    breakpoint(e: unknown) {
        console.log(e, 'breakpoint');
    }

    afterChange(e: unknown) {
        console.log(e, 'afterChange');
    }

    beforeChange(e: unknown) {
        console.log(e, 'beforeChange');
    }
}
