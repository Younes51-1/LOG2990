import { ApiProperty } from '@nestjs/swagger';

export class Timer {
    @ApiProperty()
    minutes: number;

    @ApiProperty()
    seconds: number;

    @ApiProperty()
    intervalId: number;
}
