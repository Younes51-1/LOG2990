import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigParamsComponent } from './config-params.component';

describe('ConfigParamsComponent', () => {
    let component: ConfigParamsComponent;
    let fixture: ComponentFixture<ConfigParamsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigParamsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigParamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain three labels', () => {
        const labels = fixture.debugElement.queryAll(By.css('label'));
        expect(labels.length).toEqual(3);
    });

    it('should contain the value of the three game constants', () => {
        const initialTime = component.initialTime;
        const penaltyTime = component.penaltyTime;
        const bonusTime = component.bonusTime;
        expect(initialTime).not.toBeUndefined();
        expect(penaltyTime).not.toBeUndefined();
        expect(bonusTime).not.toBeUndefined();
    });
});
