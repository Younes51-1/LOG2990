import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { CreateJoinGameDialogComponent } from '@app/components/create-join-game-dialog/create-join-game-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('CreateJoinGameDialogComponent', () => {
    let component: CreateJoinGameDialogComponent;
    let fixture: ComponentFixture<CreateJoinGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateJoinGameDialogComponent],
            imports: [AppRoutingModule, DynamicTestModule, RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MatDialog, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateJoinGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
