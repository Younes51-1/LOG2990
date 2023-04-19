import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GameRoom } from '@app/interfaces/game';
import { InstructionReplay } from '@app/interfaces/video-replay';
import { Time } from 'src/assets/variables/time';
import { GameMode } from '@common/game-mode';

@Component({
    selector: 'app-replay-score-board',
    templateUrl: './replay-score-board.component.html',
    styleUrls: ['./replay-score-board.component.scss'],
})
export class ReplayScoreBoardComponent implements OnInit, OnChanges {
    @Input() gameRoom: GameRoom;
    @Input() gameName: string;
    @Input() opponentUsername: string;
    @Input() username: string;
    @Input() time: number;
    @Input() timeEnd: number;
    @Input() actions: InstructionReplay[];
    @Input() restartSignal: boolean;

    gameMode: string = GameMode.classicMode;
    difficulty: string;
    nbDiff: number;
    differencesFound = 0;
    opponentDifferencesFound = 0;
    counter: number = 0;
    private currentAction: InstructionReplay | undefined;
    private firstChange = true;

    ngOnInit(): void {
        if (this.gameRoom) {
            this.nbDiff = this.gameRoom.userGame.gameData.nbDifference;
            this.difficulty = this.gameRoom.userGame.gameData.difficulty;
            this.currentAction = this.actions[this.counter++];
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.firstChange) {
            if (changes.restartSignal) {
                this.counter = 0;
                this.differencesFound = 0;
                this.opponentDifferencesFound = 0;
                this.currentAction = this.actions[this.counter++];
            }
        }
        this.firstChange = false;
        if (this.currentAction && this.currentAction.nbDifferences) {
            if (this.currentAction.timeStart <= this.time) {
                if (this.opponentUsername === this.currentAction.username) this.opponentDifferencesFound++;
                else this.differencesFound++;
                this.currentAction = this.actions[this.counter++];
            }
        }
    }

    getMinutes() {
        const time = this.time >= this.timeEnd ? this.timeEnd : this.time;
        return Math.floor(time / Time.Sixty);
    }

    getSeconds() {
        const time = this.time >= this.timeEnd ? this.timeEnd : this.time;
        return time % Time.Sixty;
    }
}
