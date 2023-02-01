import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';
import { PageKeys } from './game-card-options';
import { Location } from '@angular/common';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as name 'Titre'", () => {
        expect(component.gameTitle).toEqual('Titre');
    });

    it('should have game image', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toContain('/assets/card.png');
    });

    it('should have a certain level of difficulty', () => {
        expect(component.difficultyLevel).toEqual('Niveau de difficulté');
    });

    it('should have three best solo scores', () => {
        expect(component.bestSoloTimeOne).toEqual(1);
        expect(component.bestSoloTimeTwo).toEqual(2);
        expect(component.bestSoloTimeThree).toEqual(3);
    });

    it('should have three best 1v1 scores', () => {
        expect(component.bestPvpOne).toEqual(1);
        expect(component.bestPvpTwo).toEqual(2);
        expect(component.bestPvpThree).toEqual(3);
    });

    it('should have play button for solo mode', () => {
        const btn1 = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        expect(btn1).not.toBeUndefined();
    });

    it('should have create/join button for 1v1 mode', () => {
        const btn2 = fixture.debugElement.nativeElement.getElementsByClassName('btn')[1];
        expect(btn2).not.toBeUndefined();
    });

    it('should navigate to the game-page on click of a "Jouer" button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        component.page = PageKeys.Selection;
        component.ngOnInit();
        const playBtn = fixture.debugElement.nativeElement.getElementsByClassName('btn')[0];
        playBtn.click();
        tick();
        fixture.detectChanges();
        console.log(playBtn);
        expect(location.path()).toEqual('/game');
    }));
});
