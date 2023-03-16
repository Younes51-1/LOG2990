import { BestTime } from '@app/model/schema/best-times.schema';
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
    image1url: string;

    @ApiProperty()
    @IsString()
    image2url: string;

    @ApiProperty()
    @IsString()
    difficulty: string;

    @ApiProperty()
    @IsString()
    soloBestTimes: BestTime[];

    @ApiProperty()
    @IsString()
    vsBestTimes: BestTime[];
}
