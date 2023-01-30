import { ApiProperty } from '@nestjs/swagger';
import { GameForm } from './gameForm.dto';

export class GameData {
    @ApiProperty()
    gameForm: GameForm;

    @ApiProperty()
    differenceMatrix: number[][];
}
