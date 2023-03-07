import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameForm } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { PageKeys } from 'src/assets/variables/game-card-options';

@Component({
    selector: 'app-config-select-page',
    templateUrl: './config-select-page.component.html',
    styleUrls: ['./config-select-page.component.scss'],
})
export class ConfigSelectPageComponent implements OnInit {
    pageType: PageKeys;
    imgSource: string;
    slides: GameForm[];

    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
        infinite: false,
    };

    constructor(private readonly communicationService: CommunicationService, private route: ActivatedRoute) {
        this.getSlidesFromServer();
    }

    ngOnInit() {
        this.pageType = this.route.snapshot.data.page;
        this.initializeImgSource();
    }

    removeSlide(name: string) {
        this.communicationService.deleteGame(name).subscribe();
        this.slides = this.slides.filter((slide) => slide.name !== name);
    }

    deleteNotify(name: string): void {
        if (this.pageType === PageKeys.Config) {
            this.removeSlide(name);
        }
    }

    getSlidesFromServer(): void {
        const component = this;
        this.communicationService.getAllGames().subscribe((res) => {
            component.slides = res;
        });
    }

    initializeImgSource(): void {
        if (this.pageType === PageKeys.Config) {
            this.imgSource = './assets/pictures/config.png';
        } else if (this.pageType === PageKeys.Selection) {
            this.imgSource = './assets/pictures/selection.png';
        }
    }
}
