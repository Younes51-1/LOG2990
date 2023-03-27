import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { GameForm } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
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
    @Input() slide: GameForm;

    @Output() notify = new EventEmitter();
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

    // We need to disable the max-params rule because we need to inject all the services
    // eslint-disable-next-line max-params
    constructor(
        private classicModeService: ClassicModeService,
        private router: Router,
        private readonly socketService: CommunicationSocketService,
        private dialog: MatDialog,
        private verifyService: VerifyInputService,
    ) {}

    ngOnInit() {
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
                time: `${Math.floor(time.time / Time.MinInSec)}:${(time.time % Time.MinInSec).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`,
            });
        });
        this.slide.vsBestTimes.forEach((time) => {
            this.soloBestTime.push({
                name: time.name,
                time: `${Math.floor(time.time / Time.MinInSec)}:${(time.time % Time.MinInSec).toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                })}`,
            });
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
        this.classicModeService.connectSocket();

        if (!this.gameExists) {
            this.socketService.send('checkGame', this.slide.name);
        }

        this.socketService.on('gameFound', (gameName: string) => {
            if (gameName === this.slide.name) {
                this.gameExists = true;
            }
        });

        this.socketService.on('gameDeleted', (gameName: string) => {
            if (gameName === this.slide.name) {
                this.gameExists = false;
            }
        });
    }

    deleteCard() {
        this.notify.emit(this.slide.name);
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
            this.classicModeService.connectSocket();
            this.createJoinMultiGame();
        }
    }

    ngOnDestroy() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }

    private startSoloGame() {
        this.classicModeService.initClassicMode(this.slide.name, this.inputValue1, true);
        this.router.navigate([this.routeOne]);
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
        this.classicModeService.initClassicMode(this.slide.name, this.inputValue2, false);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    private canJoinGame() {
        this.socketService.send('canJoinGame', { gameName: this.slide.name, username: this.inputValue2 });
        this.socketService.on('cannotJoinGame', () => {
            this.applyBorder = true;
            this.classicModeService.disconnectSocket();
        });
        this.socketService.on('canJoinGame', () => {
            this.joinGame();
        });
    }

    private joinGame() {
        this.classicModeService.joinWaitingRoomClassicModeMulti(this.slide.name, this.inputValue2);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }
}
