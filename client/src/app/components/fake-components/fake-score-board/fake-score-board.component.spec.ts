import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeScoreBoardComponent } from './fake-score-board.component';

describe('FakeScoreBoardComponent', () => {
    let component: FakeScoreBoardComponent;
    let fixture: ComponentFixture<FakeScoreBoardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FakeScoreBoardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FakeScoreBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
