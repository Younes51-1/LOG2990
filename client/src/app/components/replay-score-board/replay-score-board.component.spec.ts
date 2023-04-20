import { SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameData, GameRoom, UserGame } from '@app/interfaces/game';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
import { ReplayScoreBoardComponent } from './replay-score-board.component';

describe('ReplayScoreBoardComponent', () => {
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
    const gameRoom: GameRoom = { userGame, roomId: 'testRoom', started: false, gameMode: 'mode Classique' };

    let component: ReplayScoreBoardComponent;
    let fixture: ComponentFixture<ReplayScoreBoardComponent>;
    let actions: InstructionReplay[];

    beforeEach(async () => {
        actions = [
            { type: Instruction.Error, timeStart: 0 },
            { type: Instruction.DiffFound, timeStart: 1 },
        ];
        await TestBed.configureTestingModule({
            declarations: [ReplayScoreBoardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayScoreBoardComponent);
        component = fixture.componentInstance;
        component.gameRoom = gameRoom;
        component.actions = actions;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should assign values on init', () => {
        expect(component.nbDiff).toBe(0);
        expect(component.difficulty).toBe('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toBe(component.actions[0]);
    });

    it('should reset the counter and differences and currentAction when restartSignal changes', () => {
        component.counter = 5;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).firstChange = false;
        const changes: SimpleChanges = {
            restartSignal: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
        };
        component.ngOnChanges(changes);
        expect(component.counter).toEqual(1);
        expect(component.differencesFound).toEqual(0);
        expect(component.opponentDifferencesFound).toEqual(0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toEqual(actions[0]);
    });

    it('should inc opponentDifferencesFound', () => {
        const actionsMessage = { type: Instruction.DiffFound, timeStart: 0, nbDifferences: 1, username: 'user' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).currentAction = actionsMessage;
        component.time = 0;
        component.counter = 0;
        component.opponentUsername = 'user';
        component.opponentDifferencesFound = 0;
        component.ngOnChanges({} as SimpleChanges);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toEqual(actions[0]);
        expect(component.opponentDifferencesFound).toEqual(1);
    });

    it('should inc differencesFound', () => {
        const actionsMessage = { type: Instruction.DiffFound, timeStart: 0, nbDifferences: 1, username: 'user' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).currentAction = actionsMessage;
        component.time = 0;
        component.counter = 0;
        component.opponentDifferencesFound = 0;
        component.ngOnChanges({} as SimpleChanges);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toEqual(actions[0]);
        expect(component.differencesFound).toEqual(1);
    });

    it('getMinutes should return the minutes', () => {
        component.time = 60;
        expect(component.getMinutes()).toEqual(1);
    });

    it('getMinutes should return the max minutes', () => {
        component.time = 200;
        component.timeEnd = 120;
        expect(component.getMinutes()).toEqual(2);
    });

    it('getMinutes should return the minutes', () => {
        component.time = 61;
        expect(component.getSeconds()).toEqual(1);
    });

    it('getMinutes should return the max minutes', () => {
        component.time = 200;
        component.timeEnd = 121;
        expect(component.getSeconds()).toEqual(1);
    });
});
