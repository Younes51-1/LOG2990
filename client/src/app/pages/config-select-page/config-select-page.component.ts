import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
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
    dialogRef: MatDialogRef<DeleteDialogComponent>;

    slideConfig = {
        slidesToShow: 4,
        slidesToScroll: 4,
        lazyLoad: 'ondemand',
        cssEase: 'linear',
        dots: true,
        appendArrows: 'ngx-slick-carousel',
        infinite: false,
    };

    constructor(private readonly communicationService: CommunicationService, private route: ActivatedRoute, public dialog: MatDialog) {
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
