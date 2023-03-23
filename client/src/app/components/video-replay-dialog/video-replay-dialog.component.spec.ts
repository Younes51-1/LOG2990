import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoReplayDialogComponent } from './video-replay-dialog.component';

describe('VideoReplayDialogComponent', () => {
    let component: VideoReplayDialogComponent;
    let fixture: ComponentFixture<VideoReplayDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VideoReplayDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
