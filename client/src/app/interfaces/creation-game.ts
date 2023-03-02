import { Vec2 } from '@app/interfaces/vec2';

export interface Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

export interface NumberArray {
    array: number[];
    length: number;
}

export enum DrawModes {
    PENCIL = 'pencil',
    RECTANGLE = 'rectangle',
    ERASER = 'eraser',
    NOTHING = '',
}

export interface ForegroundState {
    layer: HTMLCanvasElement;
    belonging: boolean;
    swap: boolean;
}

export interface Rectangle {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    startPos: Vec2;
}

export interface Canvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}
