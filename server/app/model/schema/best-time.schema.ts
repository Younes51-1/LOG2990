import { ApiProperty } from '@nestjs/swagger';

export class BestTime {
    @ApiProperty({
        default: 'defaultPlayer',
    })
    name: string;

    @ApiProperty({
        default: '1:00',
    })
    time: string;
}
