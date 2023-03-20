import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { GameForm } from '@app/interfaces/game';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
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

    private dialogRef: MatDialogRef<DeleteDialogComponent>;

    constructor(private readonly communicationService: CommunicationHttpService, private route: ActivatedRoute, private dialog: MatDialog) {
        this.getSlidesFromServer();
    }

    ngOnInit() {
        this.pageType = this.route.snapshot.data.page;
        this.initializeImgSource();
    }

    deleteNotify(name: string): void {
        if (this.pageType === PageKeys.Config) {
            this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true });
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
            slide.isSelected = slide.name === name ? true : false;
        }
    }

    private getSlidesFromServer(): void {
        const component = this;
        this.communicationService.getAllGames().subscribe((res) => {
            component.slides = res;
            for (const slide of component.slides) {
                slide.isSelected = false;
            }
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
        this.communicationService.deleteGame(name).subscribe();
        this.slides = this.slides.filter((slide) => slide.name !== name);
    }
}
