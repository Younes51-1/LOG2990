import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WaitingRoomComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { GameForm } from '@app/interfaces/game';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { CommunicationSocketService } from '@app/services/communication-socket/communication-socket.service';
import { VerifyInputService } from '@app/services/verify-input/verify-input.service';
import { options, PageKeys } from 'src/assets/variables/game-card-options';

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
    createJoin = false;
    dialogRef: MatDialogRef<WaitingRoomComponent>;

    // eslint-disable-next-line max-params
    constructor(
        public classicModeService: ClassicModeService,
        private router: Router,
        private readonly socketService: CommunicationSocketService,
        public dialog: MatDialog,
        private verifyService: VerifyInputService,
    ) {}

    ngOnInit() {
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page];
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
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

    startSoloGame() {
        if (this.page === PageKeys.Selection) {
            this.classicModeService.initClassicMode(this.slide.name, this.inputValue1, true);
            this.router.navigate([this.routeOne]);
        }
        this.notify.emit(this.slide.name);
    }

    createJoinMultiGame() {
        if (this.page === PageKeys.Selection && !this.gameExists) {
            this.createGame();
            this.createJoin = true;
        } else if (this.page === PageKeys.Selection && this.gameExists) {
            this.canJoinGame();
        }
    }

    createGame() {
        this.classicModeService.initClassicMode(this.slide.name, this.inputValue2, false);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
    }

    canJoinGame() {
        this.socketService.send('canJoinGame', [this.slide.name, this.inputValue2]);
        this.socketService.on('cannotJoinGame', () => {
            this.applyBorder = false;
            this.classicModeService.disconnectSocket();
        });
        this.socketService.on('canJoinGame', () => {
            this.joinGame();
            this.createJoin = true;
        });
    }

    joinGame() {
        this.classicModeService.joinWaitingRoomClassicModeMulti(this.slide.name, this.inputValue2);
        this.notify.emit(this.slide);
        this.dialogRef = this.dialog.open(WaitingRoomComponent, { disableClose: true, width: '80%', height: '80%' });
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
            this.classicModeService.connectSocket();
            this.createJoinMultiGame();
        }
    }

    ngOnDestroy() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
}
