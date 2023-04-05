import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instruction } from '@app/interfaces/video-replay';
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
        component.actions = [{ type: Instruction.Error, timeStart: 0 }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
