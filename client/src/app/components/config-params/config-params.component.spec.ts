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

    it('should increment initialTime by 5 seconds', () => {
        const answer = 35;
        component.increaseValue('initialTime');
        expect(component.initialTime.valueOf()).toEqual(answer);
    });

    it('should increment penaltyTime by 1 seconds', () => {
        const answer = 6;
        component.increaseValue('penaltyTime');
        expect(component.penaltyTime.valueOf()).toEqual(answer);
    });

    it('should increment bonusTime by 1 seconds', () => {
        const answer = 6;
        component.increaseValue('bonusTime');
        expect(component.bonusTime.valueOf()).toEqual(answer);
    });

    it('should decrement initialTime by 5 seconds', () => {
        const answer = 25;
        component.decreaseValue('initialTime');
        expect(component.initialTime.valueOf()).toEqual(answer);
    });

    it('should decrement penaltyTime by 1 seconds', () => {
        const answer = 4;
        component.decreaseValue('penaltyTime');
        expect(component.penaltyTime.valueOf()).toEqual(answer);
    });

    it('should decrement initialTime by 1 seconds', () => {
        const answer = 4;
        component.decreaseValue('bonusTime');
        expect(component.bonusTime.valueOf()).toEqual(answer);
    });

    it('should not change the variables when an unknown time is passed to increaseValue', () => {
        const initialTime = component.initialTime;
        const penaltyTime = component.penaltyTime;
        const bonusTime = component.bonusTime;
        component.increaseValue('unknownTime');
        expect(initialTime).toEqual(component.initialTime);
        expect(penaltyTime).toEqual(component.penaltyTime);
        expect(bonusTime).toEqual(component.bonusTime);
    });

    it('should not change the variables when an unknown time is passed to decreaseValue', () => {
        const initialTime = component.initialTime;
        const penaltyTime = component.penaltyTime;
        const bonusTime = component.bonusTime;
        component.decreaseValue('unknownTime');
        expect(initialTime).toEqual(component.initialTime);
        expect(penaltyTime).toEqual(component.penaltyTime);
        expect(bonusTime).toEqual(component.bonusTime);
    });
});
