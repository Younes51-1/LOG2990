import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { GameData } from '@app/interfaces/game';
import { AppRoutingModule } from '@app/modules/app-routing.module';

@NgModule({
    imports: [MatDialogModule, HttpClientModule],
})
export class DynamicTestModule {}

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [DynamicTestModule, AppRoutingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        const differenceMatrix: number[][] = [[]];
        const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
        const gameData: GameData = { gameForm, differenceMatrix };
        const gameRoom = { userGame: { gameData, nbDifferenceFound: 0, timer: 0, username1: 'Test' }, roomId: 'fakeId', started: false };

        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        component.gameRoom = gameRoom;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a timer', () => {
        const timer = fixture.debugElement.nativeElement.getElementsByClassName('timer');
        expect(timer).toBeDefined();
    });

    it('should show the number of differences found', () => {
        const differences = fixture.debugElement.nativeElement.getElementsByClassName('diffFound');
        expect(differences.length).toEqual(0);
    });

    it('should show the game difficulty', () => {
        const difficulty = fixture.debugElement.nativeElement.querySelector('div:first-of-type').querySelector('p:nth-of-type(2)');
        expect(difficulty).not.toEqual(0);
    });

    it('should show the game mode', () => {
        const mode = fixture.debugElement.nativeElement.querySelector('div:first-of-type').querySelector('p:nth-of-type(1)');
        expect(mode.length).not.toEqual(0);
    });

    it('should show the total number of differences', () => {
        const totalNumber = fixture.debugElement.nativeElement.querySelector('div:first-of-type').querySelector('p:nth-of-type(3)');
        expect(totalNumber.length).not.toEqual(0);
    });

    it('should have a button to quit the game', fakeAsync(() => {
        const quitBtn = fixture.debugElement.nativeElement.querySelector('button');
        const endGameSpy = spyOn(component.endGameParent, 'emit');
        quitBtn.click();
        tick();
        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should show the timer in the right format (minutes:seconds)', () => {
        component.minutes = 10;
        component.seconds = 20;
        fixture.detectChanges();
        const timer = fixture.debugElement.query(By.css('.timer1')).nativeElement;
        expect(timer.textContent).toEqual('10:20');
    });

    it('should reset the interface on game start', () => {
        component.minutes = 5;
        component.seconds = 5;
        component.timer = 0;
        component.ngOnChanges();
        fixture.detectChanges();
        expect(component.minutes).toEqual(0);
        expect(component.seconds).toEqual(0);
    });

    it('should spend one second after a second is displayed on the timer', fakeAsync(() => {
        component.timer = 1;
        component.ngOnChanges();
        expect(component.seconds).toEqual(1);
        expect(component.minutes).toEqual(0);
    }));

    it('should spend one minute after a minute is displayed on the timer', fakeAsync(() => {
        component.timer = 60;
        component.ngOnChanges();
        expect(component.minutes).toEqual(1);
        expect(component.seconds).toEqual(0);
    }));
});
