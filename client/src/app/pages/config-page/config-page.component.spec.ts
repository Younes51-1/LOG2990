import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { of } from 'rxjs';

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

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
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
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

    it('onLikeLoremTheme() should open a dialog', () => {
        // eslint-disable-next-line -- matDialog is private and we need access for the test
        const spy = spyOn(component['matDialog'], 'open');
        component.onLikeTheme();
        expect(spy).toHaveBeenCalled();
    });
});