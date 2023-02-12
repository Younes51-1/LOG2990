import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GamePageComponent } from './game-page.component';
import { MatToolbar } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GameData } from '@app/interfaces/game-data';
import { CommunicationService } from '@app/services/communicationService/communication.service';
import { of } from 'rxjs';
import { UserGame } from '@app/interfaces/user-game';
import SpyObj = jasmine.SpyObj;
import { EndgameDialogComponent } from '@app/components/endgame-dialog/endgame-dialog.component';

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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain a sidebar', () => {
        fixture.detectChanges();
        const sidebar = fixture.debugElement.nativeElement.querySelector('app-sidebar');
        expect(sidebar).not.toBeNull();
    });
});
