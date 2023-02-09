import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigParamsComponent, Time } from './config-params.component';

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

    it('should increase initial time', () => {
        const time = component.initialTime;
        component.increaseValue('initialTime');
        expect(component.initialTime).toEqual(time + Time.FiveSeconds);
    });

    it('should increment penaltyTime', () => {
        let time = component.penaltyTime;
        component.increaseValue('penaltyTime');
        expect(++time).toEqual(component.penaltyTime);
    });

    it('should increment bonus time', () => {
        let time = component.bonusTime;
        component.increaseValue('bonusTime');
        expect(++time).toEqual(component.bonusTime);
    });

    it('should not modify times', () => {
        const timeBonus = component.bonusTime;
        const timePenalty = component.penaltyTime;
        const timeInitial = component.initialTime;
        component.increaseValue('');
        expect(timeBonus).toEqual(component.bonusTime);
        expect(timePenalty).toEqual(component.penaltyTime);
        expect(timeInitial).toEqual(component.initialTime);
    });

    it('should increase initial time', () => {
        const time = component.initialTime;
        component.increaseValue('initialTime');
        expect(component.initialTime).toEqual(time + Time.FiveSeconds);
    });

    it('should increment penaltyTime', () => {
        let time = component.penaltyTime;
        component.increaseValue('penaltyTime');
        expect(++time).toEqual(component.penaltyTime);
    });

    it('should increment bonus time', () => {
        let time = component.bonusTime;
        component.increaseValue('bonusTime');
        expect(++time).toEqual(component.bonusTime);
    });

    it('should not modify times', () => {
        const timeBonus = component.bonusTime;
        const timePenalty = component.penaltyTime;
        const timeInitial = component.initialTime;
        component.increaseValue('');
        expect(timeBonus).toEqual(component.bonusTime);
        expect(timePenalty).toEqual(component.penaltyTime);
        expect(timeInitial).toEqual(component.initialTime);
    });

    it('should decrease initial time', () => {
        const time = component.initialTime;
        component.decreaseValue('initialTime');
        expect(component.initialTime).toEqual(time - Time.FiveSeconds);
    });

    it('should decrement penaltyTime', () => {
        let time = component.penaltyTime;
        component.decreaseValue('penaltyTime');
        expect(--time).toEqual(component.penaltyTime);
    });

    it('should decrement bonus time', () => {
        let time = component.bonusTime;
        component.decreaseValue('bonusTime');
        expect(--time).toEqual(component.bonusTime);
    });

    it('should not modify times', () => {
        const timeBonus = component.bonusTime;
        const timePenalty = component.penaltyTime;
        const timeInitial = component.initialTime;
        component.decreaseValue('');
        expect(timeBonus).toEqual(component.bonusTime);
        expect(timePenalty).toEqual(component.penaltyTime);
        expect(timeInitial).toEqual(component.initialTime);
    });
});
