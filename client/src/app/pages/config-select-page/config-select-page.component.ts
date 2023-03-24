import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { GameForm, GameHistory } from '@app/interfaces/game';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
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
    parties: GameHistory[];
    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
        infinite: false,
    };

    private dialogRef: MatDialogRef<DeleteDialogComponent>;

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameCommunicationService: CommunicationHttpService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private configCommunicationService: ConfigHttpService,
    ) {
        this.getSlidesFromServer();
    }

    ngOnInit() {
        this.pageType = this.route.snapshot.data.page;
        this.initializeImgSource();
        if (this.pageType === PageKeys.Config) {
            this.getPartiesFromServer();
        }
    }

    deleteNotify(name: string): void {
        if (this.pageType === PageKeys.Config) {
            this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { deleted: false } });
            if (this.dialogRef) {
                this.dialogRef.afterClosed().subscribe((supp) => {
                    if (supp) {
                        this.removeSlide(name);
                    }
                });
            }
        }
    }

    setSelected(name: string): void {
        for (const slide of this.slides) {
            slide.isSelected = slide.name === name;
        }
    }

    deletePartie(id?: string): void {
        this.configCommunicationService.deleteHistory(id).subscribe();
        if (id) {
            // eslint-disable-next-line no-underscore-dangle
            this.parties = this.parties.filter((partie) => partie._id !== id);
        } else {
            this.parties = [];
        }
    }

    private getSlidesFromServer(): void {
        const component = this;
        this.gameCommunicationService.getAllGames().subscribe((res) => {
            component.slides = res;
            for (const slide of component.slides) {
                slide.isSelected = false;
            }
        });
    }

    private getPartiesFromServer(): void {
        const component = this;
        this.configCommunicationService.getHistory().subscribe((res) => {
            component.parties = res;
        });
    }

    private initializeImgSource(): void {
        if (this.pageType === PageKeys.Config) {
            this.imgSource = './assets/pictures/config.png';
        } else if (this.pageType === PageKeys.Selection) {
            this.imgSource = './assets/pictures/selection.png';
        }
    }

    private removeSlide(name: string) {
        this.gameCommunicationService.deleteGame(name).subscribe();
        this.slides = this.slides.filter((slide) => slide.name !== name);
    }
}
