import { TestBed } from '@angular/core/testing';
import { Vec2 } from '@app/interfaces/vec2';

import { MouseService } from '@app/services/mouse/mouse.service';

describe('MouseService', () => {
    let service: MouseService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MouseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('mouseHitDetect should assign the mouse position to mousePosition variable', () => {
        const expectedPosition: Vec2 = { x: 100, y: 200 };
        const mouseEvent = {
            offsetX: expectedPosition.x,
            offsetY: expectedPosition.y,
            button: 0,
        } as MouseEvent;
        const result = service.mouseClick(mouseEvent, expectedPosition);
        expect(result).toEqual(expectedPosition);
    });

    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const offset = 10;
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        const mouseEvent = {
            offsetX: expectedPosition.x + offset,
            offsetY: expectedPosition.y + offset,
            button: 1,
        } as MouseEvent;
        const result = service.mouseClick(mouseEvent, expectedPosition);
        expect(result).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(result).toEqual(expectedPosition);
    });
});
