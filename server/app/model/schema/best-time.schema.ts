import { ApiProperty } from '@nestjs/swagger';

export class BestTime {
    @ApiProperty()
    name: string;

    @ApiProperty()
    time: number;
}
