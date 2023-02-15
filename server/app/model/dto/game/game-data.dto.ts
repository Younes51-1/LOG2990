import { ApiProperty } from '@nestjs/swagger';
import { GameForm } from '@app/model/dto/game/game-form.dto';

export class GameData {
    @ApiProperty()
    gameForm: GameForm;

    @ApiProperty()
    differenceMatrix: number[][];
}
