import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageKeys } from 'src/assets/variables/game-card-options';
import { GameForm } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communicationService/communication.service';

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

    getSlidesFromServer(): void {
        const component = this;
        this.communicationService.getAllGames().subscribe((res) => {
            component.slides = res;
        });
    }

    initializeImgSource(): void {
        if (this.pageType === PageKeys.Config) {
            this.imgSource = '../../../assets/pictures/config.png';
        } else if (this.pageType === PageKeys.Selection) {
            this.imgSource = '../../../assets/pictures/selection.png';
        }
    }
}
