/* eslint-disable @typescript-eslint/no-explicit-any */
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { VideoReplayDialogComponent } from '@app/components/video-replay-dialog/video-replay-dialog.component';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { Instruction, VideoReplay } from '@app/interfaces/video-replay';

describe('VideoReplayDialogComponent', () => {
    let component: VideoReplayDialogComponent;
    let fixture: ComponentFixture<VideoReplayDialogComponent>;
    const differenceMatrix: number[][] = [[]];
    const gameData: GameData = {
        name: '',
        nbDifference: 0,
        image1url: 'https://picsum.photos/402',
        image2url: 'https://picsum.photos/204',
        difficulty: '',
        soloBestTimes: [],
        vsBestTimes: [],
        differenceMatrix,
    };
    const userGame: UserGame = { username1: '', gameData, nbDifferenceFound: 0, timer: 0 };
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false, gameMode: 'mode classique' };
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
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
            imports: [MatProgressBarModule],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: { videoReplay, penaltyTime: 2 } }],
        }).compileComponents();

        fixture = TestBed.createComponent(VideoReplayDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call sortActions after init', () => {
        const sortActionsSpy = spyOn(component as any, 'sortActions').and.stub();
        component.ngOnInit();
        expect(component.actions).toEqual(videoReplay.actions);
        expect(component.username).toEqual(videoReplay.scoreboardParams.username);
        expect(sortActionsSpy).toHaveBeenCalled();
    });

    it('should call startTimer after init', () => {
        const startTimerSpy = spyOn(component, 'startTimer').and.stub();
        component.ngAfterViewInit();
        expect(startTimerSpy).toHaveBeenCalled();
    });

    it('should sort actions', () => {
        component.actions = [
            { type: Instruction.ChatMessage, timeStart: 0 },
            { type: Instruction.Error, timeStart: 0 },
            { type: Instruction.Score, timeStart: 0 },
        ];
        component.playAreaActions = [];
        component.scoreBoardActions = [];
        component.chatBoxActions = [];
        component.counter = 0;
        (component as any).sortActions();
        expect(component.playAreaActions).toEqual([{ type: Instruction.Error, timeStart: 0 }]);
        expect(component.scoreBoardActions).toEqual([{ type: Instruction.Score, timeStart: 0 }]);
        expect(component.chatBoxActions).toEqual([{ type: Instruction.ChatMessage, timeStart: 0 }]);
    });

    it('pause should call stopTimer if pause is false', () => {
        const stopTimerSpy = spyOn(component as any, 'stopTimer').and.stub();
        component.paused = false;
        component.pauseSignal = false;
        component.pause();
        expect(stopTimerSpy).toHaveBeenCalled();
        expect(component.pauseSignal).toBeTrue();
    });

    it('pause should not call stopTimer if pause is true', () => {
        const stopTimerSpy = spyOn(component as any, 'stopTimer').and.stub();
        component.paused = true;
        component.pauseSignal = false;
        component.pause();
        expect(stopTimerSpy).not.toHaveBeenCalled();
        expect(component.pauseSignal).toBeFalse();
    });

    it('continue should call startTimer if pause is true', () => {
        const startTimerSpy = spyOn(component, 'startTimer').and.stub();
        component.paused = true;
        component.continueSignal = false;
        component.continue();
        expect(startTimerSpy).toHaveBeenCalled();
        expect(component.continueSignal).toBeTrue();
        expect(component.paused).toBeFalse();
    });

    it('continue should not call startTimer if pause is false', () => {
        const startTimerSpy = spyOn(component, 'startTimer').and.stub();
        component.paused = false;
        component.continueSignal = false;
        component.continue();
        expect(startTimerSpy).not.toHaveBeenCalled();
        expect(component.continueSignal).toBeFalse();
        expect(component.paused).toBeFalse();
    });

    it('startTimer should call stopTimer and setTimer if paused is false', fakeAsync(() => {
        const stopTimerSpy = spyOn(component as any, 'stopTimer').and.stub();
        component.paused = false;
        component.startTimer();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(1000 / component.speed);
        expect(stopTimerSpy).toHaveBeenCalled();
        expect(component.time).toBe(1);
        clearInterval(component.timer);
    }));

    it('startTimer should not call stopTimer if paused is true', () => {
        const stopTimerSpy = spyOn(component as any, 'stopTimer').and.stub();
        component.paused = true;
        component.startTimer();
        expect(stopTimerSpy).not.toHaveBeenCalled();
    });

    it('restart should set time to 0 and call startTimer', () => {
        const startTimerSpy = spyOn(component, 'startTimer').and.stub();
        component.restartSignal = false;
        component.restart();
        expect(component.time).toBe(0);
        expect(startTimerSpy).toHaveBeenCalled();
        expect(component.restartSignal).toBeTrue();
    });

    it('incrementTime should increment time by penalty time', () => {
        component.time = 0;
        component.incrementTimer();
        expect(component.time).toBe(component.data.penaltyTime);
    });

    it('stopTimer should clear timer', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        component.startTimer();
        (component as any).stopTimer();
        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
