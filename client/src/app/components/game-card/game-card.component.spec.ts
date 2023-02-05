import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';
import { PageKeys } from './game-card-options';
import { AppRoutingModule } from '@app/modules/app-routing.module';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [AppRoutingModule],
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
});
