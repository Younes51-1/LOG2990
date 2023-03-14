import { Location } from '@angular/common';
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { DeleteDialogComponent } from '@app/components/delete-dialog/delete-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { of } from 'rxjs';
import { PageKeys } from 'src/assets/variables/game-card-options';
import { ConfigSelectPageComponent } from './config-select-page.component';
import SpyObj = jasmine.SpyObj;

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('ConfigSelectPageComponent', () => {
    let component: ConfigSelectPageComponent;
    let fixture: ComponentFixture<ConfigSelectPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let dialog: MatDialog;
    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getAllGames', 'deleteGame']);
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    name: 'Find the Differences 1',
                    nbDifference: 10,
                    image1url: 'https://example.com/image1.jpg',
                    image2url: 'https://example.com/image2.jpg',
                    difficulte: 'easy',
                    soloBestTimes: [
                        { name: 'player1', time: 200 },
                        { name: 'player2', time: 150 },
                    ],
                    vsBestTimes: [{ name: 'player1', time: 200 }],
                },
                {
                    name: 'Find the Differences 2',
                    nbDifference: 15,
                    image1url: 'https://example.com/image3.jpg',
                    image2url: 'https://example.com/image4.jpg',
                    difficulte: 'medium',
                    soloBestTimes: [
                        { name: 'player3', time: 300 },
                        { name: 'player4', time: 250 },
                    ],
                    vsBestTimes: [{ name: 'player3', time: 200 }],
                },
            ]),
        );
        communicationServiceSpy.deleteGame.and.returnValue(of(new HttpResponse({ status: 200 }) as HttpResponse<string>));
        dialog = jasmine.createSpyObj('MatDialog', ['open']);
        TestBed.configureTestingModule({
            declarations: [ConfigSelectPageComponent, ConfigParamsComponent],
            imports: [DynamicTestModule, RouterTestingModule, AppRoutingModule],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: MatDialog, useValue: dialog },
            ],
        }).compileComponents();
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
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        router.initialNavigation();
        router.navigate(['/config']);
        tick();
        expect(location.path()).toEqual('/config');
    }));

    it('should instantiate the component when navigating to /config', fakeAsync(() => {
        const router = TestBed.inject(Router);
        router.navigate(['/config']);
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
        component.pageType = PageKeys.Config;
        fixture.detectChanges();
        const router = TestBed.inject(Router);
        const creationBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        creationBtn.click();
        tick();
        expect(router.url).toEqual('/creation');
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
        component.initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/config.png');
    });

    it('should correctly initialize image if pageType is selection', () => {
        component.pageType = PageKeys.Selection;
        fixture.detectChanges();
        component.initializeImgSource();
        expect(component.imgSource).toEqual('./assets/pictures/selection.png');
    });

    it('deleteNotify should call removeSlide if PageKeys is set to Config and user responded yes', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        (dialog.open as jasmine.Spy).and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        spyOn(component, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Config;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(component.removeSlide).toHaveBeenCalledWith('Find the Differences 1');
    });

    it("deleteNotify shouldn't call removeSlide if PageKeys is set to Config and user responded no", () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        (dialog.open as jasmine.Spy).and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        spyOn(component, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Config;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
        expect(component.removeSlide).not.toHaveBeenCalledWith('Find the Differences 1');
    });

    it("deleteNotify shouldn't call removeSlide if PageKeys isn't set to Config", () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        (dialog.open as jasmine.Spy).and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of(false));
        spyOn(component, 'removeSlide').and.callFake(() => {
            return;
        });
        component.pageType = PageKeys.Selection;
        component.deleteNotify('Find the Differences 1');
        expect(dialog.open).not.toHaveBeenCalledWith(DeleteDialogComponent, { disableClose: true });
        expect(dialogRefSpy.afterClosed).not.toHaveBeenCalled();
        expect(component.removeSlide).not.toHaveBeenCalledWith('Find the Differences 1');
    });

    it('removeSlide should remove the slide from the carousel and call deleteGame', () => {
        component.pageType = PageKeys.Config;
        component.removeSlide('Find the Differences 1');
        expect(component.slides.length).toEqual(1);
        expect(communicationServiceSpy.deleteGame).toHaveBeenCalled();
    });
});
