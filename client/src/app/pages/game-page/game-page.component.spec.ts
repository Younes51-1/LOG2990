/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbar } from '@angular/material/toolbar';
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GameData, UserGame } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { of } from 'rxjs';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import SpyObj = jasmine.SpyObj;

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('GamePageComponent', () => {
    const differenceMatrix: number[][] = [[]];
    const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
    const gameData: GameData = { gameForm, differenceMatrix };
    const userGame: UserGame = { username: '', gameData, nbDifferenceFound: 0, timer: 0 };

    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let classicModeServiceSpy: ClassicModeService;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGame']);
        communicationServiceSpy.getGame.and.returnValue(of(gameData));
        classicModeServiceSpy = jasmine.createSpyObj('ClassicModeService', ['timer$', 'differencesFound$', 'gameFinished$', 'userGame$']);
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, MatToolbar, EndgameDialogComponent],
            imports: [DynamicTestModule],
            providers: [ClassicModeService],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component.userGame = userGame;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain a sidebar', () => {
        fixture.detectChanges();
        const sidebar = fixture.debugElement.nativeElement.querySelector('app-sidebar');
        expect(sidebar).not.toBeNull();
    });

    it('should subscribe to timer$ observable', () => {
        const testingValue = 5;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyTimer = spyOn(classicModeServiceSpy.timer$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.timer$.next(testingValue);
        expect(spyTimer).toHaveBeenCalled();
        expect(component.timer).toEqual(testingValue);
    });

    it('should subscribe to differencesFound$ observable', () => {
        const testingValue = 5;
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyDifferencesFound = spyOn(classicModeServiceSpy.differencesFound$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.differencesFound$.next(testingValue);
        expect(spyDifferencesFound).toHaveBeenCalled();
        expect(component.differencesFound).toEqual(testingValue);
    });

    it('should subscribe to gameFinished$ observable', fakeAsync(() => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyGameFinished = spyOn(classicModeServiceSpy.gameFinished$, 'subscribe').and.callThrough();
        const endGameSpy = spyOn(component, 'endGame');
        component.ngOnInit();
        classicModeServiceSpy.gameFinished$.next(true);
        expect(spyGameFinished).toHaveBeenCalled();
        tick();
        fixture.detectChanges();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should subscribe to userGame$ observable', () => {
        classicModeServiceSpy = TestBed.inject(ClassicModeService);
        const spyUserGame = spyOn(classicModeServiceSpy.userGame$, 'subscribe').and.callThrough();
        component.ngOnInit();
        classicModeServiceSpy.userGame$.next(userGame);
        expect(spyUserGame).toHaveBeenCalled();
        expect(component.userGame).toEqual(userGame);
        expect(component.gameName).toEqual(userGame.gameData.gameForm.name);
        expect(component.player).toEqual(userGame.username);
    });

    it('endGame should call dialog.open', async () => {
        const spy = spyOn(component.dialog, 'open');
        await component.endGame();
        expect(spy).toHaveBeenCalledOnceWith(EndgameDialogComponent, {
            disableClose: true,
        });
    });
});
