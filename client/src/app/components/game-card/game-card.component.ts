import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { GameData } from '@app/interfaces/game';
import { GameFinderService } from '@app/services/game-finder/game-finder.service';
import { GameSetupService } from '@app/services/game-setup/game-setup.service';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { options, PageKeys } from 'src/assets/variables/game-card-options';
import { Time } from 'src/assets/variables/time';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit, OnDestroy {
    @Input() page: PageKeys;
    @Input() slide: GameData;

    @Output() notify = new EventEmitter();
    @Output() deleteNotify = new EventEmitter();
    @Output() resetNotify = new EventEmitter();
    @Output() notifySelected = new EventEmitter<string>();

    routeOne: string;
    btnOne: string;
    routeTwo: string;
    btnTwo: string;

    applyBorder = false;
    showInput1 = false;
    showInput2 = false;
    inputValue1: string;
    inputValue2: string;
    gameExists = false;
    soloBestTime: { name: string; time: string }[];
    vsBestTime: { name: string; time: string }[];
    private dialogRef: MatDialogRef<WaitingRoomComponent>;

    // eslint-disable-next-line max-params
    constructor(
        private gameSetupService: GameSetupService,
        private dialog: MatDialog,
        private gameFinderService: GameFinderService,
        private verifyService: VerifyInputService,
    ) {}

    ngOnInit() {
        this.gameFinderService.gameMode = 'classic-mode';
        this.gameSetupService.gameMode = 'classic-mode';
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page];
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
        this.soloBestTime = [];
        this.vsBestTime = [];
        this.slide.soloBestTimes.forEach((time) => {
            this.soloBestTime.push({
                name: time.name,
                time: `${Math.floor(time.time / Time.Sixty)}:${(time.time % Time.Sixty).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`,
            });
        });
        this.slide.vsBestTimes.forEach((time) => {
            this.vsBestTime.push({
                name: time.name,
                time: `${Math.floor(time.time / Time.Sixty)}:${(time.time % Time.Sixty).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`,
            });
        });
        this.gameFinderService.gameExists$.subscribe((gameExists) => {
            this.gameExists = gameExists;
        });
    }

    focusInput() {
        setTimeout(() => {
            const input = document.querySelector('input');
            if (input) {
                input.focus();
            }
        }, 0);
    }

    onCardSelect() {
        this.notifySelected.emit(this.slide.name);
    }

    checkGame() {
        if (!this.gameExists) {
            this.gameFinderService.checkGame(this.slide.name);
        }
    }

    deleteCard() {
        this.deleteNotify.emit(this.slide.name);
    }

    resetCard() {
        this.resetNotify.emit(this.slide.name);
    }

    verifySoloInput() {
        if (!this.verifyService.verify(this.inputValue1)) {
            this.applyBorder = true;
        } else {
            this.startSoloGame();
        }
    }

    verifyMultiInput() {
        if (!this.verifyService.verify(this.inputValue2)) {
            this.applyBorder = true;
        } else {
            this.applyBorder = false;
            this.gameFinderService.connectSocket();
            this.createJoinMultiGame();
        }
    }

    ngOnDestroy() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    joinGame() {
        this.gameSetupService.joinGame(this.inputValue2, this.slide.name);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    private startSoloGame() {
        this.gameSetupService.initGameRoom(this.inputValue1, true);
        this.gameSetupService.initGameMode(this.slide.name);
        this.notify.emit(this.slide.name);
    }

    private createJoinMultiGame() {
        if (this.gameExists) {
            this.canJoinGame();
        } else {
            this.createGame();
        }
    }

    private createGame() {
        this.gameSetupService.initGameRoom(this.inputValue2, false);
        this.gameSetupService.initGameMode(this.slide.name);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    private canJoinGame() {
        this.gameFinderService.canJoinGame(this.inputValue2, this, this.slide.name);
    }
}
