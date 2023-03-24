import { ApiProperty } from '@nestjs/swagger';

export class EndGame {
    @ApiProperty()
    winner: boolean;

    @ApiProperty()
    roomId: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    timer: number;

    @ApiProperty()
    gameFinished: boolean;
}
