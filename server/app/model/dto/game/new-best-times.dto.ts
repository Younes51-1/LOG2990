import { ApiProperty } from '@nestjs/swagger';

export class NewBestTime {
    @ApiProperty()
    gameName: string;

    @ApiProperty()
    isSolo: boolean;

    @ApiProperty()
    name: string;

    @ApiProperty()
    time: number;
}
