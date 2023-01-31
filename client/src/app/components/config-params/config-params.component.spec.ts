import { ComponentFixture, TestBed } from '@angular/core/testing';

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

    it('should show the name and value of the three game constants', () => {
        const initialTime = component.initialTime;
        const penaltyTime = component.penaltyTime;
        const bonusTime = component.bonusTime;
        const initialTimeValue = 30;
        const penaltyTimeValue = 5;
        const bonusTimeValue = 5;
        expect(initialTime).toEqual(initialTimeValue);
        expect(penaltyTime).toEqual(penaltyTimeValue);
        expect(bonusTime).toEqual(bonusTimeValue);
    });
});
