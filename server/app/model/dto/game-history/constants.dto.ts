import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Constants {
    @ApiProperty()
    @IsNumber()
    initialTime: number;

    @ApiProperty()
    @IsNumber()
    penaltyTime: number;

    @ApiProperty()
    @IsNumber()
    bonusTime: number;
}
