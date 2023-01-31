import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatButtonModule,
                MatCardModule,
                MatDialogModule,
                MatExpansionModule,
                MatIconModule,
                MatRadioModule,
                MatToolbarModule,
                MatTooltipModule,
                AppRoutingModule,
            ],
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

    it('should have slides in the carousel', () => {
        expect(component.slides.length).toBeGreaterThan(0);
    });

    it('should show 4 slides at a time', () => {
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
});
