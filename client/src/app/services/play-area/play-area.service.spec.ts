/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef, NgModule } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ReplayPlayAreaComponent } from '@app/components/replay-components/replay-play-area/replay-play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { DetectionDifferenceService } from '@app/services/detection-difference/detection-difference.service';
import { PlayAreaService } from '@app/services/play-area/play-area.service';
import { Color } from 'src/assets/variables/color';
import { PossibleColor } from 'src/assets/variables/images-values';
import { Dimensions } from 'src/assets/variables/picture-dimension';
import { Time } from 'src/assets/variables/time';

@NgModule({
    imports: [HttpClientModule, OverlayModule, MatDialogModule, BrowserAnimationsModule],
})
export class DynamicTestModule {}

describe('PlayAreaService', () => {
    let service: PlayAreaService;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let component: PlayAreaComponent;
    let replayComponent: ReplayPlayAreaComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, AppRoutingModule, DynamicTestModule],
            providers: [PlayAreaService, PlayAreaComponent, ReplayPlayAreaComponent, DetectionDifferenceService],
        });
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        replayComponent = TestBed.inject(ReplayPlayAreaComponent);
        service = TestBed.inject(PlayAreaService);
        (service as any).normalComponent = component;
        (service as any).replayComponent = replayComponent;
        fixture.detectChanges();
        component.ngAfterViewInit();
        replayComponent.ngAfterViewInit();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set playAreaComponent', () => {
        spyOn(service, 'endCheatMode').and.stub();
        service.setComponent(component, false);
        expect((service as any).component).toEqual(component);
        expect((service as any).replay).toBeFalsy();
        expect((service as any).normalComponent).toEqual(component);
    });

    it('should set ReplayPlayAreaComponent', () => {
        spyOn(service, 'endCheatMode').and.stub();
        service.setComponent(replayComponent, true);
        expect((service as any).component).toEqual(replayComponent);
        expect((service as any).replay).toBeTruthy();
        expect((service as any).replayComponent).toEqual(replayComponent);
    });

    it('should setCheatMode', () => {
        service.setCheatMode();
        expect((service as any).isCheatModeOn).toBeFalsy();
    });

    it('should set speed', () => {
        service.setSpeed(1);
        expect((service as any).speed).toEqual(1);
    });

    it('should clearAsync', () => {
        spyOn(window, 'clearInterval').and.stub();
        service.clearAsync();
        expect(window.clearInterval).toHaveBeenCalled();
    });

    it('should start confetti without coordinates', fakeAsync(() => {
        service.setComponent(component, false);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        spyOn(Math, 'random').and.returnValue(0.5);
        spyOn(window, 'setTimeout').and.callThrough();
        spyOn(window, 'setInterval').and.callThrough();
        service.setSpeed(1);
        service.startConfetti(undefined);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        tick(15000);
        expect((service as any).intervalId).toBeDefined();
        expect(window.setInterval).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should create a canvas element when given coordinates', (done) => {
        const canvas = document.createElement('canvas');
        spyOn(canvas, 'getContext').and.callThrough();
        spyOn(document, 'createElement').and.returnValue(canvas);
        service.startConfetti({ x: 100, y: 200 });
        setTimeout(() => {
            // eslint-disable-next-line deprecation/deprecation
            expect(document.createElement).toHaveBeenCalledWith('canvas');
            expect(canvas.getContext).toHaveBeenCalledWith('2d');
            done();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    });

    it('should not start cheat mode if component contexts are not set', () => {
        spyOn(service, 'endCheatMode');
        (service as any).component.context1 = null;
        (service as any).component.context2 = null;
        service.cheatMode();
        expect(service.endCheatMode).not.toHaveBeenCalled();
    });

    it('should end cheat mode if cheat mode is not on', () => {
        spyOn(service, 'endCheatMode');
        service.isCheatModeOn = false;
        service.cheatMode();
        expect(service.endCheatMode).toHaveBeenCalled();
    });

    it('should emit sendCheatEnd event if cheat mode is not on and replay is not set', () => {
        spyOn((service as any).normalComponent.sendCheatEnd, 'emit');
        service.isCheatModeOn = false;
        (service as any).replay = false;
        service.cheatMode();
        expect((service as any).normalComponent.sendCheatEnd.emit).toHaveBeenCalled();
    });

    it('should start cheat mode if cheat mode is on', () => {
        spyOn(service, 'startCheatMode');
        service.isCheatModeOn = true;
        service.cheatMode();
        expect(service.startCheatMode).toHaveBeenCalled();
    });

    it('should do nothing if replay is true', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        (service as any).replay = true;
        service.hintMode(1);
        expect(service.startConfetti).not.toHaveBeenCalled();
        expect((service as any).playNormalHint).not.toHaveBeenCalled();
    });

    it('should call startConfetti and sendHint with hintNum 2 if diffCoords is found and hintNum is 2', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        spyOn((service as any).normalComponent.sendHint, 'emit');
        spyOn((service as any).normalComponent, 'verifyDifferenceMatrix');
        (service as any).normalComponent.differenceMatrix = [[]];
        spyOn((service as any).detectionDifferenceService, 'findRandomDifference').and.returnValue({ x: 10, y: 20 });
        service.hintMode(2);
        expect(service.startConfetti).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect((service as any).normalComponent.sendHint.emit).toHaveBeenCalledWith({
            hintNum: 2,
            diffPos: { x: 10, y: 20 },
            layer: (service as any).normalComponent.layer,
        });
        expect((service as any).normalComponent.verifyDifferenceMatrix).not.toHaveBeenCalled();
        expect((service as any).playNormalHint).not.toHaveBeenCalled();
    });

    it('should call verifyDifferenceMatrix with the dial choice and sendHint with the hintNum and diffCoords if hintNum is not 2', () => {
        spyOn(service, 'startConfetti');
        spyOn(service as any, 'playNormalHint');
        spyOn((service as any).normalComponent.sendHint, 'emit');
        spyOn((service as any).normalComponent, 'verifyDifferenceMatrix');
        (service as any).normalComponent.differenceMatrix = [[]];
        spyOn((service as any).detectionDifferenceService, 'findRandomDifference').and.returnValue({ x: 10, y: 20 });
        spyOn(service as any, 'chooseDial').and.returnValue('c');
        service.hintMode(1);
        expect(service.startConfetti).not.toHaveBeenCalled();
        expect((service as any).normalComponent.sendHint.emit).toHaveBeenCalledWith({
            hintNum: 1,
            diffPos: { x: 10, y: 20 },
            layer: (service as any).normalComponent.layer,
        });
        expect((service as any).normalComponent.verifyDifferenceMatrix).toHaveBeenCalledWith('hint', 'c');
        expect((service as any).playNormalHint).toHaveBeenCalled();
    });

    it('should call startConfetti if hintNum is 2', () => {
        spyOn(service, 'startConfetti');
        const canvas = document.createElement('canvas');
        service.playHint(2, canvas, { x: 10, y: 20 });
        expect(service.startConfetti).toHaveBeenCalledWith({ x: 10, y: 20 });
    });

    it('should call playNormalHint if hintNum is not 2', () => {
        spyOn(service as any, 'playNormalHint');
        const canvas = document.createElement('canvas');
        service.playHint(1, canvas, { x: 10, y: 20 });
        expect((service as any).playNormalHint).toHaveBeenCalledWith(canvas);
    });

    it('should start the cheat mode in the play mode', fakeAsync(() => {
        (service as any).replay = true;
        (service as any).replayCheatOn = false;
        service.startCheatMode();
        expect((service as any).replayCheatOn).toBeTrue();
        service.endCheatMode();
    }));

    it('should start the cheat mode in the replay mode', fakeAsync(() => {
        (service as any).replay = false;
        (service as any).replayCheatOn = false;
        const verifyDifferenceMatrixSpy = spyOn((service as any).normalComponent, 'verifyDifferenceMatrix').and.callFake(() => {
            return;
        });
        service.startCheatMode();
        expect((service as any).replayCheatOn).toBeFalse();
        expect(verifyDifferenceMatrixSpy).toHaveBeenCalled();
        service.endCheatMode();
    }));

    it('should clear interval and update contexts', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.stub();
        service.endCheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledWith((service as any).cheatInterval);
        expect(updateContextsSpy).toHaveBeenCalled();
    });

    it('should set replayCheatOn to false in replay', () => {
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.stub();
        (service as any).replay = true;
        (service as any).replayCheatOn = true;
        service.endCheatMode();
        expect(clearIntervalSpy).toHaveBeenCalledWith((service as any).cheatInterval);
        expect(updateContextsSpy).toHaveBeenCalled();
        expect((service as any).replayCheatOn).toBeFalse();
    });

    it('cheatInterval should show the cheat mode', (done) => {
        (service as any).replay = true;
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.callFake(() => {
            return;
        });
        const drawImageContext1Spy = spyOn((service as any).component.context1, 'drawImage').and.callFake(() => {
            return;
        });
        const drawImageContext2Spy = spyOn((service as any).component.context2, 'drawImage').and.callFake(() => {
            return;
        });
        service.startCheatMode();
        setTimeout(() => {
            expect(updateContextsSpy).toHaveBeenCalled();
            expect(drawImageContext1Spy).toHaveBeenCalled();
            expect(drawImageContext2Spy).toHaveBeenCalled();
            done();
            service.endCheatMode();
        }, Time.Thousand);
    });

    it('should set context1 and context2 to canvas contexts', () => {
        const context = document.createElement('canvas').getContext('2d');
        spyOn((service as any).component.canvas1.nativeElement, 'getContext').and.returnValue(context);
        spyOn((service as any).component.canvas2.nativeElement, 'getContext').and.returnValue(context);
        service.setContexts();
        expect(component.context1).toBe(context as CanvasRenderingContext2D);
        expect(component.context2).toBe(context as CanvasRenderingContext2D);
    });

    it('should not set context1 and context2 if canvas contexts are null', () => {
        spyOn(service, 'endCheatMode').and.stub();
        (service as any).component.context1 = null;
        (service as any).component.context2 = null;
        spyOn((service as any).component.canvas1.nativeElement, 'getContext').and.returnValue(null);
        spyOn((service as any).component.canvas2.nativeElement, 'getContext').and.returnValue(null);
        service.setContexts();
        expect((service as any).component.context1).toBeNull();
        expect((service as any).component.context2).toBeNull();
    });

    it('should not flash difference if one of the context is null', () => {
        spyOn(service, 'endCheatMode').and.stub();
        const matrix = [
            [1, 2, 3],
            [2, 1, 0],
        ];
        (service as any).component.context1 = null;
        (service as any).replay = true;
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        service.flashDifference(matrix);
        expect(clearIntervalSpy).not.toHaveBeenCalled();
    });

    it('should flash difference in replay mode', (done) => {
        const matrix = [
            [1, 2, 3],
            [2, 1, 0],
        ];
        (service as any).replay = true;
        (service as any).component.cheatLayer = document.createElement('canvas');
        (service as any).component.modified = new Image();
        (service as any).replayComponent.cheatLayers = [{}, {}];
        (service as any).replayComponent.sources = ['', ''];
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.callFake(() => {
            return;
        });
        service.flashDifference(matrix);
        setTimeout(() => {
            expect(updateContextsSpy).toHaveBeenCalled();
            expect(clearIntervalSpy).toHaveBeenCalled();
            done();
        }, Time.Thousand * 2);
    });

    it('should flash difference in play mode', (done) => {
        const matrix = [
            [1, 2, 3],
            [2, 1, 0],
        ];
        (service as any).replay = false;
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        const removeDifferenceSpy = spyOn(service as any, 'removeDifference').and.callFake(() => {
            return;
        });
        service.flashDifference(matrix);
        setTimeout(() => {
            expect(clearIntervalSpy).toHaveBeenCalled();
            expect(removeDifferenceSpy).toHaveBeenCalled();
            done();
        }, Time.Thousand);
    });

    it('should show "ERREUR" on the canvas1', () => {
        (service as any).replay = false;
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.callFake(() => {
            return;
        });
        const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();
        const canvas = document.createElement('canvas');
        (service as any).component.canvas1 = new ElementRef(canvas);
        service.errorAnswerVisuals(canvas, { x: 0, y: 0 });
        expect(updateContextsSpy).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should show "ERREUR" on the canvas2', () => {
        (service as any).replay = false;
        const updateContextsSpy = spyOn(service as any, 'updateContexts').and.callFake(() => {
            return;
        });
        const clearTimeoutSpy = spyOn(window, 'clearTimeout').and.callThrough();
        const canvas = document.createElement('canvas');
        (service as any).component.canvas2 = new ElementRef(canvas);
        service.errorAnswerVisuals(canvas, { x: 0, y: 0 });
        expect(updateContextsSpy).toHaveBeenCalled();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should create and fill a new layer of the canvas', () => {
        const matrix = [
            [1, 2, 3],
            [2, 1, 0],
        ];
        const layer = service.createAndFillNewLayer(Color.Luigi, false, false, matrix);
        expect(layer.getContext('2d')?.globalAlpha).toEqual(1);
    });

    it('should handle the image load', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = new Image();
        if (context) {
            const drawImageSpy = spyOn(context, 'drawImage').and.callFake(() => {
                return;
            });
            service.handleImageLoad(context, image);
            expect(drawImageSpy).toHaveBeenCalled();
        }
    });

    it('should flash the difference', () => {
        const matrix = [
            [1, 2, 3],
            [2, 1, 0],
        ];
        const extractDifferenceSpy = spyOn((service as any).detectionDifferenceService, 'extractDifference').and.callFake(() => {
            return matrix;
        });
        const flashDifferenceSpy = spyOn(service as any, 'flashDifference').and.callFake(() => {
            return;
        });
        service.correctAnswerVisuals({ x: 0, y: 0 }, matrix);
        expect(extractDifferenceSpy).toHaveBeenCalled();
        expect(flashDifferenceSpy).toHaveBeenCalled();
    });

    it('should update the cheat speed if replayCheatOn is true', () => {
        (service as any).replayCheatOn = true;
        const startCheatModeSpy = spyOn(service as any, 'startCheatMode').and.callFake(() => {
            return;
        });
        const endCheatModeSpy = spyOn(service as any, 'endCheatMode').and.callFake(() => {
            return;
        });
        service.updateCheatSpeed();
        expect(startCheatModeSpy).toHaveBeenCalled();
        expect(endCheatModeSpy).toHaveBeenCalled();
    });

    it('should not update the cheat speed if replayCheatOn is false', () => {
        (service as any).replayCheatOn = false;
        const startCheatModeSpy = spyOn(service as any, 'startCheatMode').and.callFake(() => {
            return;
        });
        const endCheatModeSpy = spyOn(service as any, 'endCheatMode').and.callFake(() => {
            return;
        });
        service.updateCheatSpeed();
        expect(startCheatModeSpy).not.toHaveBeenCalled();
        expect(endCheatModeSpy).not.toHaveBeenCalled();
    });

    it('should call drawImage with layer and have expected behavior', (done) => {
        const layer = document.createElement('canvas');
        const spyTimeout = spyOn(window, 'clearTimeout');
        const spyInterval = spyOn(window, 'clearInterval');
        const spyCtx1 = spyOn((service as any).component.context1, 'drawImage').and.callThrough();
        const spyCtx2 = spyOn((service as any).component.context2, 'drawImage').and.callThrough();
        const spyUpdateCtx = spyOn(service as any, 'updateContexts');
        (service as any).hintTimeout = 0;
        (service as any).playNormalHint(layer);
        setTimeout(() => {
            expect(spyTimeout).toHaveBeenCalled();
            expect(spyInterval).toHaveBeenCalledWith((service as any).hintInterval);
            expect(spyInterval).toHaveBeenCalled();
            expect(spyCtx1).toHaveBeenCalledWith(layer, 0, 0, Dimensions.DEFAULT_WIDTH, Dimensions.DEFAULT_HEIGHT);
            expect(spyCtx2).toHaveBeenCalledWith(layer, 0, 0, Dimensions.DEFAULT_WIDTH, Dimensions.DEFAULT_HEIGHT);
            expect(spyUpdateCtx).toHaveBeenCalled();
            expect(spyUpdateCtx).toHaveBeenCalledTimes(Time.Thousand / Time.OneHundredTwentyFive + 1);
            done();
        }, Time.Thousand * 2);
    });

    it('remove difference should update the differenceMatrix', () => {
        const spy = spyOn((service as any).normalComponent, 'verifyDifferenceMatrix');
        const newDiffMatrix = [
            [PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL],
            [PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL],
            [PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL, PossibleColor.EMPTYPIXEL],
        ];
        (service as any).normalComponent.differenceMatrix = newDiffMatrix;
        (service as any).normalComponent.differenceMatrix[0][0] = PossibleColor.WHITE;
        (service as any).normalComponent.differenceMatrix[1][2] = PossibleColor.BLACK;
        (service as any).removeDifference((service as any).normalComponent.differenceMatrix);
        expect((service as any).normalComponent.differenceMatrix).toEqual(newDiffMatrix);
        expect(spy).toHaveBeenCalledOnceWith('cheat');
    });

    it('remove difference should emit sendSource event', () => {
        const matrix = [[]];
        const spy = spyOn((service as any).normalComponent.sendSource, 'emit');
        const image = new Image();
        image.src = 'source';
        const layer = document.createElement('canvas');
        (service as any).component.modified = image;
        (service as any).component.cheatLayer = layer;
        (service as any).normalComponent.differenceMatrix = matrix;
        (service as any).removeDifference((service as any).normalComponent.differenceMatrix);
        expect(spy).toHaveBeenCalledWith({ src: image.src, layer });
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return correct dialMatrix for first hint', () => {
        const dim = { width: 320, height: 240 };
        const dialMatrix1 = (service as any).chooseDial({ x: 239, y: 319 }, 0);
        const dialMatrix2 = (service as any).chooseDial({ x: 239, y: 321 }, 0);
        const dialMatrix3 = (service as any).chooseDial({ x: 241, y: 319 }, 0);
        const dialMatrix4 = (service as any).chooseDial({ x: 241, y: 321 }, 0);
        expect(dialMatrix1).toEqual((service as any).createPopulateMatrix({ x: 0, y: 0 }, { x: dim.height, y: dim.width }));
        expect(dialMatrix2).toEqual((service as any).createPopulateMatrix({ x: 0, y: dim.width }, { x: dim.height, y: dim.width * 2 }));
        expect(dialMatrix3).toEqual((service as any).createPopulateMatrix({ x: dim.height, y: 0 }, { x: dim.height * 2, y: dim.width }));
        expect(dialMatrix4).toEqual((service as any).createPopulateMatrix({ x: dim.height, y: dim.width }, { x: dim.height * 2, y: dim.width * 2 }));
    });

    it('should return correct dialMatrix for second hint', () => {
        const coords = { x: 3, y: 4 };
        const dim = { width: 160, height: 120 };
        const matrix = (service as any).chooseDial(coords, 1);
        const four = 4;
        const sixteen = 16;
        const dialMatrix = new Array(four);
        for (let i = 0; i < sixteen; i++) {
            const topLeft = { x: (i % four) * dim.height, y: Math.floor(i / four) * dim.width };
            const bottomRight = { x: topLeft.x + dim.height, y: topLeft.y + dim.width };
            dialMatrix[i] = (service as any).createPopulateMatrix(topLeft, bottomRight);
        }
        const dialIndex = Math.floor(coords.y / dim.width) * four + Math.floor(coords.x / dim.height);
        expect(matrix).toEqual(dialMatrix[dialIndex]);
    });

    it('should return empty array when called with incorrect dial number', () => {
        const array = (service as any).chooseDial({ x: 0, y: 0 }, 3);
        expect(array).toEqual([]);
    });

    it('should fill the matrix in black between start and end', () => {
        const start = { x: 5, y: 5 };
        const end = { x: 10, y: 10 };
        (service as any).setComponent(component);
        const diffMatrix = (service as any).createPopulateMatrix(start, end);
        for (let i = 0; i < Dimensions.DEFAULT_HEIGHT; i++) {
            for (let j = 0; j < Dimensions.DEFAULT_WIDTH; j++) {
                if (i >= start.x && i < end.x && j >= start.y && j < end.y) {
                    expect(diffMatrix[i][j]).toEqual(PossibleColor.BLACK);
                } else {
                    expect(diffMatrix[i][j]).toEqual(PossibleColor.EMPTYPIXEL);
                }
            }
        }
    });

    it('updateContexts should draw initials images on canvas', () => {
        const spy1 = spyOn((service as any).component.context1, 'drawImage');
        const spy2 = spyOn((service as any).component.context2, 'drawImage');
        (service as any).updateContexts();
        expect(spy1).toHaveBeenCalledOnceWith((service as any).component.original, 0, 0, Dimensions.DEFAULT_WIDTH, Dimensions.DEFAULT_HEIGHT);
        expect(spy2).toHaveBeenCalledOnceWith((service as any).component.modified, 0, 0, Dimensions.DEFAULT_WIDTH, Dimensions.DEFAULT_HEIGHT);
    });
});
