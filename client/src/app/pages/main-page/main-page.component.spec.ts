import { Location } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            imports: [AppRoutingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have team name '204 : NO CONTENT'", () => {
        expect(component.teamName).toEqual('204 : NO CONTENT');
    });

    it("should have team members full name '", () => {
        const teamMembersFullName: string[] = [
            'Coralie Brodeur',
            ' Imène Clara Ghazi',
            ' Kylian Chaussoy',
            ' Thibault Demagny',
            ' Younes Benabbou',
            ' Dumitru Zlotea',
        ];

        expect(component.teamMembers).toEqual(teamMembersFullName);
    });

    it('should have game logo', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toContain('/assets/logo.png');
    });

    it('should have configuration button', () => {
        const configBtn = fixture.debugElement.query(By.css('.config-button')).nativeElement;
        expect(configBtn).not.toBeUndefined();
    });

    it('should have 2 game mode', () => {
        const gameModeSections = fixture.debugElement.nativeElement.getElementsByClassName('modes')[0];
        expect(gameModeSections.childElementCount).toEqual(2);
    });

    it('should have classique mode button', () => {
        const classicBtn = fixture.debugElement.query(By.css('.solo-mode button')).nativeElement;
        expect(classicBtn).not.toBeUndefined();
        expect(classicBtn.innerHTML).toEqual('CLASSIQUE');
    });

    it('should have limited mode button', () => {
        const chronoBtn = fixture.debugElement.query(By.css('.chrono-mode button')).nativeElement;
        expect(chronoBtn).not.toBeUndefined();
        expect(chronoBtn.innerHTML).toEqual('TEMPS LIMITÉ');
    });

    it('should show the configuration page on click of the configuration button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const configBtn = fixture.debugElement.query(By.css('.config-button')).nativeElement;
        configBtn.click();
        tick();
        expect(location.path()).toEqual('/config');
    }));

    it('should show the selection-page on click of the classic mode button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const classicBtn = fixture.debugElement.query(By.css('.solo-mode button')).nativeElement;
        classicBtn.click();
        tick();
        expect(location.path()).toEqual('/selection');
    }));

    // to change in the future
    it('should show the chronoMode-page on click of the chrono mode button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const chronoBtn = fixture.debugElement.query(By.css('.chrono-mode button')).nativeElement;
        chronoBtn.click();
        tick();
        expect(location.path()).toEqual('/home');
    }));
});
