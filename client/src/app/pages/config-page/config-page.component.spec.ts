import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { Router } from '@angular/router';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('ConfigPageComponent', () => {
    let component: ConfigPageComponent;
    let fixture: ComponentFixture<ConfigPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfigPageComponent],
            imports: [AppRoutingModule],
            providers: [
                {
                    provide: MatDialog,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the configuration page when searching for the ./config URL', fakeAsync(() => {
        const router = TestBed.inject(Router);
        const location = TestBed.inject(Location);
        router.initialNavigation();
        router.navigate(['/config']);
        tick();
        expect(location.path()).toEqual('/config');
    }));

    it('should instantiate the component when navigating to /config', fakeAsync(() => {
        const router = TestBed.inject(Router);
        router.navigate(['/config']);
        tick();
        expect(fixture.componentInstance).toBeTruthy();
    }));

    it('should contain a carousel', () => {
        const carousel = fixture.debugElement.query(By.css('.carousel')).nativeElement;
        expect(carousel).not.toBeUndefined();
    });

    it('should have slides in the carousel', () => {
        expect(component.slides.length).toBeGreaterThan(0);
    });

    it('should show up to 4 slides at a time', () => {
        const slidesToShow = 4;
        expect(component.slideConfig.slidesToShow).toEqual(slidesToShow);
    });

    it('should contain the names and values of the three game constants', () => {
        const params = fixture.debugElement.nativeElement.getElementsByClassName('centered-text')[0];
        expect(params.childElementCount).toEqual(1);
    });

    it('should allow to access Game Creation page', () => {
        const centeredBtn = fixture.debugElement.query(By.css('.centered-btn')).children[0].nativeElement;
        expect(centeredBtn.getAttribute('ng-reflect-router-link')).toEqual('/gameCreation');
    });

    it('should show the game creation page on click of the Game Creation button', fakeAsync(() => {
        const location = TestBed.inject(Location);
        const centeredBtn = fixture.debugElement.query(By.css('.centered-btn')).children[0].nativeElement;
        centeredBtn.click();
        tick();
        expect(location.path()).toEqual('/gameCreation');
    }));
});
