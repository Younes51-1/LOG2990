import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';

describe('CreateJoinGameDialogComponent', () => {
    let component: CreateJoinGameDialogComponent;
    let fixture: ComponentFixture<CreateJoinGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateJoinGameDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateJoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
