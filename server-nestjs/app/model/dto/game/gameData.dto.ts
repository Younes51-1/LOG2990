import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { GameForm } from './gameForm.dto';

export class GameData {
    @ApiProperty()
    gameForm: GameForm;

    @ApiProperty()
    @IsString()
    differenceMatrix: string;
}
