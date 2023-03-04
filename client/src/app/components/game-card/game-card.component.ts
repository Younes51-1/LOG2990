import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { options, PageKeys } from 'src/assets/variables/game-card-options';
import { GameForm } from '@app/interfaces/game';
import { Router } from '@angular/router';
import { ClassicModeService } from '@app/services/classicMode/classic-mode.service';
import { CommunicationSocketService } from '@app/services/communicationSocket/communication-socket.service';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit, OnDestroy {
    @Input() page: PageKeys;
    @Input() slide: GameForm;

    @Output() notify = new EventEmitter();

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

    constructor(public classicModeService: ClassicModeService, private router: Router, private readonly socketService: CommunicationSocketService) {}
    ngOnInit() {
        const { routeOne, btnOne, routeTwo, btnTwo } = options[this.page];
        this.routeOne = routeOne;
        this.btnOne = btnOne;
        this.routeTwo = routeTwo;
        this.btnTwo = btnTwo;
    }

    checkGame() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
        }

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

    btnOneEmitter() {
        if (this.page === PageKeys.Selection) {
            this.classicModeService.initClassicModeSolo(this.slide.name, this.inputValue1, true);
        }
        this.notify.emit(this.slide.name);
    }

    btnTwoEmitter() {
        if (this.page === PageKeys.Selection && !this.gameExists) {
            this.createGame();
        } else if (this.page === PageKeys.Selection && this.gameExists) {
            if (!this.socketService.isSocketAlive()) {
                this.socketService.connect();
            }

            this.canJoinGame();
        }
    }

    createGame() {
        this.socketService.disconnect();
        this.classicModeService.initClassicModeSolo(this.slide.name, this.inputValue2, false);
        this.notify.emit(this.slide);
        this.router.navigate([this.routeTwo]);
    }

    canJoinGame() {
        this.socketService.send('canJoinGame', [this.slide.name, this.inputValue2]);
        this.socketService.on('cannotJoinGame', () => {
            this.applyBorder = false;
            this.socketService.disconnect();
        });
        this.socketService.on('canJoinGame', () => {
            this.joinGame();
        });
    }

    joinGame() {
        this.socketService.disconnect();
        this.classicModeService.joinWaitingRoomClassicModeMulti(this.slide.name, this.inputValue2);
        this.notify.emit(this.slide);
        this.router.navigate([this.routeTwo]);
    }

    toggleBorder() {
        if (!this.verifyUserInput(this.inputValue1)) {
            this.applyBorder = false;
        } else {
            this.btnOneEmitter();
            this.router.navigate([this.routeOne]);
        }
    }

    // TODO: change CSS to show border
    toggleBorder2() {
        if (!this.verifyUserInput(this.inputValue2)) {
            this.applyBorder = false;
        } else {
            this.btnTwoEmitter();
        }
    }

    verifyUserInput(input: string): boolean {
        if (typeof input !== 'string') {
            return false;
        }

        if (/[\u200B-\u200D\uFEFF]/.test(input)) {
            return false;
        }

        if (input.trim().length === 0) {
            return false;
        }
        // TODO: add more WORDS
        const forbiddenWords = ['foo', 'bar', 'baz'];
        for (const word of forbiddenWords) {
            if (input.toLowerCase() === word.toLowerCase()) {
                return false;
            }
        }
        return true;
    }

    ngOnDestroy() {
        this.socketService.disconnect();
    }
}
