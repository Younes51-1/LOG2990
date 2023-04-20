/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
import { ReplayPlayAreaComponent } from './replay-play-area.component';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { SimpleChanges } from '@angular/core';

describe('ReplayPlayAreaComponent', () => {
    let component: ReplayPlayAreaComponent;
    let fixture: ComponentFixture<ReplayPlayAreaComponent>;
    let playAreaService: jasmine.SpyObj<PlayAreaService>;
    let actions: InstructionReplay[];

    beforeEach(async () => {
        actions = [
            { type: Instruction.Error, timeStart: 0 },
            { type: Instruction.DiffFound, timeStart: 1 },
        ];
        playAreaService = jasmine.createSpyObj('PlayAreaService', [
            'cheatMode',
            'flashDifference',
            'errorAnswerVisuals',
            'createAndFillNewLayer',
            'handleImageLoad',
            'setContexts',
            'setComponent',
            'setSpeed',
            'setCheatMode',
            'updateCheatSpeed',
            'endCheatMode',
            'clearAsync',
            'startCheatMode',
            'endCheatMode',
            'playHint',
        ]);
        await TestBed.configureTestingModule({
            declarations: [ReplayPlayAreaComponent],
            providers: [{ provide: PlayAreaService, useValue: playAreaService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayPlayAreaComponent);
        component = fixture.componentInstance;
        component.actions = actions;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('shoud return width and height of the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.width).toEqual(640);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(component.height).toEqual(480);
    });

    it('should set component to playAreaService on init', () => {
        expect(playAreaService.setComponent).toHaveBeenCalledWith(component, true);
        expect((component as any).currentAction).toEqual(actions[0]);
    });

    it('should set Contexts and call initializePauseCanvas after init', () => {
        component.image1 = 'https://picsum.photos/id/28/200/300';
        component.image2 = 'https://picsum.photos/id/83/200/300';
        const initializePauseCanvasSpy = spyOn(component as any, 'initializePauseCanvas').and.stub();
        component.ngAfterViewInit();
        expect(playAreaService.setContexts).toHaveBeenCalled();
        expect(initializePauseCanvasSpy).toHaveBeenCalled();
        expect(component.original.src).toBe('https://picsum.photos/id/28/200/300');
        expect(component.modified.src).toBe('https://picsum.photos/id/83/200/300');
    });

    it('should call handleImageLoad when original image is loaded', (done) => {
        playAreaService.handleImageLoad.and.stub();
        (component as any).original.src = 'https://picsum.photos/id/88/200/300';
        component.ngAfterViewInit();
        (component as any).original.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(playAreaService.handleImageLoad).toHaveBeenCalledWith((component as any).context1, (component as any).original);
            done();
        }, 0);
    });

    it('should call handleImageLoad when modified image is loaded', (done) => {
        playAreaService.handleImageLoad.and.stub();
        (component as any).modified.src = 'https://picsum.photos/id/88/200/300';
        component.ngAfterViewInit();
        (component as any).modified.dispatchEvent(new Event('load'));
        setTimeout(() => {
            expect(playAreaService.handleImageLoad).toHaveBeenCalledWith((component as any).context1, (component as any).modified);
            done();
        }, 0);
    });

    it('should call endCheatMode in ngOnDestroy', () => {
        playAreaService.endCheatMode.and.stub();
        component.ngOnDestroy();
        expect(playAreaService.endCheatMode).toHaveBeenCalled();
    });

    it('should call setSpeed and updateCheatSpeed on change', () => {
        component.speed = 1;
        component.ngOnChanges({} as SimpleChanges);
        expect(playAreaService.setSpeed).toHaveBeenCalledWith(1);
        expect(playAreaService.updateCheatSpeed).toHaveBeenCalled();
    });

    it('should call continue on continue signal', () => {
        const continueSpy = spyOn(component as any, 'continue').and.stub();
        const changes: SimpleChanges = {
            continueSignal: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
        };
        (component as any).firstChange = false;
        component.ngOnChanges(changes);
        expect(continueSpy).toHaveBeenCalled();
    });

    it('should call continue on restart signal', () => {
        const restartSpy = spyOn(component as any, 'restart').and.stub();
        const changes: SimpleChanges = {
            restartSignal: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
        };
        (component as any).firstChange = false;
        component.ngOnChanges(changes);
        expect(restartSpy).toHaveBeenCalled();
    });

    it('should call continue on pause signal', () => {
        const pauseSpy = spyOn(component as any, 'pause').and.stub();
        const changes: SimpleChanges = {
            pauseSignal: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
        };
        (component as any).firstChange = false;
        component.ngOnChanges(changes);
        expect(pauseSpy).toHaveBeenCalled();
    });

    it('should call endCheatMode if currentAction is undefined', () => {
        playAreaService.endCheatMode.and.stub();
        (component as any).currentAction = undefined;
        component.ngOnChanges({} as SimpleChanges);
        expect(playAreaService.endCheatMode).toHaveBeenCalled();
    });

    it('should call handle replay if time start is inf to time', () => {
        const handleReplaySpy = spyOn(component as any, 'handleReplay').and.stub();
        (component as any).currentAction = { type: Instruction.Error, timeStart: 0 };
        component.time = 1;
        component.ngOnChanges({} as SimpleChanges);
        expect(handleReplaySpy).toHaveBeenCalled();
        expect((component as any).currentAction).toEqual(actions[1]);
    });

    it('restart should call contine if clearAsync, and audio pause', () => {
        playAreaService.clearAsync.and.stub();
        const audioValidSpy = spyOn((component as any).audioValid, 'pause').and.stub();
        const audioInvalidSpy = spyOn((component as any).audioInvalid, 'pause').and.stub();
        const continueSpy = spyOn(component as any, 'continue').and.stub();
        (component as any).currentAction = { type: Instruction.Error, timeStart: 0 };
        component.time = 1;
        (component as any).paused = true;
        (component as any).restart();
        expect(playAreaService.clearAsync).toHaveBeenCalled();
        expect(audioValidSpy).toHaveBeenCalled();
        expect(audioInvalidSpy).toHaveBeenCalled();
        expect(continueSpy).toHaveBeenCalled();
        expect((component as any).counter).toBe(1);
        expect((component as any).srcCounter).toBe(0);
        expect((component as any).currentAction).toEqual(actions[0]);
    });

    it('pause should not call changeActiveContext if pause is true', () => {
        const changeActiveContextSpy = spyOn(component as any, 'changeActiveContext').and.stub();
        (component as any).paused = true;
        (component as any).pause();
        expect(changeActiveContextSpy).not.toHaveBeenCalled();
    });

    it('pause should call changeActiveContext twice', () => {
        const changeActiveContextSpy = spyOn(component as any, 'changeActiveContext').and.stub();
        (component as any).paused = false;
        (component as any).pause();
        expect((component as any).paused).toBeTruthy();
        expect(changeActiveContextSpy).toHaveBeenCalledTimes(2);
    });

    it('continue should not call changeActiveContext if pause is false', () => {
        const changeActiveContextSpy = spyOn(component as any, 'changeActiveContext').and.stub();
        (component as any).paused = false;
        (component as any).continue();
        expect(changeActiveContextSpy).not.toHaveBeenCalled();
    });

    it('pause should call changeActiveContext twice', () => {
        const changeActiveContextSpy = spyOn(component as any, 'changeActiveContext').and.stub();
        (component as any).paused = true;
        (component as any).continue();
        expect((component as any).paused).toBeFalse();
        expect(changeActiveContextSpy).toHaveBeenCalledTimes(2);
    });

    it('handleReplay should not call playAreaService methodes if currentAction is undefined', () => {
        playAreaService.flashDifference.and.stub();
        playAreaService.errorAnswerVisuals.and.stub();
        playAreaService.startCheatMode.and.stub();
        playAreaService.endCheatMode.and.stub();
        playAreaService.playHint.and.stub();
        (component as any).currentAction = undefined;
        (component as any).handleReplay();
        expect(playAreaService.flashDifference).not.toHaveBeenCalled();
        expect(playAreaService.errorAnswerVisuals).not.toHaveBeenCalled();
        expect(playAreaService.startCheatMode).not.toHaveBeenCalled();
        expect(playAreaService.endCheatMode).not.toHaveBeenCalled();
        expect(playAreaService.playHint).not.toHaveBeenCalled();
    });

    it('handleReplay should call flashDifference and playAudio if currentAction is diffFound', () => {
        playAreaService.flashDifference.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.DiffFound, timeStart: 0, difference: { x: 0, y: 0 } };
        (component as any).handleReplay();
        expect(playAreaService.flashDifference).toHaveBeenCalled();
        expect(playAudioSpy).toHaveBeenCalled();
    });

    it('handleReplay should not call flashDifference and playAudio if currentAction is diffFound but diffrence is undefined', () => {
        playAreaService.flashDifference.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.DiffFound, timeStart: 0 };
        (component as any).handleReplay();
        expect(playAreaService.flashDifference).not.toHaveBeenCalled();
        expect(playAudioSpy).not.toHaveBeenCalled();
    });

    it('handleReplay should call errorAnswerVisuals and playAudio if currentAction is Error with canva1 if it is leftCanvas is true', () => {
        playAreaService.errorAnswerVisuals.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.Error, timeStart: 0, mousePosition: { x: 0, y: 0 }, leftCanvas: true };
        (component as any).handleReplay();
        expect(playAreaService.errorAnswerVisuals).toHaveBeenCalledWith(component.canvas1.nativeElement, { x: 0, y: 0 });
        expect(playAudioSpy).toHaveBeenCalled();
    });

    it('handleReplay should call errorAnswerVisuals and playAudio if currentAction is Error with canva2 if it is leftCanvas is false', () => {
        playAreaService.errorAnswerVisuals.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.Error, timeStart: 0, mousePosition: { x: 0, y: 0 }, leftCanvas: false };
        (component as any).handleReplay();
        expect(playAreaService.errorAnswerVisuals).toHaveBeenCalledWith(component.canvas2.nativeElement, { x: 0, y: 0 });
        expect(playAudioSpy).toHaveBeenCalled();
    });

    it('handleReplay should not call errorAnswerVisuals and playAudio if currentAction is Error but mousePosition is undefined', () => {
        playAreaService.errorAnswerVisuals.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.Error, timeStart: 0 };
        (component as any).handleReplay();
        expect(playAreaService.errorAnswerVisuals).not.toHaveBeenCalled();
        expect(playAudioSpy).not.toHaveBeenCalled();
    });

    it('handleReplay should call startCheatMode if currentAction is CheatModeStart', () => {
        playAreaService.startCheatMode.and.stub();
        const canvas = document.createElement('canvas');
        (component as any).currentAction = { type: Instruction.CheatModeStart, timeStart: 0, cheatLayer: canvas };
        (component as any).handleReplay();
        expect(playAreaService.startCheatMode).toHaveBeenCalled();
        expect((component as any).cheatLayer).toEqual(canvas);
    });

    it('handleReplay should not call startCheatMode if currentAction is CheatModeStart but diffrence is cheatLayer', () => {
        playAreaService.startCheatMode.and.stub();
        const playAudioSpy = spyOn(component as any, 'playAudio').and.stub();
        (component as any).currentAction = { type: Instruction.CheatModeStart, timeStart: 0 };
        (component as any).handleReplay();
        expect(playAreaService.startCheatMode).not.toHaveBeenCalled();
        expect(playAudioSpy).not.toHaveBeenCalled();
    });

    it('handleReplay should call endCheatMode if currentAction is CheatModeEnd', () => {
        playAreaService.endCheatMode.and.stub();
        (component as any).currentAction = { type: Instruction.CheatModeEnd, timeStart: 0 };
        (component as any).handleReplay();
        expect(playAreaService.endCheatMode).toHaveBeenCalled();
    });

    it('handleReplay should call playHint and emit if currentAction is Hint', () => {
        playAreaService.playHint.and.stub();
        const hintEmitSpy = spyOn((component as any).hintEvent, 'emit').and.stub();
        const canvas = document.createElement('canvas');
        (component as any).currentAction = { type: Instruction.Hint, timeStart: 0, mousePosition: { x: 0, y: 0 }, cheatLayer: canvas };
        (component as any).handleReplay();
        expect(hintEmitSpy).toHaveBeenCalled();
        expect(playAreaService.playHint).toHaveBeenCalled();
    });

    it('handleReplay should not call playHint if currentAction is Hint but cheatLayer is undefined', () => {
        playAreaService.playHint.and.stub();
        const hintEmitSpy = spyOn((component as any).hintEvent, 'emit').and.stub();
        (component as any).currentAction = { type: Instruction.Hint, timeStart: 0, mousePosition: { x: 0, y: 0 } };
        (component as any).handleReplay();
        expect(hintEmitSpy).toHaveBeenCalled();
        expect(playAreaService.playHint).not.toHaveBeenCalled();
    });

    it('handleReplay should not call playHint if currentAction is Hint but mousePosition is undefined', () => {
        playAreaService.playHint.and.stub();
        const canvas = document.createElement('canvas');
        const hintEmitSpy = spyOn((component as any).hintEvent, 'emit').and.stub();
        (component as any).currentAction = { type: Instruction.Hint, timeStart: 0, cheatLayer: canvas };
        (component as any).handleReplay();
        expect(hintEmitSpy).toHaveBeenCalled();
        expect(playAreaService.playHint).not.toHaveBeenCalled();
    });

    it('initialize pause canvas should create new canvas and set it to pauseCanvas', () => {
        const canvas = document.createElement('canvas');
        (component as any).pauseCanvas1 = canvas;
        (component as any).pauseCanvas1.width = 10;
        (component as any).pauseCanvas1.height = 10;
        (component as any).pauseCanvas2 = canvas;
        (component as any).pauseCanvas2.width = 10;
        (component as any).pauseCanvas2.height = 10;
        (component as any).initializePauseCanvas();
        expect((component as any).pauseCanvas1.width).toEqual((component as any).width);
        expect((component as any).pauseCanvas1.height).toEqual((component as any).height);
        expect((component as any).pauseCanvas2.width).toEqual((component as any).width);
        expect((component as any).pauseCanvas2.height).toEqual((component as any).height);
    });

    it('changeActiveContext should set canvas 1 to context if firstContext is true', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvas1.width = 10;
        canvas1.height = 10;
        (component as any).changeActiveContext(canvas1, canvas2, true);
        expect((component as any).context1).toEqual(canvas1.getContext('2d'));
    });

    it('changeActiveContext should set canvas 2 to context if firstContext is false', () => {
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        canvas2.width = 10;
        canvas2.height = 10;
        (component as any).changeActiveContext(canvas1, canvas2, false);
        expect((component as any).context2).toEqual(canvas2.getContext('2d'));
    });

    it('should not call drawImage if context is null', () => {
        spyOn(window.HTMLCanvasElement.prototype, 'getContext').and.returnValue(null);
        const drawImageSpy = spyOn(window.CanvasRenderingContext2D.prototype, 'drawImage').and.stub();
        const canvas = document.createElement('canvas');
        (component as any).changeActiveContext(canvas, canvas, true);
        expect(drawImageSpy).not.toHaveBeenCalled();
    });

    it('playAudio should call play on audio', () => {
        spyOn((component as any).audioValid, 'pause');
        spyOn((component as any).audioInvalid, 'pause');
        const audio = new Audio();
        audio.src = '';
        (component as any).speed = 1;
        spyOn(audio, 'play').and.stub();
        (component as any).playAudio(audio);
        expect((component as any).audioValid.pause).toHaveBeenCalled();
        expect((component as any).audioInvalid.pause).toHaveBeenCalled();
        expect(audio.play).toHaveBeenCalled();
        expect(audio.playbackRate).toEqual(1);
    });
});
