import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';

enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mouseClick(event: MouseEvent, mousePosition: Vec2): Vec2 {
        if (event.button === MouseButton.Left) {
            return { x: event.offsetX, y: event.offsetY };
        }
        return mousePosition;
    }
}
