import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GameData } from '@app/interfaces/game-data';
import { UserGame } from '@app/interfaces/user-game';

const differenceMatrix: number[][] = [[]];
const gameForm = { name: '', nbDifference: 0, image1url: '', image2url: '', difficulte: '', soloBestTimes: [], vsBestTimes: [] };
const gameData: GameData = { gameForm, differenceMatrix };
const userGame: UserGame = { username: '', gameData, nbDifferenceFound: 0, timer: 0 };

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
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });

    it('should draw ERREUR on canvas1', () => {
        const textDimensions = { x: 50, y: 30 };
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
        const textDimensions = { x: 50, y: 30 };
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
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
        component.context1 = component.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const spy = spyOn(component.context1, 'drawImage');
        component.visualRetroaction(component.canvas1.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));

    it('should make ERREUR disappear after 1 second on canvas2', fakeAsync(() => {
        component.context2 = component.canvas2.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        component.differenceMatrix = differenceMatrix;
        component.original.src = userGame.gameData.gameForm.image1url;
        component.modified.src = userGame.gameData.gameForm.image2url;

        const spy = spyOn(component.context2, 'drawImage');
        component.visualRetroaction(component.canvas2.nativeElement);
        const ms = 1000;
        tick(ms);
        expect(spy).toHaveBeenCalled();
        expect(component.playerIsAllowedToClick).toBeTruthy();
    }));
});
