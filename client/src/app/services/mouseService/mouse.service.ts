import { Injectable } from '@angular/core';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseButton } from 'src/assets/variables/mouse-button';

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
