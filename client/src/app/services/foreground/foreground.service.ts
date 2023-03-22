import { Injectable } from '@angular/core';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';

@Injectable({
    providedIn: 'root',
})
export class ForegroundService {
    private component: CreationGamePageComponent;
    private width: number;
    private height: number;

    setComponent(component: CreationGamePageComponent) {
        this.component = component;
        this.width = this.component.width;
        this.height = this.component.height;
    }

    updateImageDisplay(event: Event, input: HTMLInputElement): void {
        if (event) {
            const file = (event.target as HTMLInputElement).files;
            if (file) {
                const urlPath = URL.createObjectURL(file[0]);
                switch (input) {
                    case this.component.inputImage1.nativeElement: {
                        this.component.urlPath1 = urlPath;
                        this.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
                        this.component.image1 = this.component.inputImage1.nativeElement;
                        break;
                    }
                    case this.component.inputImage2.nativeElement: {
                        this.component.urlPath2 = urlPath;
                        this.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
                        this.component.image2 = this.component.inputImage2.nativeElement;
                        break;
                    }
                    case this.component.inputImages1et2.nativeElement: {
                        this.component.urlPath1 = this.component.urlPath2 = urlPath;
                        this.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
                        this.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
                        this.component.image1 = this.component.image2 = this.component.inputImages1et2.nativeElement;
                        break;
                    }
                    // No default
                }
            }
        }
    }

    updateContext(context: CanvasRenderingContext2D, canvasForeground: HTMLCanvasElement, background: string): void {
        const imageToDraw = new Image();
        imageToDraw.src = background;
        imageToDraw.onload = () => {
            context.drawImage(imageToDraw, 0, 0, this.width, this.height);
            context.drawImage(canvasForeground, 0, 0, this.width, this.height);
        };
    }

    reset(input: HTMLElement): void {
        switch (input) {
            case this.component.inputImage1.nativeElement: {
                this.component.inputImage1.nativeElement.value = null;
                this.component.urlPath1 = '';
                this.clearRectWithWhite(this.component.context1);
                this.component.context1.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                break;
            }
            case this.component.inputImage2.nativeElement: {
                this.component.inputImage2.nativeElement.value = null;
                this.component.urlPath2 = '';
                this.clearRectWithWhite(this.component.context2);
                this.component.context2.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            case this.component.inputImages1et2.nativeElement: {
                this.component.inputImage1.nativeElement.value = null;
                this.component.inputImage2.nativeElement.value = null;
                this.component.inputImages1et2.nativeElement.value = null;
                this.component.urlPath1 = this.component.urlPath2 = '';
                this.clearRectWithWhite(this.component.context1);
                this.clearRectWithWhite(this.component.context2);
                this.component.context1.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                this.component.context2.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            case this.component.canvas1.nativeElement: {
                this.component.currentCanvas = this.component.canvas1.nativeElement;
                this.component.pushToUndoStack();
                this.component.emptyRedoStack();
                this.component.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.clearRectWithWhite(this.component.context1);
                this.component.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
                break;
            }
            case this.component.canvas2.nativeElement: {
                this.component.currentCanvas = this.component.canvas2.nativeElement;
                this.component.pushToUndoStack();
                this.component.emptyRedoStack();
                this.component.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.clearRectWithWhite(this.component.context2);
                this.component.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
                break;
            }
            // No default
        }
    }

    duplicateForeground(input: HTMLCanvasElement) {
        this.component.emptyRedoStack();
        switch (input) {
            case this.component.canvas1.nativeElement: {
                this.component.currentCanvas = this.component.canvas2.nativeElement;
                this.component.pushToUndoStack();
                this.component.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.clearRectWithWhite(this.component.context2);
                this.component.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
                this.component.contextForeground2.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                this.component.context2.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                break;
            }
            case this.component.canvas2.nativeElement: {
                this.component.currentCanvas = this.component.canvas1.nativeElement;
                this.component.pushToUndoStack();
                this.component.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.clearRectWithWhite(this.component.context1);
                this.component.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
                this.component.contextForeground1.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                this.component.context1.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                break;
            }
            // No default
        }
    }

    pushAndSwapForegrounds() {
        this.component.undo.push({ layer: document.createElement('canvas'), belonging: true, swap: true });
        this.component.emptyRedoStack();
        this.swapForegrounds();
    }

    swapForegrounds() {
        const canvasTemp = document.createElement('canvas');
        canvasTemp.width = this.width;
        canvasTemp.height = this.height;
        const contextTemp = canvasTemp.getContext('2d');
        if (contextTemp === null) return;
        contextTemp.drawImage(this.component.canvasForeground1, 0, 0);

        this.component.contextForeground1.clearRect(0, 0, this.width, this.height);
        this.clearRectWithWhite(this.component.context1);
        this.component.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
        this.component.contextForeground1.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
        this.component.context1.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);

        this.component.contextForeground2.clearRect(0, 0, this.width, this.height);
        this.clearRectWithWhite(this.component.context2);
        this.component.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
        this.component.contextForeground2.drawImage(canvasTemp, 0, 0, this.width, this.height);
        this.component.context2.drawImage(canvasTemp, 0, 0, this.width, this.height);
    }

    clearRectWithWhite(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, this.width, this.height);
    }
}
