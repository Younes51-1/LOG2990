import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoReplayDialogComponent } from './video-replay-dialog.component';

describe('VideoReplayDialogComponent', () => {
    let component: VideoReplayDialogComponent;
    let fixture: ComponentFixture<VideoReplayDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoReplayDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
