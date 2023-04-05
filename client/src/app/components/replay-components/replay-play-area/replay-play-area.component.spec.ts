import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Instruction } from '@app/interfaces/video-replay';
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
        component.actions = [{ type: Instruction.Error, timeStart: 0 }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
