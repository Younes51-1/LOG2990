import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplayScoreBoardComponent } from './replay-score-board.component';

describe('ReplayScoreBoardComponent', () => {
    let component: ReplayScoreBoardComponent;
    let fixture: ComponentFixture<ReplayScoreBoardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReplayScoreBoardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayScoreBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
