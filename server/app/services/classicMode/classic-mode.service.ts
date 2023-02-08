import { EMPTY_PIXEL_VALUE } from '@app/constants';
import { UserGame } from '@app/model/schema/user-game.schema';
import { Vector2D } from '@app/model/schema/vector2d.schema';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class ClassicModeService {
    userGame: UserGame;

    constructor() {
        this.userGame = new UserGame();
    }

    initClassicMode(userGame: UserGame): void {
        this.userGame = userGame;
        this.userGame.nbDifferenceToFind = userGame.gameData.gameForm.nbDifference;
        this.userGame.timer = { minutes: 0, seconds: 0, intervalId: 0 };
    }

    validateDifference(differencePos: Vector2D): boolean {
        const validated = this.userGame.gameData.differenceMatrix[differencePos.y][differencePos.x] !== EMPTY_PIXEL_VALUE;
        if (validated) {
            this.userGame.nbDifferenceToFind--;
        }
        return validated;
    }

    isGameFinished(): boolean {
        return this.userGame.nbDifferenceToFind === 0;
    }
}
