import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VideoReplay } from '@app/interfaces/video-replay';

@Component({
    selector: 'app-video-replay-dialog',
    templateUrl: './video-replay-dialog.component.html',
    styleUrls: ['./video-replay-dialog.component.scss'],
})
export class VideoReplayDialogComponent implements OnInit {
    constructor(@Inject(MAT_DIALOG_DATA) public data: { videoReplay: VideoReplay }) {}

    ngOnInit(): void {}

    replay() {
        console.log('replay');
    }
}
