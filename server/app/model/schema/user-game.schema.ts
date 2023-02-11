import { GameData } from '@app/model/dto/game/game-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserGame {
    @ApiProperty()
    username: string;

    @ApiProperty()
    gameData: GameData;

    @ApiProperty()
    nbDifferenceFound: number;

    @ApiProperty()
    timer: number;
}