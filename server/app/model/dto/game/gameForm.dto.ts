import { BestTime } from '@app/model/schema/bestTimes.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class GameForm {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    nbDifference: number;

    @ApiProperty()
    @IsString()
    soloBestTimes: BestTime[];

    @ApiProperty()
    @IsString()
    vsBestTimes: BestTime[];
}
