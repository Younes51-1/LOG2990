/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GamePageComponent } from './game-page.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GameData } from '@app/interfaces/game-data';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { of, Subject } from 'rxjs';
import { UserGame } from '@app/interfaces/user-game';
import SpyObj = jasmine.SpyObj;
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';

const differenceMatrix: number[][] = [[]];
const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
const gameData: GameData = { gameForm, differenceMatrix };
const userGame: UserGame = { username: '', gameData, nbDifferenceFound: 0, timer: 0 };

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let classicModeService: ClassicModeService;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGame']);
        communicationServiceSpy.getGame.and.returnValue(of(gameData));

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, SidebarComponent, MatToolbar, EndgameDialogComponent],
            imports: [DynamicTestModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component.userGame = userGame;
        fixture.detectChanges();
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['timer$', 'differencesFound$', 'gameFinished$', 'userGame$']);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain a sidebar', () => {
        fixture.detectChanges();
        const sidebar = fixture.debugElement.nativeElement.querySelector('app-sidebar');
        expect(sidebar).not.toBeNull();
    });

    it('endGame should call dialog.open', async () => {
        const spy = spyOn(component.dialog, 'open');
        await component.endGame();
        expect(spy).toHaveBeenCalledOnceWith(EndgameDialogComponent, {
            disableClose: true,
        });
    });

    it('should subscribe to timer$, differencesFound$, gameFinished$, and userGame$ observables', () => {
        const timer$ = new Subject<number>();
        const differencesFound$ = new Subject<number>();
        const gameFinished$ = new Subject<boolean>();
        const userGame$ = new Subject<UserGame>();

        classicModeService.timer$ = timer$;
        classicModeService.differencesFound$ = differencesFound$;
        classicModeService.gameFinished$ = gameFinished$;
        classicModeService.userGame$ = userGame$;

        component.ngOnInit();

        timer$.next(1);
        differencesFound$.next(1);
        gameFinished$.next(true);
        userGame$.next(userGame);

        expect(component.timer).toBe(1);
        expect(component.differencesFound).toBe(1);
        expect(component.gameName).toBe('test');
        expect(component.player).toBe('test');
    });
});
