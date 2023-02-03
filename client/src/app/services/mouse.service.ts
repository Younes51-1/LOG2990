import { Injectable } from '@angular/core';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';

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
