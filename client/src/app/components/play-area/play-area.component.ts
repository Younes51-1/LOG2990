import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { DifferenceTry } from '@app/interfaces/difference-try';
import { GameRoom } from '@app/interfaces/game';
import { Vec2 } from '@app/interfaces/vec2';
import { GameService } from '@app/services/game/game.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Color } from 'src/assets/variables/color';
import { PossibleColor } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnChanges {
    @ViewChild('canvas1', { static: false }) canvas1: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: false }) canvas2: ElementRef<HTMLCanvasElement>;

    @Input() gameRoom: GameRoom;
    @Output() toggleHint = new EventEmitter();
    @Output() userError = new EventEmitter();
    @Output() sendImage = new EventEmitter<{ src: string; first: boolean }>();
    @Output() sendDiff = new EventEmitter<{ diff: number[][] }>();
    @Output() sendError = new EventEmitter<{ pos: Vec2; leftCanvas: boolean }>();
    @Output() sendSource = new EventEmitter<{ src: string; layer: HTMLCanvasElement }>();
    @Output() sendCheatStart = new EventEmitter<{ layer: HTMLCanvasElement }>();
    @Output() sendCheatEnd = new EventEmitter();
    @Output() sendHint = new EventEmitter<{ hintNum: number; diffPos: Vec2; layer: HTMLCanvasElement }>();

    context1: CanvasRenderingContext2D;
    context2: CanvasRenderingContext2D;
    original = new Image();
    modified = new Image();
    cheatLayer: HTMLCanvasElement;
    hintLayer: HTMLCanvasElement;
    differenceMatrix: number[][];
    playerIsAllowedToClick = true;
    mousePosition: Vec2 = { x: 0, y: 0 };
    private canvasClicked: HTMLCanvasElement;
    private buttonPressed = '';
    private audioValid = new Audio('assets/sounds/valid_sound.mp3');
    private audioInvalid = new Audio('assets/sounds/invalid_sound.mp3');
    private canvasSize = { x: Dimensions.DefaultWidth, y: Dimensions.DefaultHeight };

    constructor(private mouseService: MouseService, private gameService: GameService, private playAreaService: PlayAreaService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('document:keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (this.gameService.getIsTyping()) {
            return;
        }
        this.buttonPressed = event.key;
        if (this.buttonPressed === 't') {
            this.playAreaService.isCheatModeOn = !this.playAreaService.isCheatModeOn;
            this.playAreaService.cheatMode();
        }
        if (this.buttonPressed === 'i' && !this.gameRoom.userGame.username2) {
            this.toggleHint.emit();
        }
    }

    ngAfterViewInit() {
        this.playAreaService.setSpeed(1);
        this.playAreaService.setComponent(this, false);
        this.playAreaService.setContexts();
        this.playAreaService.setCheatMode();
        this.gameRoom = this.gameService.gameRoom;
        this.gameService.serverValidateResponse$.subscribe((difference: DifferenceTry) => {
            if (difference.validated) {
                this.correctRetroaction(difference.differencePos);
            } else if (difference.username === this.gameService.username) {
                this.errorRetroaction(this.canvasClicked);
            }
        });
    }

    ngOnChanges() {
        if (this.gameService.gameRoom && this.gameRoom?.userGame?.gameData) {
            this.differenceMatrix = this.gameRoom.userGame.gameData.differenceMatrix;
            this.original.src = this.gameRoom.userGame.gameData.image1url;
            this.modified.src = this.gameRoom.userGame.gameData.image2url;
            this.sendImage.emit({ src: this.original.src, first: true });
            this.sendImage.emit({ src: this.modified.src, first: false });
        }

        this.original.crossOrigin = 'Anonymous'; // needed to get access to images of server
        this.modified.crossOrigin = 'Anonymous';

        this.original.onload = () => {
            this.playAreaService.handleImageLoad(this.context1, this.original);
        };

        this.modified.onload = () => {
            this.playAreaService.handleImageLoad(this.context2, this.modified);
        };
    }

    async mouseClickAttempt(event: MouseEvent, canvas: HTMLCanvasElement) {
        if (this.playerIsAllowedToClick) {
            this.mousePosition = this.mouseService.mouseClick(event, this.mousePosition);
            const isValidated = this.differenceMatrix[this.mousePosition.y][this.mousePosition.x] !== PossibleColor.EMPTYPIXEL;
            if (isValidated) {
                this.gameService.sendServerValidate(this.mousePosition);
                this.canvasClicked = canvas;
            } else {
                this.errorRetroaction(canvas);
            }
        }
    }

    verifyDifferenceMatrix(option: string, matrix?: number[][]) {
        if (option === 'cheat') {
            this.cheatLayer = this.playAreaService.createAndFillNewLayer(Color.Cheat, true, false, this.differenceMatrix);
        } else if (option === 'hint' && matrix) {
            this.hintLayer = this.playAreaService.createAndFillNewLayer(Color.Hint, false, true, matrix);
        }
    }

    nextGame() {
        if (!this.gameService.isLimitedTimeMode()) return;
        this.gameService.nextGame();
        this.gameService.changeTime(this.gameService.gameConstants.bonusTime);
        this.ngOnChanges();
        if (this.playAreaService.isCheatModeOn) {
            this.playAreaService.endCheatMode();
            this.playAreaService.startCheatMode();
        }
    }

    private correctRetroaction(differencePos: Vec2) {
        this.playerIsAllowedToClick = false;
        this.audioValid.pause();
        this.audioValid.currentTime = 0;
        this.audioValid.play();
        this.playAreaService.correctAnswerVisuals(differencePos, this.differenceMatrix);
    }

    private errorRetroaction(canvas: HTMLCanvasElement) {
        this.playerIsAllowedToClick = false;
        this.audioInvalid.play();
        this.playAreaService.errorAnswerVisuals(canvas, this.mousePosition);
        this.userError.emit();
    }
}
