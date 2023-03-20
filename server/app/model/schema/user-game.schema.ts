import { GameData } from '@app/model/dto/game/game-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserGame {
    @ApiProperty()
    username1: string;

    @ApiProperty()
    username2?: string;

    @ApiProperty()
    potentielPlayers: string[];

    @ApiProperty()
    gameData: GameData;

    @ApiProperty()
    nbDifferenceFound: number;

    @ApiProperty()
    timer: number;
}
