import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { GameForm } from '@app/interfaces/game-form';
import SpyObj = jasmine.SpyObj;

const gameForm: GameForm[] = [{ name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] }];

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost', 'getAllGames']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));
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

        await TestBed.configureTestingModule({
            declarations: [ConfigPageComponent],
            imports: [DynamicTestModule, RouterTestingModule, AppRoutingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
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
        component.slides = gameForm;
        expect(component.slides.length).toEqual(1);
    });

    it('should show up to 4 slides at a time', () => {
        const slidesToShow = 4;
        expect(component.slideConfig.slidesToShow).toEqual(slidesToShow);
    });

    it('should contain the names and values of the three game constants', () => {
        const params = fixture.debugElement.nativeElement.getElementsByClassName('centered-text')[0];
        expect(params.childElementCount).toEqual(1);
    });

    it('should allow to access Game Creation page', () => {
        const creationBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        expect(creationBtn.getAttribute('routerLink')).toEqual('/creation');
    });

    it('should show the game creation page on click of the Game Creation button', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const creationBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        creationBtn.click();
        tick();
        expect(router.url).toEqual('/creation');
    }));
});
