import { ApiProperty } from '@nestjs/swagger';
import { GameForm } from './game-form.dto';

export class GameData {
    @ApiProperty()
    gameForm: GameForm;

    @ApiProperty()
    differenceMatrix: number[][];
}
