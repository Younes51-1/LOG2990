import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfigParamsComponent } from '@app/components/config-params/config-params.component';

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

    it('should not change the variables when an unknown time is passed to manuallyChangeValue', () => {
        const initialTime = component.initialTime;
        const penaltyTime = component.penaltyTime;
        const bonusTime = component.bonusTime;
        const tenSeconds = 10;
        component.manuallyChangeValue('unknownTime', tenSeconds);
        expect(initialTime).toEqual(component.initialTime);
        expect(penaltyTime).toEqual(component.penaltyTime);
        expect(bonusTime).toEqual(component.bonusTime);
    });

    it('should set the value of initialTime in manualChangeValue', () => {
        const answer = 50;
        component.manuallyChangeValue('initialTime', answer);
        expect(component.initialTime).toEqual(+answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should set the value of penaltyTime in manualChangeValue', () => {
        const answer = 9;
        component.manuallyChangeValue('penaltyTime', answer);
        expect(component.penaltyTime).toEqual(+answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should set the value of bonusTime in manualChangeValue', () => {
        const answer = 9;
        component.manuallyChangeValue('bonusTime', answer);
        expect(component.bonusTime).toEqual(+answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should increment initialTime by 5 seconds if in bounds', () => {
        const answer = 35;
        component.buttonIncreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not increment initialTime if not in bounds', () => {
        const answer = 120;
        component.initialTime = answer;
        component.buttonIncreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should decrement initialTime by 5 seconds if in bounds', () => {
        const answer = 25;
        component.buttonDecreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not decrement initialTime if not in bounds', () => {
        const answer = 15;
        component.initialTime = answer;
        component.buttonDecreaseInitialTime();
        expect(component.initialTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should increment penaltyTime by 1 seconds if in bounds', () => {
        const answer = 6;
        component.buttonIncreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not increment penaltyTime if not in bounds', () => {
        const answer = 10;
        component.penaltyTime = answer;
        component.buttonIncreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should decrement penaltyTime by 1 seconds if in bounds', () => {
        const answer = 4;
        component.buttonDecreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not decrement penaltyTime if not in bounds', () => {
        const answer = 3;
        component.penaltyTime = answer;
        component.buttonDecreasePenalty();
        expect(component.penaltyTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should increment bonusTime by 1 seconds if in bounds', () => {
        const answer = 6;
        component.buttonIncreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not increment bonusTime if not in bounds', () => {
        const answer = 10;
        component.bonusTime = answer;
        component.buttonIncreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should decrement bonusTime by 1 seconds if in bounds', () => {
        const answer = 4;
        component.buttonDecreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });

    it('should not decrement bonusTime if not in bounds', () => {
        const answer = 3;
        component.bonusTime = answer;
        component.buttonDecreaseBonus();
        expect(component.bonusTime.valueOf()).toEqual(answer);
        expect(component.isInvalidInput).toBeFalse();
    });
});
