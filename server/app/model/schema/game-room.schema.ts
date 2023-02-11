import { ApiProperty } from '@nestjs/swagger';
import { UserGame } from './user-game.schema';

export class GameRoom {
    @ApiProperty()
    userGame: UserGame;

    @ApiProperty()
    roomId: string;
}
