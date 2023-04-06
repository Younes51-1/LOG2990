import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { Instruction, VideoReplay } from '@app/interfaces/video-replay';
import { VideoReplayDialogComponent } from './video-replay-dialog.component';

describe('VideoReplayDialogComponent', () => {
    let component: VideoReplayDialogComponent;
    let fixture: ComponentFixture<VideoReplayDialogComponent>;
    const differenceMatrix: number[][] = [[]];
    const gameForm = {
        name: '',
        nbDifference: 0,
        image1url: 'https://picsum.photos/402',
        image2url: 'https://picsum.photos/204',
        difficulty: '',
        soloBestTimes: [],
        vsBestTimes: [],
    };
    const gameData: GameData = { gameForm, differenceMatrix };
    const userGame: UserGame = { username1: '', gameData, nbDifferenceFound: 0, timer: 0 };
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false };
    let videoReplay: VideoReplay;

    beforeEach(async () => {
        videoReplay = {
            images: {
                original: 'https://example.com/original.png',
                modified: 'https://example.com/modified.png',
            },
            scoreboardParams: {
                gameRoom,
                gameName: 'Example Game',
                opponentUsername: 'Opponent123',
                username: 'User123',
            },
            actions: [{ type: Instruction.Error, timeStart: 0 }],
            sources: ['https://example.com/source1.mp4', 'https://example.com/source2.mp4'],
            cheatLayers: [document.createElement('canvas'), document.createElement('canvas')],
        };
        await TestBed.configureTestingModule({
            declarations: [VideoReplayDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { videoReplay } }],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
