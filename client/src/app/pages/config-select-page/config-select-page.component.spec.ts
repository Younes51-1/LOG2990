/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
// We need it to access private methods and properties in the test
import { CommonModule, Location } from '@angular/common';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { GameCardComponent } from '@app/components/game-card/game-card.component';
import { GameConstants } from '@app/interfaces/game-constants';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ConfigSelectPageComponent } from '@app/pages/config-select-page/config-select-page.component';
import { CommunicationHttpService } from '@app/services/communication-http/communication-http.service';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';
import { of } from 'rxjs';
import { PageKeys } from 'src/assets/variables/game-card-options';
import SpyObj = jasmine.SpyObj;

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('ConfigSelectPageComponent', () => {
    let component: ConfigSelectPageComponent;
    let fixture: ComponentFixture<ConfigSelectPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationHttpService>;
    let configHttpServiceSpy: SpyObj<ConfigHttpService>;
    let dialog: MatDialog;
    let zone: NgZone;
    let router: Router;
    let dialogRefSpy: SpyObj<MatDialogRef<DeleteDialogComponent>>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'deleteGame', 'deleteAllGames']);
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    name: 'Find the Differences 1',
                    nbDifference: 10,
                    image1url: 'https://example.com/image1.jpg',
                    image2url: 'https://example.com/image2.jpg',
                    difficulty: 'easy',
                    soloBestTimes: [
                        { name: 'player1', time: 200 },
                        { name: 'player2', time: 150 },
                    ],
                    vsBestTimes: [{ name: 'player1', time: 200 }],
                    differenceMatrix: [[]],
                    isSelected: false,
                },
                {
                    name: 'Find the Differences 2',
                    nbDifference: 15,
                    image1url: 'https://example.com/image3.jpg',
                    image2url: 'https://example.com/image4.jpg',
                    difficulty: 'medium',
                    soloBestTimes: [
                        { name: 'player3', time: 300 },
                        { name: 'player4', time: 250 },
                    ],
                    vsBestTimes: [{ name: 'player3', time: 200 }],
                    differenceMatrix: [[]],
                    isSelected: false,
                },
            ]),
        );
        communicationServiceSpy.deleteAllGames.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        communicationServiceSpy.deleteGame.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        configHttpServiceSpy = jasmine.createSpyObj('ConfigHttpService', [
            'getConstants',
            'deleteBestTime',
            'deleteHistory',
            'deleteBestTimes',
            'getHistory',
        ]);
        configHttpServiceSpy.getHistory.and.returnValue(
            of([{ name: 'Find the difference 1', startTime: 100, timer: 200, username1: 'user1', gameMode: 'classic-mode solo', winner: 'user1' }]),
        );
        configHttpServiceSpy.getConstants.and.returnValue(of({ initialTime: 100, penaltyTime: 10, bonusTime: 5 } as GameConstants));
        zone = new NgZone({ enableLongStackTrace: false });
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            imports: [DynamicTestModule, RouterTestingModule, AppRoutingModule, CommonModule, HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [ConfigSelectPageComponent, ConfigParamsComponent, GameCardComponent],
            providers: [
                { provide: CommunicationHttpService, useValue: communicationServiceSpy },
                { provide: ConfigHttpService, useValue: configHttpServiceSpy },
                { provide: MatDialog, useValue: dialog },
            ],
        }).compileComponents();
        router = TestBed.inject(Router);
        spyOnProperty(router, 'url', 'get').and.returnValue('/config');
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        (dialog.open as jasmine.Spy).and.returnValue(dialogRefSpy);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigSelectPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the configuration page when searching for the ./config URL', fakeAsync(() => {
        const location = TestBed.inject(Location);
        zone.run(() => {
            router.initialNavigation();
        });
        zone.run(() => {
            router.navigate(['/config']);
        });
        tick();
        expect(location.path()).toEqual('/config');
    }));

    it('should instantiate the component when navigating to /config', fakeAsync(() => {
        zone.run(() => {
            router.navigate(['/config']);
        });
        tick();
        expect(fixture.componentInstance).toBeTruthy();
    }));

    it('should contain a carousel', () => {
        const carousel = fixture.debugElement.query(By.css('.carousel')).nativeElement;
        expect(carousel).not.toBeUndefined();
    });

    it('should have slides in the carousel', () => {
        expect(component.slides.length).toEqual(2);
    });

    it('should show up to 4 slides at a time', () => {
        const slidesToShow = 4;
        expect(component.slideConfig.slidesToShow).toEqual(slidesToShow);
    });

    it('should contain the names and values of the three game constants', () => {
        component.pageType = PageKeys.Config;
        fixture.detectChanges();
        const params = fixture.debugElement.queryAll((el) => el.name === 'app-config-params');
        expect(params.length).toEqual(1);
    });

    it('should allow to access Game Creation page', () => {
        component.pageType = PageKeys.Config;
        fixture.detectChanges();
        const creationBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        expect(creationBtn.getAttribute('routerLink')).toEqual('/creation');
    });

    it('should show the game creation page on click of the Game Creation button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const creationBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        creationBtn.click();
        tick();
        expect(location.path()).toEqual('/creation');
    }));

    it('should not contain config elements if pageType is selection', () => {
        component.pageType = PageKeys.Selection;
        fixture.detectChanges();
        const configElement = fixture.debugElement.nativeElement.getElementsByClassName('configElement');
        expect(configElement.length).toEqual(0);
    });

    it('should correctly initialize image if pageType is config', () => {
        component.pageType = PageKeys.Config;
        fixture.detectChanges();
        (component as any).initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/config.png');
    });

    it('should correctly initialize image if pageType is selection', () => {
        component.pageType = PageKeys.Selection;
        fixture.detectChanges();
        (component as any).initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/selection.png');
    });

    it('deleteNotify should call removeSlide if PageKeys is set to Config and user responded yes', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        spyOn(component as any, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Config;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'delete' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect((component as any).removeSlide).toHaveBeenCalledWith('Find the Differences 1');
    });

    it("deleteNotify shouldn't call removeSlide if PageKeys is set to Config and user responded no", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        spyOn(component as any, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Config;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'delete' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect((component as any).removeSlide).not.toHaveBeenCalledWith('Find the Differences 1');
    });

    it("deleteNotify shouldn't call removeSlide if PageKeys isn't set to Config", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        spyOn(component as any, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Selection;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).not.toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true });
        expect(dialogRefSpy.afterClosed).not.toHaveBeenCalled();
        expect((component as any).removeSlide).not.toHaveBeenCalledWith('Find the Differences 1');
    });

    it('resetNotify should call deleteBestTime if PageKeys is set to Config and user responded yes', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        configHttpServiceSpy.deleteBestTime.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        component.pageType = PageKeys.Config;
        zone.run(() => {
            component.resetNotify('Find the Differences 1');
        });
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'reset' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(configHttpServiceSpy.deleteBestTime).toHaveBeenCalledWith('Find the Differences 1');
    });

    it("resetNotify shouldn't call deleteBestTime if PageKeys is set to Config and user responded no", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        configHttpServiceSpy.deleteBestTime.and.stub();
        component.pageType = PageKeys.Config;
        component.resetNotify('Find the Differences 1');
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'reset' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(configHttpServiceSpy.deleteBestTime).not.toHaveBeenCalled();
    });

    it("resetNotify shouldn't call deleteBestTime if PageKeys isn't set to Config", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        configHttpServiceSpy.deleteBestTime.and.stub();
        component.pageType = PageKeys.Selection;
        component.resetNotify('Find the Differences 1');
        expect(dialog.open).not.toHaveBeenCalled();
        expect(dialogRefSpy.afterClosed).not.toHaveBeenCalled();
        expect(configHttpServiceSpy.deleteBestTime).not.toHaveBeenCalled();
    });

    it('should set the selected slide', () => {
        const name = 'Find the Differences 1';
        expect(component.slides[0].isSelected).toBeFalse();
        component.setSelected(name);
        expect(component.slides[0].isSelected).toBeTrue();
    });

    it('removeSlide should remove the slide from the carousel and call deleteGame', () => {
        component.pageType = PageKeys.Config;
        (component as any).removeSlide('Find the Differences 1');
        expect(component.slides.length).toEqual(1);
        expect(communicationServiceSpy.deleteGame).toHaveBeenCalled();
    });

    it('initializeImgSource should set the image source to the correct value', () => {
        component.pageType = PageKeys.Config;
        (component as any).initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/config.png');
    });

    it('initializeImgSource should set the image source to the correct value', () => {
        component.pageType = PageKeys.Selection;
        (component as any).initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/selection.png');
    });

    it('getSlidesFromServer should call getAllGames and set the slides', () => {
        component.pageType = PageKeys.Config;
        (component as any).getSlidesFromServer();
        expect(communicationServiceSpy.getAllGames).toHaveBeenCalled();
        expect(component.slides.length).toEqual(2);
    });

    it('should call initializeImgSource on init', () => {
        spyOn(component as any, 'initializeImgSource').and.callFake(() => {
            return;
        });
        component.ngOnInit();
        expect((component as any).initializeImgSource).toHaveBeenCalled();
    });

    it('should call getPartiesFromServer on init only in config page', () => {
        const getPartiesFromServerSpy = spyOn(component as any, 'getPartiesFromServer').and.stub();
        component.ngOnInit();
        expect(getPartiesFromServerSpy).toHaveBeenCalled();
    });

    it('deletePartie should call deleteHistory if user responded yes', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        component.pageType = PageKeys.Config;
        configHttpServiceSpy.deleteHistory.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        component.deletePartie();
        expect(configHttpServiceSpy.deleteHistory).toHaveBeenCalled();
        expect(component.parties.length).toEqual(0);
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'deleteHistory' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
    });

    it("deletePartie shouldn't call deleteHistory if user responded no", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        component.pageType = PageKeys.Config;
        component.deletePartie();
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'deleteHistory' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(component.slides.length).toEqual(2);
    });

    it('calculateTime should return the correct time', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const time = component.calculateTime(204204);
        expect(time).toEqual('03:24');
    });

    it('resetNotify should call deleteBestTime if user responded yes', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        configHttpServiceSpy.deleteBestTimes.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        component.pageType = PageKeys.Config;
        zone.run(() => {
            component.resetBestTimes();
        });
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'resetAll' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(configHttpServiceSpy.deleteBestTimes).toHaveBeenCalled();
    });

    it("resetBestTimes shouldn't call deleteBestTime if user responded no", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        configHttpServiceSpy.deleteBestTimes.and.stub();
        component.pageType = PageKeys.Config;
        component.resetBestTimes();
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'resetAll' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(configHttpServiceSpy.deleteBestTimes).not.toHaveBeenCalled();
    });

    it('deleteAllGames should call deleteAllGames if user responded yes', () => {
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        component.pageType = PageKeys.Config;
        component.deleteAllGames();
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'deleteAll' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(communicationServiceSpy.deleteAllGames).toHaveBeenCalled();
        expect(component.slides.length).toEqual(0);
    });

    it("deleteAllGames shouldn't call deleteAllGames if user responded no", () => {
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        component.pageType = PageKeys.Config;
        component.deleteAllGames();
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true, data: { action: 'deleteAll' } });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(communicationServiceSpy.deleteAllGames).not.toHaveBeenCalled();
        expect(component.slides.length).toEqual(2);
    });

    it('getPartiesFromServer should call getAllGames and set the slides', () => {
        component.pageType = PageKeys.Config;
        (component as any).getPartiesFromServer();
        expect(configHttpServiceSpy.getHistory).toHaveBeenCalled();
        expect(component.parties.length).toEqual(1);
    });
});
