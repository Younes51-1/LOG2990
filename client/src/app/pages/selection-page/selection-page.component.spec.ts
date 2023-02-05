import { HttpClientModule, HttpResponse } from '@angular/common/http';
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
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { RouterTestingModule } from '@angular/router/testing';

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

describe('SelectionPageComponent', () => {
    let component: SelectionPageComponent;
    let fixture: ComponentFixture<SelectionPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost', 'getAllGames']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    name: 'Find the Differences 1',
                    nbDifference: 10,
                    image1url: 'https://example.com/image1.jpg',
                    image2url: 'https://example.com/image2.jpg',
                    difficulte: 'easy',
                    soloBestTimes: [
                        { name: 'player1', time: 200 },
                        { name: 'player2', time: 150 },
                    ],
                    vsBestTimes: [{ name: 'player1', time: 200 }],
                },
                {
                    name: 'Find the Differences 2',
                    nbDifference: 15,
                    image1url: 'https://example.com/image3.jpg',
                    image2url: 'https://example.com/image4.jpg',
                    difficulte: 'medium',
                    soloBestTimes: [
                        { name: 'player3', time: 300 },
                        { name: 'player4', time: 250 },
                    ],
                    vsBestTimes: [{ name: 'player3', time: 200 }],
                },
            ]),
        );

        await TestBed.configureTestingModule({
            declarations: [SelectionPageComponent],
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
                HttpClientModule,
                RouterTestingModule,
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SelectionPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
