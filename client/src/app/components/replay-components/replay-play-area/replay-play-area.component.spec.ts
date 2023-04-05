import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayPlayAreaComponent } from './replay-play-area.component';

describe('ReplayPlayAreaComponent', () => {
    let component: ReplayPlayAreaComponent;
    let fixture: ComponentFixture<ReplayPlayAreaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReplayPlayAreaComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayPlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
