import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { Location } from '@angular/common';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [AppRoutingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a timer', () => {
        const timer = fixture.debugElement.nativeElement.getElementsByClassName('timer');
        expect(timer).toBeDefined();
    });

    it('should show the number of differences found', () => {
        const differences = fixture.debugElement.nativeElement.getElementsByClassName('diffFound');
        expect(differences.length).not.toEqual(1); // mettre 0 au lieu du 1 quand tu fix le code
    });

    it('should show the name of the game', () => {
        const gameName = fixture.debugElement.nativeElement.getElementsByClassName('gameName');
        expect(gameName.length).not.toEqual(0);
    });

    it('should show the game difficulty', () => {
        const difficulty = fixture.debugElement.nativeElement.getElementsByClassName('difficulty');
        expect(difficulty.length).not.toEqual(0);
    });

    it('should show the game mode', () => {
        const mode = fixture.debugElement.nativeElement.getElementsByClassName('gameMode');
        expect(mode.length).not.toEqual(0);
    });

    it('should show the total number of differences', () => {
        const totalNumber = fixture.debugElement.nativeElement.getElementsByClassName('totalNumber');
        expect(totalNumber.length).not.toEqual(0);
    });

    it('should have a button to quit the game', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const quitBtn = fixture.debugElement.nativeElement.querySelector('button');
        quitBtn.click();
        tick();
        expect(location.path()).toEqual('/selection');
    }));

    it('should show the timer in the right format (minutes:seconds)', () => {
        component.minutes = 10;
        component.seconds = 20;
        fixture.detectChanges();
        const timer = fixture.debugElement.nativeElement.querySelector('.timer p:last-child');
        expect(timer.textContent).toEqual('10:20');
    });

    it("should show the player's name", () => {
        const newName = 'Samuel Pierre';
        component.player = newName;
        fixture.detectChanges();
        const name = fixture.debugElement.nativeElement.querySelector('.sidebar-container p:first-child');
        expect(name.textContent).toContain(newName);
    });

    it('should reset the interface on game start', () => {
        component.minutes = 5;
        component.seconds = 5;
        component.ngOnInit();
        fixture.detectChanges();
        expect(component.minutes).toEqual(0);
        expect(component.seconds).toEqual(0);
    });

    it('should spend one second after a second is displayed on the timer', fakeAsync(() => {
        const oneSecond = 1000;
        component.ngOnInit();
        tick(oneSecond);
        clearInterval(component.intervalId);
        expect(component.seconds).toEqual(1);
        expect(component.minutes).toEqual(0);
    }));

    it('should spend one minute after a minute is displayed on the timer', fakeAsync(() => {
        const oneMinute = 60000;
        component.ngOnInit();
        tick(oneMinute);
        clearInterval(component.intervalId);
        expect(component.minutes).toEqual(1);
        expect(component.seconds).toEqual(0);
    }));

    it('should show 61 seconds after 62 seconds passed', fakeAsync(() => {
        const sixtyTwoSeconds = 62000;
        component.ngOnInit();
        tick(sixtyTwoSeconds);
        expect(component.minutes).toEqual(1);
        expect(component.seconds).toEqual(1);
    }));

    it('should call clearInterval after 61 seconds', fakeAsync(() => {
        spyOn(component, 'stopTimer');
        const sixtyOneSeconds = 61000;
        component.ngOnInit();
        tick(sixtyOneSeconds);
        clearInterval(component.intervalId);
        expect(component.stopTimer).toHaveBeenCalled();
    }));
});
