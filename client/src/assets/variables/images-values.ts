/* eslint-disable @typescript-eslint/no-magic-numbers */
export enum AsciiLetterValue {
    B = 66,
    M = 77,
}

export enum OffsetValues {
    WIDTH = 18,
    HEIGHT = 22,
    DHP = 28,
    OFFSET = 10,
}

export enum BitPerPixel {
    BitPerPixel = 24,
}

export enum PossibleRadius {
    ZERO = 0,
    THREE = 3,
    NINE = 9,
    FIFTEEN = 15,
}

export enum PossibleColor {
    BLACK = 0,
    WHITE = 255,
    EMPTYPIXEL = -1,
}

export const PIXEL_SIZE = 4;
