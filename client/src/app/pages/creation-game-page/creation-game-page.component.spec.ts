import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationGamePageComponent } from './creation-game-page.component';

describe('CreationGamePageComponent', () => {
    let component: CreationGamePageComponent;
    let fixture: ComponentFixture<CreationGamePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreationGamePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
