import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';
import { PageKeys, options } from './game-card-options';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

@NgModule({
    imports: [HttpClientModule],
})
export class DynamicTestModule {}

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule, DynamicTestModule],
        }).compileComponents();
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        // TODO: change tests to test both pages (Selection and Config).
        component.page = PageKeys.Config;
        component.slide = {
            name: 'Find the Differences 1',
            nbDifference: 10,
            image1url: 'https://example.com/image1.jpg',
            image2url: 'https://example.com/image2.jpg',
            difficulte: 'easy',
            soloBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
            vsBestTimes: [
                { name: 'player1', time: 200 },
                { name: 'player2', time: 150 },
                { name: 'player3', time: 150 },
            ],
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('slide should have name', () => {
        expect(component.slide.name).toBeTruthy();
    });

    it('should have game image', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toEqual('https://example.com/image1.jpg');
    });

    it('slide should have difficulte', () => {
        expect(component.slide.difficulte).toBeTruthy();
    });

    it('should have three best solo scores', () => {
        expect(component.slide.soloBestTimes.length).toEqual(3);
    });

    it('should have three best 1v1 scores', () => {
        expect(component.slide.vsBestTimes.length).toEqual(3);
    });

    it('should have play button for solo mode', () => {
        const btn1 = fixture.debugElement.nativeElement.getElementsByTagName('button')[0];
        expect(btn1).not.toBeUndefined();
    });

    it('should have create/join button for 1v1 mode', () => {
        const btn2 = fixture.debugElement.nativeElement.getElementsByTagName('button')[1];
        expect(btn2).not.toBeUndefined();
    });

    it('should emit the correct value when btnOneEmitter is called', () => {
        const expectedValue = component.slide.name;
        const spy = spyOn(component.notify, 'emit');
        component.btnOneEmitter();
        expect(spy).toHaveBeenCalledWith(expectedValue);
    });

    it('should emit the correct object when btnTwoEmitter is called', () => {
        const expectedObject = component.slide;
        const spy = spyOn(component.notify, 'emit');
        component.btnTwoEmitter();
        expect(spy).toHaveBeenCalledWith(expectedObject);
    });

    it('should set the correct properties when the page is Config', () => {
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.config.routeOne);
        expect(component.btnOne).toEqual(options.config.btnOne);
        expect(component.routeTwo).toEqual(options.config.routeTwo);
        expect(component.btnTwo).toEqual(options.config.btnTwo);
    });

    it('should set the correct properties when the page is Selection', () => {
        component.page = PageKeys.Selection;
        component.ngOnInit();
        expect(component.routeOne).toEqual(options.selection.routeOne);
        expect(component.btnOne).toEqual(options.selection.btnOne);
        expect(component.routeTwo).toEqual(options.selection.routeTwo);
        expect(component.btnTwo).toEqual(options.selection.btnTwo);
    });
});
