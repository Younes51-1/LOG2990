import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instruction, InstructionReplay } from '@app/interfaces/video-replay';
import { ReplayChatBoxComponent } from '@app/components/replay-components/replay-chat-box/replay-chat-box.component';
import { SimpleChanges } from '@angular/core';

describe('ReplayChatBoxComponent', () => {
    let component: ReplayChatBoxComponent;
    let fixture: ComponentFixture<ReplayChatBoxComponent>;
    let actions: InstructionReplay[];

    beforeEach(async () => {
        actions = [
            { type: Instruction.Error, timeStart: 0 },
            { type: Instruction.DiffFound, timeStart: 1 },
        ];
        await TestBed.configureTestingModule({
            declarations: [ReplayChatBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ReplayChatBoxComponent);
        component = fixture.componentInstance;
        component.actions = actions;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should assign the first action to currentAction on init', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toEqual(actions[0]);
    });

    it('should reset the counter and messages when restartSignal changes', () => {
        component.counter = 5;
        component.messages = [
            { message: 'hello', username: 'user1' },
            { message: 'hello', username: 'user2' },
        ];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).firstChange = false;
        const changes: SimpleChanges = {
            restartSignal: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true },
        };
        component.ngOnChanges(changes);
        expect(component.counter).toEqual(1);
        expect(component.messages).toEqual([]);
    });

    it('should assign the next action to currentAction if it is a message', () => {
        const actionsMessage = { type: Instruction.ChatMessage, timeStart: 0, message: { message: 'hello', username: 'user1' } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (component as any).currentAction = actionsMessage;
        component.time = 0;
        component.counter = 0;
        component.ngOnChanges({} as SimpleChanges);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((component as any).currentAction).toEqual(actions[0]);
        expect(component.messages).toEqual([actionsMessage.message]);
    });
});
