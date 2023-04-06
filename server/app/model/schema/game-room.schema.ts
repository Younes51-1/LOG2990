import { ApiProperty } from '@nestjs/swagger';
import { UserGame } from '@app/model/schema/user-game.schema';

export class GameRoom {
    @ApiProperty()
    userGame: UserGame;

    @ApiProperty()
    roomId: string;

    @ApiProperty()
    started: boolean;

    @ApiProperty()
    gameMode: string;
}
