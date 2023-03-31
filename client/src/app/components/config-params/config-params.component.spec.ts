import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';
import { Constants } from 'src/assets/variables/constants';
import { ConfigHttpService } from '@app/services/config-http/config-http.service';

describe('ConfigParamsComponent', () => {
    let component: ConfigParamsComponent;
    let fixture: ComponentFixture<ConfigParamsComponent>;
    let configHttpService: jasmine.SpyObj<ConfigHttpService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigParamsComponent],
            providers: [{ provide: ConfigHttpService, useValue: configHttpService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigParamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain three labels', () => {
        const labels = fixture.debugElement.queryAll(By.css('.label'));
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

    it('should remove unwanted characters from input in manuallyChangeInitialTime', () => {
        const value = 31;
        component.manuallyChangeInitialTime(value + 'a');
        const output = component.initialTime;
        expect(output).toEqual(value);
    });

    it('should set isInvalidInput flag to true if value out of bounds in manuallyChangeInitialTime', () => {
        const value = '150';
        component.manuallyChangeInitialTime(value);
        expect(component.isInvalidInput).toBe(true);
        expect(component.initialTime.valueOf()).toEqual(+value);
    });

    it('should set the value of initialTime in manuallyChangeInitialTime', () => {
        const answer = '50';
        component.manuallyChangeInitialTime(answer);
        expect(component.initialTime.valueOf()).toEqual(+answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should remove unwanted characters from input in manuallyChangePenaltyTime', () => {
        const value = 6;
        component.manuallyChangePenaltyTime(value + 'a');
        const output = component.penaltyTime;
        expect(output).toEqual(value);
    });

    it('should set isInvalidInput flag to true if value out of bounds in manuallyChangePenaltyTime', () => {
        const value = '15';
        component.manuallyChangePenaltyTime(value);
        expect(component.isInvalidInput).toBe(true);
        expect(component.penaltyTime.valueOf()).toEqual(+value);
    });

    it('should set the value of penaltyTime in manuallyChangePenaltyTime', () => {
        const answer = '9';
        component.manuallyChangePenaltyTime(answer);
        expect(component.penaltyTime.valueOf()).toEqual(+answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should remove unwanted characters from input in manuallyChangeBonusTime', () => {
        const value = 6;
        component.manuallyChangeBonusTime(value + 'a');
        const output = component.bonusTime;
        expect(output).toEqual(value);
    });

    it('should set isInvalidInput flag to true if value out of bounds in manuallyChangeBonusTime', () => {
        const value = '15';
        component.manuallyChangeBonusTime(value);
        expect(component.isInvalidInput).toBe(true);
        expect(component.bonusTime.valueOf()).toEqual(+value);
    });

    it('should set the value of bonusTime in manuallyChangeBonusTime', () => {
        const answer = '9';
        component.manuallyChangeBonusTime(answer);
        expect(component.bonusTime.valueOf()).toEqual(+answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should increment initialTime by 5 seconds if in bounds', () => {
        const answer = 35;
        component.buttonIncreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not increment initialTime if not in bounds', () => {
        const answer = 120;
        component.initialTime = answer;
        component.buttonIncreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put initialTime in bounds if lower than minimum allowed', () => {
        const tooLow = 0;
        component.initialTime = tooLow;
        component.buttonIncreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(Constants.MinInitialTime);
    });

    it('should decrement initialTime by 5 seconds if in bounds', () => {
        const answer = 25;
        component.buttonDecreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not decrement initialTime if not in bounds', () => {
        const answer = 15;
        component.initialTime = answer;
        component.buttonDecreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put initialTime in bounds if higher than maximum allowed', () => {
        const tooHigh = 200;
        component.initialTime = tooHigh;
        component.buttonDecreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(Constants.MaxInitialTime);
    });

    it('should increment penaltyTime by 1 seconds if in bounds', () => {
        const answer = 6;
        component.buttonIncreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not increment penaltyTime if not in bounds', () => {
        const answer = 10;
        component.penaltyTime = answer;
        component.buttonIncreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put penaltyTime in bounds if lower than minimum allowed', () => {
        const tooLow = 0;
        component.penaltyTime = tooLow;
        component.buttonIncreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(Constants.MinPenaltyTime);
    });

    it('should decrement penaltyTime by 1 seconds if in bounds', () => {
        const answer = 4;
        component.buttonDecreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not decrement penaltyTime if not in bounds', () => {
        const answer = 3;
        component.penaltyTime = answer;
        component.buttonDecreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put penaltyTime in bounds if higher than maximum allowed', () => {
        const tooHigh = 50;
        component.penaltyTime = tooHigh;
        component.buttonDecreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(Constants.MaxPenaltyTime);
    });

    it('should increment bonusTime by 1 seconds if in bounds', () => {
        const answer = 6;
        component.buttonIncreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not increment bonusTime if not in bounds', () => {
        const answer = 10;
        component.bonusTime = answer;
        component.buttonIncreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put bonusTime in bounds if lower than minimum allowed', () => {
        const tooLow = 0;
        component.bonusTime = tooLow;
        component.buttonIncreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(Constants.MinBonusTime);
    });

    it('should decrement bonusTime by 1 seconds if in bounds', () => {
        const answer = 4;
        component.buttonDecreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should not decrement bonusTime if not in bounds', () => {
        const answer = 3;
        component.bonusTime = answer;
        component.buttonDecreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBe(false);
    });

    it('should put bonusTime in bounds if higher than minimum allowed', () => {
        const tooHigh = 50;
        component.bonusTime = tooHigh;
        component.buttonDecreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(Constants.MaxBonusTime);
    });
});
