import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameData } from '@app/interfaces/game-data';

const differenceMatrix: number[][] = [[]];
const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
const gameData: GameData = { gameForm, differenceMatrix };

@NgModule({
    imports: [HttpClientModule],
})
export class DynamicTestModule {}

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [DynamicTestModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        component.gameData = gameData;
        fixture.detectChanges();
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('should draw ERREUR on canvas1', () => {
        component.gameData = gameData;
        fixture.detectChanges();
        const textDimensions = { x: 50, y: 30 };
        const spy = spyOn(component.context1, 'fillText');
        component.visualRetroaction(component.canvas1.nativeElement);
        expect(spy).toHaveBeenCalledWith(
            'ERREUR',
            component.mousePosition.x - textDimensions.x / 2,
            component.mousePosition.y + textDimensions.y / 2,
            textDimensions.x,
        );
    });

    it('should draw ERREUR on canvas2', () => {
        component.gameData = gameData;
        fixture.detectChanges();
        const textDimensions = { x: 50, y: 30 };
        const spy = spyOn(component.context2, 'fillText');
        component.visualRetroaction(component.canvas2.nativeElement);
        expect(spy).toHaveBeenCalledWith(
            'ERREUR',
            component.mousePosition.x - textDimensions.x / 2,
            component.mousePosition.y + textDimensions.y / 2,
            textDimensions.x,
        );
    });

    it('should make ERREUR disappear after 1 second on canvas1', fakeAsync(() => {
        component.gameData = gameData;
        fixture.detectChanges();
        const spy = spyOn(component.context1, 'drawImage');
        component.visualRetroaction(component.canvas1.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));

    it('should make ERREUR disappear after 1 second on canvas2', fakeAsync(() => {
        component.gameData = gameData;
        fixture.detectChanges();
        const spy = spyOn(component.context2, 'drawImage');
        component.visualRetroaction(component.canvas2.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));
});
