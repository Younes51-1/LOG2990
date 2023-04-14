import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { GameData, GameHistory } from '@app/interfaces/game';
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
    slides: GameData[];
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
        private router: Router,
        private dialog: MatDialog,
        private configCommunicationService: ConfigHttpService,
    ) {
        this.getSlidesFromServer();
    }

    ngOnInit() {
        this.pageType = this.router.url.split('/')[1] as PageKeys;
        this.initializeImgSource();
        if (this.pageType === PageKeys.Config) {
            this.getPartiesFromServer();
        }
    }

    deleteNotify(name: string): void {
        if (this.pageType === PageKeys.Config) {
            this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { action: 'delete' } });
            if (this.dialogRef) {
                this.dialogRef.afterClosed().subscribe((supp) => {
                    if (supp) {
                        this.removeSlide(name);
                    }
                });
            }
        }
    }

    resetNotify(name: string): void {
        if (this.pageType === PageKeys.Config) {
            this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { action: 'reset' } });
            if (this.dialogRef) {
                this.dialogRef.afterClosed().subscribe((supp) => {
                    if (supp) {
                        this.configCommunicationService.deleteBestTime(name).subscribe();
                        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            this.router.navigate(['/config']);
                        });
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

    deletePartie(): void {
        this.configCommunicationService.deleteHistory().subscribe();
        this.parties = [];
    }

    calculateTime(time: number) {
        const date = new Date(time);
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    resetBestTimes() {
        this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { action: 'resetAll' } });
        if (this.dialogRef) {
            this.dialogRef.afterClosed().subscribe((supp) => {
                if (supp) {
                    this.configCommunicationService.deleteBestTimes().subscribe();
                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/config']);
                    });
                }
            });
        }
    }

    deleteAllGames(): void {
        this.dialogRef = this.dialog.open(DeleteDialogComponent, { disableClose: true, data: { action: 'deleteAll' } });
        if (this.dialogRef) {
            this.dialogRef.afterClosed().subscribe((supp) => {
                if (supp) {
                    this.gameCommunicationService.deleteAllGames().subscribe();
                    this.slides = [];
                }
            });
        }
    }

    private getSlidesFromServer(): void {
        this.gameCommunicationService.getAllGames().subscribe((res) => {
            this.slides = res;
            for (const slide of this.slides) {
                slide.isSelected = false;
            }
        });
    }

    private getPartiesFromServer(): void {
        this.configCommunicationService.getHistory().subscribe((res) => {
            this.parties = res.reverse();
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
