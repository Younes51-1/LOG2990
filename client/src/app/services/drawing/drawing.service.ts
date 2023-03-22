import { Injectable } from '@angular/core';
import { DrawModes, ForegroundState } from '@app/interfaces/creation-game';
import { CreationGamePageComponent } from '@app/pages/creation-game-page/creation-game-page.component';
import { Vec2 } from 'src/app/interfaces/vec2';
import { MouseButton } from 'src/assets/variables/mouse-button';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    private component: CreationGamePageComponent;
    private width: number;
    private height: number;

    setComponent(component: CreationGamePageComponent) {
        this.component = component;
        this.width = this.component.width;
        this.height = this.component.height;
    }

    handleCanvasEvent(eventType: string, event: MouseEvent, canvas: HTMLCanvasElement) {
        if (eventType === 'mousedown' && this.component.drawMode !== DrawModes.NOTHING) {
            this.emptyRedoStack();
            this.component.currentCanvas = canvas;
            this.pushToUndoStack();
        }

        if (this.component.currentCanvas === canvas) {
            let context = this.component.contextForeground1;
            if (canvas === this.component.canvas2.nativeElement) {
                context = this.component.contextForeground2;
            }

            switch (eventType) {
                case 'mousedown':
                    this.handleMouseDown(event, context);
                    break;
                case 'mousemove':
                    this.handleMouseMove(event, context);
                    break;
                case 'mouseup':
                    this.handleMouseUp();
                    break;
                case 'mouseleave':
                    this.handleMouseLeave(event, context);
                    break;
                case 'mouseenter':
                    this.handleMouseEnter(event);
                    break;
            }
        }
        this.updateCanvas1Display();
        this.updateCanvas2Display();
    }

    pushToUndoStack() {
        const canvas = this.createNewCanvas();
        const ctx = canvas.getContext('2d');

        if (this.component.currentCanvas === this.component.canvas1.nativeElement) {
            ctx?.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
            this.component.belongsToCanvas1 = true;
        } else {
            ctx?.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
            this.component.belongsToCanvas1 = false;
        }
        this.component.undo.push({ layer: canvas, belonging: this.component.belongsToCanvas1, swap: false });
    }

    emptyRedoStack() {
        this.component.redo = [];
    }

    handleMouseUp() {
        this.component.mousePressed = false;
    }

    updateRectangle() {
        this.drawRectangle(this.component.rectangleContext, this.component.mousePosition);
        this.updateCanvas1Display();
        this.updateCanvas2Display();
    }

    createNewCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
    }

    ctrlZ() {
        if (this.component.undo.length > 0) {
            const state = this.component.undo.pop();
            if (state?.swap) {
                this.component.swapForegrounds();
                this.component.redo.push({ layer: document.createElement('canvas'), belonging: true, swap: true });
            } else {
                const canvas = this.getCanvasAndUpdate(state);
                this.component.redo.push({ layer: canvas, belonging: this.component.belongsToCanvas1, swap: false });
            }
        }
    }

    ctrlShiftZ() {
        if (this.component.redo.length > 0) {
            const state = this.component.redo.pop();
            if (state?.swap) {
                this.component.swapForegrounds();
                this.component.undo.push({ layer: document.createElement('canvas'), belonging: true, swap: true });
            } else {
                const canvas = this.getCanvasAndUpdate(state);
                this.component.undo.push({ layer: canvas, belonging: this.component.belongsToCanvas1, swap: false });
            }
        }
    }

    private updateCanvas1Display() {
        if (!this.component.urlPath1 || this.component.urlPath1.trim() === '') {
            this.component.context1.fillStyle = 'white';
            this.component.context1.fillRect(0, 0, this.width, this.height);
            this.component.context1.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
        } else {
            this.component.updateContext(this.component.context1, this.component.canvasForeground1, this.component.urlPath1);
        }
    }

    private updateCanvas2Display() {
        if (!this.component.urlPath2 || this.component.urlPath2.trim() === '') {
            this.component.context2.fillStyle = 'white';
            this.component.context2.fillRect(0, 0, this.width, this.height);
            this.component.context2.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
        } else {
            this.component.updateContext(this.component.context2, this.component.canvasForeground2, this.component.urlPath2);
        }
    }

    private handleMouseDown(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (event.button === MouseButton.Left) {
            this.component.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.component.mousePressed = true;
            this.component.mouseInCanvas = true;
            switch (this.component.drawMode) {
                case DrawModes.PENCIL: {
                    context.fillStyle = this.component.color;
                    this.drawCircle(context, this.component.mousePosition);
                    break;
                }
                case DrawModes.RECTANGLE: {
                    this.component.rectangleContext = context;
                    this.component.rectangleState.context.fillStyle = this.component.color;
                    this.component.rectangleState.startPos = this.component.mousePosition;
                    this.component.canvasTemp.context.clearRect(0, 0, this.width, this.height);
                    if (context === this.component.contextForeground1) {
                        this.component.canvasTemp.context.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                    } else {
                        this.component.canvasTemp.context.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                    }
                    break;
                }
                case DrawModes.ERASER: {
                    this.eraseSquare(context, this.component.mousePosition);
                    break;
                }
                // No default
            }
        }
    }

    private handleMouseMove(event: MouseEvent, context: CanvasRenderingContext2D) {
        if (event.button === MouseButton.Left) {
            const finish: Vec2 = { x: event.offsetX, y: event.offsetY };

            if (this.component.mousePressed && this.component.mouseInCanvas) {
                switch (this.component.drawMode) {
                    case DrawModes.PENCIL: {
                        this.traceShape(context, this.component.mousePosition, finish);
                        break;
                    }
                    case DrawModes.RECTANGLE: {
                        this.drawRectangle(context, finish);
                        break;
                    }
                    case DrawModes.ERASER: {
                        this.traceShape(context, this.component.mousePosition, finish);
                        break;
                    }
                    // No default
                }
            }
        }
    }

    private handleMouseLeave(event: MouseEvent, context: CanvasRenderingContext2D) {
        this.component.mouseInCanvas = false;
        this.component.mousePosition = { x: event.offsetX, y: event.offsetY };

        if (this.component.mousePressed) {
            const finish: Vec2 = { x: event.offsetX, y: event.offsetY };
            if (this.component.drawMode === DrawModes.PENCIL || this.component.drawMode === DrawModes.ERASER) {
                this.traceShape(context, this.component.mousePosition, finish);
            } else if (this.component.drawMode === DrawModes.RECTANGLE) {
                this.drawRectangle(context, finish);
            }
        }
    }

    private handleMouseEnter(event: MouseEvent) {
        if (this.component.drawMode !== DrawModes.NOTHING) {
            this.component.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.component.mouseInCanvas = true;
        }
    }

    private drawRectangle(context: CanvasRenderingContext2D, pos: Vec2) {
        const x = this.component.rectangleState.startPos.x;
        const y = this.component.rectangleState.startPos.y;
        let width = pos.x - x;
        let height = pos.y - y;
        if (this.component.shiftPressed) {
            const length = Math.min(Math.abs(width), Math.abs(height));
            width = width < 0 ? -length : length;
            height = height < 0 ? -length : length;
        }
        this.component.rectangleState.context.clearRect(0, 0, this.width, this.height);
        this.component.rectangleState.context.fillRect(x, y, width, height);
        context.clearRect(0, 0, this.width, this.height);
        context.drawImage(this.component.canvasTemp.canvas, 0, 0, this.width, this.height);
        context.drawImage(this.component.rectangleState.canvas, 0, 0, this.width, this.height);
        this.component.mousePosition = pos;
    }

    private drawCircle(context: CanvasRenderingContext2D, position: Vec2) {
        context.beginPath();
        context.arc(position.x, position.y, this.component.pencilSize, 0, 2 * Math.PI);
        context.fill();
    }

    private eraseSquare(context: CanvasRenderingContext2D, position: Vec2) {
        context.clearRect(
            position.x - this.component.eraserSize,
            position.y - this.component.eraserSize,
            2 * this.component.eraserSize,
            2 * this.component.eraserSize,
        );
    }

    private traceShape(context: CanvasRenderingContext2D, start: Vec2, finish: Vec2) {
        context.lineWidth = this.component.eraserSize * 2;
        let slopeY = (finish.y - start.y) / (finish.x - start.x);
        if (start.x < finish.x) {
            for (let i = start.x; i <= finish.x; i++) {
                this.drawShape(context, { x: i, y: start.y + slopeY * (i - start.x) });
            }
        } else {
            slopeY = -slopeY;
            for (let i = start.x; i >= finish.x; i--) {
                this.drawShape(context, { x: i, y: start.y + slopeY * (start.x - i) });
            }
        }

        let slopeX = (finish.x - start.x) / (finish.y - start.y);
        if (start.y < finish.y) {
            for (let i = start.y; i <= finish.y; i++) {
                this.drawShape(context, { x: start.x + slopeX * (i - start.y), y: i });
            }
        } else {
            slopeX = -slopeX;
            for (let i = start.y; i >= finish.y; i--) {
                this.drawShape(context, { x: start.x + slopeX * (start.y - i), y: i });
            }
        }
        this.component.mousePosition = { x: finish.x, y: finish.y };
    }

    private drawShape(context: CanvasRenderingContext2D, position: Vec2) {
        if (this.component.drawMode === DrawModes.PENCIL) {
            this.drawCircle(context, position);
        } else if (this.component.drawMode === DrawModes.ERASER) {
            this.eraseSquare(context, position);
        }
    }

    private getCanvasAndUpdate(state: ForegroundState | undefined): HTMLCanvasElement {
        const layer = state?.layer;
        const canvas = this.createNewCanvas();
        const ctx = canvas.getContext('2d');
        if (layer) {
            if (state.belonging) {
                ctx?.drawImage(this.component.canvasForeground1, 0, 0, this.width, this.height);
                this.component.belongsToCanvas1 = true;
                this.component.contextForeground1.clearRect(0, 0, this.width, this.height);
                this.component.contextForeground1.drawImage(layer, 0, 0, this.width, this.height);
                this.updateCanvas1Display();
            } else {
                ctx?.drawImage(this.component.canvasForeground2, 0, 0, this.width, this.height);
                this.component.belongsToCanvas1 = false;
                this.component.contextForeground2.clearRect(0, 0, this.width, this.height);
                this.component.contextForeground2.drawImage(layer, 0, 0, this.width, this.height);
                this.updateCanvas2Display();
            }
        }
        return canvas;
    }
}
