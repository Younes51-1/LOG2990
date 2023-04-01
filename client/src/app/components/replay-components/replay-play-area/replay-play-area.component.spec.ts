import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakePlayAreaComponent } from './replay-play-area.component';

describe('FakePlayAreaComponent', () => {
    let component: FakePlayAreaComponent;
    let fixture: ComponentFixture<FakePlayAreaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FakePlayAreaComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FakePlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
