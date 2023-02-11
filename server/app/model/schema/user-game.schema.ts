import { GameData } from '@app/model/dto/game/game-data.dto';
import { Timer } from '@app/model/schema/timer.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UserGame {
    @ApiProperty()
    username: string;

    @ApiProperty()
    gameData: GameData;

    @ApiProperty()
    nbDifferenceToFind: number;

    @ApiProperty()
    timer: Timer;
}
